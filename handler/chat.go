// handler/chat.go
package handler

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "strings"
    "realtimeforum/auth"
    "realtimeforum/database"
    "realtimeforum/model"
    "realtimeforum/websocket"
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
    // Check authentication
    isLoggedIn, userID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    // Get username from database
    var username string
    database.DB.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)

    // Use the upgrader from websocket package
    conn, err := websocket.UpgradeConnection(w, r)
    if err != nil {
        log.Printf("WebSocket upgrade error: %v", err)
        return
    }

    client := &websocket.Client{
        ID:       userID,
        Username: username,
        Conn:     conn,
        Hub:      websocket.ChatHub,
        Send:     make(chan []byte, 256),
    }

    client.Hub.Register <- client

    // Use exported methods (capital letters)
    go client.WritePump()
    go client.ReadPump()
}

func GetChatUsersHandler(w http.ResponseWriter, r *http.Request) {
    isLoggedIn, currentUserID := auth.CheckUserLoggedIn(r)
    if !isLoggedIn {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    query := `
        SELECT DISTINCT u.id, u.username, 
               COALESCE(uo.is_online, 0) as is_online,
               COALESCE(uo.last_activity, u.created_at) as last_activity,
               COALESCE(cm.message, '') as last_message,
               COALESCE(cm.created_at, u.created_at) as last_message_time,
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
            CASE WHEN cm.created_at IS NOT NULL THEN cm.created_at ELSE u.created_at END DESC,
            u.username ASC
    `

    rows, err := database.DB.Query(query, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID, currentUserID)
    if err != nil {
        log.Printf("Error getting chat users: %v", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var users []model.ChatUser
    for rows.Next() {
        var user model.ChatUser
        err := rows.Scan(&user.ID, &user.Username, &user.IsOnline, &user.LastActivity, 
                        &user.LastMessage, &user.LastMessageTime, &user.UnreadCount)
        if err != nil {
            continue
        }
        users = append(users, user)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
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
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var messages []model.ChatMessage
    for rows.Next() {
        var msg model.ChatMessage
        err := rows.Scan(&msg.ID, &msg.SenderID, &msg.ReceiverID, &msg.Message, 
                        &msg.CreatedAt, &msg.IsRead, &msg.SenderName)
        if err != nil {
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
    json.NewEncoder(w).Encode(map[string]interface{}{
        "messages": messages,
        "page":     page,
        "has_more": len(messages) == limit,
    })
}

func markMessagesAsRead(receiverID, senderID string) {
    query := `UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`
    database.DB.Exec(query, receiverID, senderID)
}
