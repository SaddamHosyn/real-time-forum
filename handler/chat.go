// handler/chat.go
package handler

import (
    "encoding/json"
    "log"
    "net/http"
    "sort"        // ←  (needed for sort.Slice)
    "strconv"
    "strings"
    "time"        
    "realtimeforum/auth"
    "realtimeforum/database"
    "realtimeforum/model"
    "realtimeforum/websocket"
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
    log.Printf("🔵 WebSocket connection attempt")
    
    // Check authentication
    isLoggedIn, userID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        log.Printf("❌ WebSocket: User not authenticated")
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    log.Printf("✅ WebSocket: User authenticated - ID: %s", userID)

    // Get username from database
    var username string
    err := database.DB.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)
    if err != nil {
        log.Printf("❌ WebSocket: Error getting username: %v", err)
        http.Error(w, "User not found", http.StatusInternalServerError)
        return
    }
    
    log.Printf("✅ WebSocket: Username found: %s", username)

    // Use the upgrader from websocket package
    conn, err := websocket.UpgradeConnection(w, r)
    if err != nil {
        log.Printf("❌ WebSocket upgrade error: %v", err)
        return
    }
    
    log.Printf("✅ WebSocket: Connection upgraded successfully")

    client := &websocket.Client{
        ID:       userID,
        Username: username,
        Conn:     conn,
        Hub:      websocket.ChatHub,
        Send:     make(chan []byte, 256),
    }

    log.Printf("✅ WebSocket: Client created - ID: %s, Username: %s", client.ID, client.Username)
    
    // ✅ SIMPLE BLOCKING REGISTRATION (with buffered channel this won't block)
    client.Hub.Register <- client
    log.Printf("✅ WebSocket: Client registration sent to hub")

    // Start Read/Write pumps
    go client.WritePump()
    go client.ReadPump()
    
    log.Printf("✅ WebSocket: Read/Write pumps started for %s", username)
}

// Add this new handler for guest user list
func GetPublicUsersHandler(w http.ResponseWriter, r *http.Request) {
    // Return empty list or basic info for unauthenticated users
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode([]model.ChatUser{})
}

// Updated GetChatUsersHandler to handle unauthenticated users gracefully
func GetChatUsersHandler(w http.ResponseWriter, r *http.Request) {
    isLoggedIn, currentUserID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]model.ChatUser{})
        return
    }

    // ✅ FIXED QUERY: Handle string dates properly with proper COALESCE
    query := `
        SELECT DISTINCT 
            u.id, 
            u.username, 
            COALESCE(uo.is_online, 0) as is_online,
            COALESCE(uo.last_activity, u.created_at) as last_activity_str,
            COALESCE(cm.message, '') as last_message,
            COALESCE(cm.created_at, u.created_at) as last_message_time_str,
            COALESCE(unread.count, 0) as unread_count
        FROM users u
        LEFT JOIN user_online uo ON u.id = uo.user_id
        LEFT JOIN (
            SELECT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id
                    ELSE sender_id
                END as other_user_id,
                message,
                created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY CASE 
                        WHEN sender_id = ? THEN receiver_id
                        ELSE sender_id
                    END 
                    ORDER BY created_at DESC
                ) as rn
            FROM chat_messages 
            WHERE sender_id = ? OR receiver_id = ?
        ) cm ON u.id = cm.other_user_id AND cm.rn = 1
        LEFT JOIN (
            SELECT receiver_id, COUNT(*) as count
            FROM chat_messages 
            WHERE sender_id != ? AND receiver_id = ? AND is_read = 0
            GROUP BY receiver_id
        ) unread ON u.id = unread.receiver_id
        WHERE u.id != ?
        ORDER BY 
            CASE 
                WHEN cm.created_at IS NOT NULL THEN cm.created_at 
                ELSE u.username 
            END DESC
    `

    rows, err := database.DB.Query(query, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID)
    if err != nil {
        log.Printf("Error getting chat users: %v", err)
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]model.ChatUser{})
        return
    }
    defer rows.Close()

    users := make([]model.ChatUser, 0)
    
    for rows.Next() {
        var user model.ChatUser
        var lastActivityStr, lastMessageTimeStr string
        
        // ✅ FIXED: Scan strings first, then parse to time.Time
        err := rows.Scan(
            &user.ID, 
            &user.Username, 
            &user.IsOnline, 
            &lastActivityStr,
            &user.LastMessage, 
            &lastMessageTimeStr, 
            &user.UnreadCount,
        )
        if err != nil {
            log.Printf("Error scanning user row: %v", err)
            continue
        }

        // ✅ Parse string dates to time.Time with error handling
        if lastActivityStr != "" {
            if parsedTime, err := time.Parse("2006-01-02 15:04:05", lastActivityStr); err == nil {
                user.LastActivity = parsedTime
            } else if parsedTime, err := time.Parse(time.RFC3339, lastActivityStr); err == nil {
                user.LastActivity = parsedTime
            } else {
                user.LastActivity = time.Now() // fallback
            }
        } else {
            user.LastActivity = time.Now()
        }

        if lastMessageTimeStr != "" {
            if parsedTime, err := time.Parse("2006-01-02 15:04:05", lastMessageTimeStr); err == nil {
                user.LastMessageTime = parsedTime
            } else if parsedTime, err := time.Parse(time.RFC3339, lastMessageTimeStr); err == nil {
                user.LastMessageTime = parsedTime
            } else {
                user.LastMessageTime = time.Now() // fallback
            }
        } else {
            user.LastMessageTime = time.Now()
        }

        users = append(users, user)
    }

    // ✅ Sort users: by last message time (DESC), then alphabetically
    sort.Slice(users, func(i, j int) bool {
        // If both have messages, sort by message time (most recent first)
        if users[i].LastMessage != "" && users[j].LastMessage != "" {
            return users[i].LastMessageTime.After(users[j].LastMessageTime)
        }
        // If only one has messages, prioritize the one with messages
        if users[i].LastMessage != "" && users[j].LastMessage == "" {
            return true
        }
        if users[i].LastMessage == "" && users[j].LastMessage != "" {
            return false
        }
        // If neither has messages, sort alphabetically
        return users[i].Username < users[j].Username
    })

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
    
    log.Printf("Successfully returned %d users to client", len(users))
}

func GetChatMessagesHandler(w http.ResponseWriter, r *http.Request) {
    isLoggedIn, currentUserID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Extract user ID from URL path
    pathParts := strings.Split(r.URL.Path, "/")
    if len(pathParts) < 5 {
        http.Error(w, "Invalid URL", http.StatusBadRequest)
        return
    }
    
    otherUserID := pathParts[4]
    
    // Get pagination parameters
    page := 1
    if p := r.URL.Query().Get("page"); p != "" {
        if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
            page = parsed
        }
    }
    
    limit := 10
    offset := (page - 1) * limit

    query := `
        SELECT cm.id, cm.sender_id, cm.receiver_id, cm.message, cm.created_at, cm.is_read, u.username
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE (cm.sender_id = ? AND cm.receiver_id = ?) 
           OR (cm.sender_id = ? AND cm.receiver_id = ?)
        ORDER BY cm.created_at DESC
        LIMIT ? OFFSET ?
    `

    rows, err := database.DB.Query(query, currentUserID, otherUserID, otherUserID, currentUserID, limit, offset)
    if err != nil {
        log.Printf("Error getting chat messages: %v", err)
        w.Header().Set("Content-Type", "application/json")
        // ✅ Return empty array instead of error
        json.NewEncoder(w).Encode(map[string]interface{}{
            "messages": []model.ChatMessage{},
            "page":     page,
            "has_more": false,
        })
        return
    }
    defer rows.Close()

    // ✅ Initialize with empty slice, not nil
    messages := make([]model.ChatMessage, 0)
    
    for rows.Next() {
        var msg model.ChatMessage
        err := rows.Scan(&msg.ID, &msg.SenderID, &msg.ReceiverID, &msg.Message, 
                        &msg.CreatedAt, &msg.IsRead, &msg.SenderName)
        if err != nil {
            log.Printf("Error scanning message: %v", err)
            continue
        }
        messages = append(messages, msg)
    }

    // Reverse to show oldest first
    for i := len(messages)/2 - 1; i >= 0; i-- {
        opp := len(messages) - 1 - i
        messages[i], messages[opp] = messages[opp], messages[i]
    }

    // Mark messages as read
    markMessagesAsRead(currentUserID, otherUserID)

    w.Header().Set("Content-Type", "application/json")
    // ✅ Always return array, even if empty
    json.NewEncoder(w).Encode(map[string]interface{}{
        "messages": messages,
        "page":     page,
        "has_more": len(messages) == limit,
    })
    
    log.Printf("Returned %d messages for chat between %s and %s", len(messages), currentUserID, otherUserID)
}

func markMessagesAsRead(receiverID, senderID string) {
    query := `UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`
    database.DB.Exec(query, receiverID, senderID)
}
