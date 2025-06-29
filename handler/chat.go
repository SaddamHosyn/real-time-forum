


// handler/chat.go
package handler

import (
    "encoding/json"
    "log"
    "net/http"
    "sort"
    "strconv"
    "strings"
    "sync"
    "time"
    "realtimeforum/auth"
    "realtimeforum/database"
    "realtimeforum/model"
    "realtimeforum/websocket"
)

// ✅ NEW: Throttling mechanism for API requests
type RequestThrottler struct {
    requests map[string]time.Time
    mutex    sync.RWMutex
    limit    time.Duration
}

var (
    // ✅ Global throttler instances
    messageThrottler = &RequestThrottler{
        requests: make(map[string]time.Time),
        limit:    500 * time.Millisecond, // 500ms between message requests
    }
    userListThrottler = &RequestThrottler{
        requests: make(map[string]time.Time),
        limit:    200 * time.Millisecond, // 200ms between user list requests
    }
)

// ✅ Throttle check method
func (rt *RequestThrottler) isAllowed(userID string) bool {
    rt.mutex.Lock()
    defer rt.mutex.Unlock()
    
    now := time.Now()
    if lastRequest, exists := rt.requests[userID]; exists {
        if now.Sub(lastRequest) < rt.limit {
            log.Printf("🚫 Request throttled for user %s", userID)
            return false
        }
    }
    
    rt.requests[userID] = now
    return true
}

// ✅ Cleanup old entries periodically
func (rt *RequestThrottler) cleanup() {
    rt.mutex.Lock()
    defer rt.mutex.Unlock()
    
    now := time.Now()
    for userID, lastRequest := range rt.requests {
        if now.Sub(lastRequest) > rt.limit*10 { // Keep for 10x the limit
            delete(rt.requests, userID)
        }
    }
}

// ✅ Start cleanup goroutine
func init() {
    go func() {
        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()
        
        for range ticker.C {
            messageThrottler.cleanup()
            userListThrottler.cleanup()
        }
    }()
}




func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
    log.Printf("🔵 WebSocket connection attempt")
    
    isLoggedIn, userID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        log.Printf("❌ WebSocket: User not authenticated")
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    log.Printf("✅ WebSocket: User authenticated - ID: %s", userID)

    var username string
    err := database.DB.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)
    if err != nil {
        log.Printf("❌ WebSocket: Error getting username: %v", err)
        http.Error(w, "User not found", http.StatusInternalServerError)
        return
    }
    
    log.Printf("✅ WebSocket: Username found: %s", username)

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
    
    // ✅ FIXED: Update status immediately before registering
    websocket.UpdateUserOnlineStatus(userID, true)
    
    client.Hub.Register <- client
    log.Printf("✅ WebSocket: Client registration sent to hub")

    go client.WritePump()
    go client.ReadPump()
    
    log.Printf("✅ WebSocket: Read/Write pumps started for %s", username)
}











func GetPublicUsersHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode([]model.ChatUser{})
}

// ✅ ENHANCED: GetChatUsersHandler with throttling
func GetChatUsersHandler(w http.ResponseWriter, r *http.Request) {
    isLoggedIn, currentUserID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]model.ChatUser{})
        return
    }

    // ✅ Apply throttling
    if !userListThrottler.isAllowed(currentUserID) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode([]model.ChatUser{})
        return
    }

    log.Printf("📊 Loading chat users for user: %s", currentUserID)

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

        if lastActivityStr != "" {
            if parsedTime, err := time.Parse("2006-01-02 15:04:05", lastActivityStr); err == nil {
                user.LastActivity = parsedTime
            } else if parsedTime, err := time.Parse(time.RFC3339, lastActivityStr); err == nil {
                user.LastActivity = parsedTime
            } else {
                user.LastActivity = time.Now()
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
                user.LastMessageTime = time.Now()
            }
        } else {
            user.LastMessageTime = time.Now()
        }

        users = append(users, user)
    }

    sort.Slice(users, func(i, j int) bool {
        if users[i].LastMessage != "" && users[j].LastMessage != "" {
            return users[i].LastMessageTime.After(users[j].LastMessageTime)
        }
        if users[i].LastMessage != "" && users[j].LastMessage == "" {
            return true
        }
        if users[i].LastMessage == "" && users[j].LastMessage != "" {
            return false
        }
        return users[i].Username < users[j].Username
    })

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
    
    log.Printf("Successfully returned %d users to client %s", len(users), currentUserID)
}

// ✅ ENHANCED: GetChatMessagesHandler with throttling and pagination fixes
func GetChatMessagesHandler(w http.ResponseWriter, r *http.Request) {
    isLoggedIn, currentUserID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // ✅ Apply throttling
    if !messageThrottler.isAllowed(currentUserID) {
        log.Printf("🚫 Message request throttled for user %s", currentUserID)
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "messages": []model.ChatMessage{},
            "page":     1,
            "has_more": false,
        })
        return
    }

    pathParts := strings.Split(r.URL.Path, "/")
    if len(pathParts) < 5 {
        http.Error(w, "Invalid URL", http.StatusBadRequest)
        return
    }
    
    otherUserID := pathParts[4]
    
    page := 1
    if p := r.URL.Query().Get("page"); p != "" {
        if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
            page = parsed
        }
    }
    
    // ✅ ENHANCED: Better pagination with consistent limit
    limit := 10
    offset := (page - 1) * limit

    log.Printf("📥 Loading messages - User: %s, Other: %s, Page: %d, Limit: %d, Offset: %d", 
        currentUserID, otherUserID, page, limit, offset)

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
        json.NewEncoder(w).Encode(map[string]interface{}{
            "messages": []model.ChatMessage{},
            "page":     page,
            "has_more": false,
        })
        return
    }
    defer rows.Close()

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

    // ✅ ENHANCED: Better has_more calculation
    hasMore := len(messages) == limit

    // Mark messages as read
    markMessagesAsRead(currentUserID, otherUserID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "messages": messages,
        "page":     page,
        "has_more": hasMore,
    })
    
    log.Printf("✅ Returned %d messages for chat between %s and %s (page %d, has_more: %t)", 
        len(messages), currentUserID, otherUserID, page, hasMore)
}

func markMessagesAsRead(receiverID, senderID string) {
    query := `UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`
    result, err := database.DB.Exec(query, receiverID, senderID)
    if err != nil {
        log.Printf("Error marking messages as read: %v", err)
        return
    }
    
    if rowsAffected, err := result.RowsAffected(); err == nil {
        log.Printf("✅ Marked %d messages as read", rowsAffected)
    }
}

func DebugOnlineStatusHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    query := `
        SELECT u.id, u.username, COALESCE(uo.is_online, 0) as is_online, 
               COALESCE(uo.last_activity, '') as last_activity
        FROM users u 
        LEFT JOIN user_online uo ON u.id = uo.user_id
        ORDER BY u.username
    `
    
    rows, err := database.DB.Query(query)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    var users []map[string]interface{}
    for rows.Next() {
        var id, username, lastActivity string
        var isOnline bool
        
        err := rows.Scan(&id, &username, &isOnline, &lastActivity)
        if err != nil {
            continue
        }
        
        users = append(users, map[string]interface{}{
            "id":            id,
            "username":      username,
            "is_online":     isOnline,
            "last_activity": lastActivity,
        })
    }
    
    json.NewEncoder(w).Encode(users)
}
