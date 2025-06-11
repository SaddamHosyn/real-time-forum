// websocket/websocket.go
package websocket

import (
    "encoding/json"
    "log"
    "time"
    "realtimeforum/database"
    "realtimeforum/model"
)



// websocket/websocket.go
func handleChatMessage(client *Client, wsMessage model.WebSocketMessage) {
    log.Printf("🔵 handleChatMessage called - Type: %s", wsMessage.Type)
    log.Printf("🔵 Message data: %+v", wsMessage.Data)
    log.Printf("🔵 Client ID: %s, Username: %s", client.ID, client.Username)
    
    data := wsMessage.Data.(map[string]interface{})
    receiverID := data["receiver_id"].(string)
    message := data["message"].(string)
    
    log.Printf("🔵 Parsed - Sender: %s, Receiver: %s, Message: %s", client.ID, receiverID, message)

    // Save message to database
    chatMessage, err := saveChatMessage(client.ID, receiverID, message)
    if err != nil {
        log.Printf("❌ Error saving chat message: %v", err)
        return
    }
    
    log.Printf("✅ Message saved successfully: %+v", chatMessage)

    // Update last message tracking
    updateLastMessage(client.ID, receiverID, chatMessage.ID)

    // Send to receiver if online
    response := model.WebSocketMessage{
        Type: "new_message",
        Data: chatMessage,
    }
    
    responseData, _ := json.Marshal(response)
    log.Printf("📤 Sending to receiver %s: %s", receiverID, string(responseData))
    ChatHub.SendToUser(receiverID, responseData)
    
    // Send confirmation back to sender
    log.Printf("📤 Sending confirmation to sender %s", client.ID)
    ChatHub.SendToUser(client.ID, responseData)
}



func handleTypingEvent(client *Client, wsMessage model.WebSocketMessage) {
    data := wsMessage.Data.(map[string]interface{})
    receiverID := data["receiver_id"].(string)
    isTyping := data["is_typing"].(bool)

    typingEvent := model.TypingEvent{
        UserID:     client.ID,
        Username:   client.Username,
        ReceiverID: receiverID,
        IsTyping:   isTyping,
    }

    response := model.WebSocketMessage{
        Type: "typing",
        Data: typingEvent,
    }
    
    responseData, _ := json.Marshal(response)
    ChatHub.SendToUser(receiverID, responseData)
}


func saveChatMessage(senderID, receiverID, message string) (*model.ChatMessage, error) {
    log.Printf("💾 saveChatMessage - Sender: %s, Receiver: %s, Message: %s", senderID, receiverID, message)
    
    query := `
        INSERT INTO chat_messages (sender_id, receiver_id, message, created_at, is_read)
        VALUES (?, ?, ?, ?, 0)
    `
    
    result, err := database.DB.Exec(query, senderID, receiverID, message, time.Now())
    if err != nil {
        log.Printf("❌ Database error: %v", err)
        return nil, err
    }

    messageID, err := result.LastInsertId()
    if err != nil {
        log.Printf("❌ Error getting last insert ID: %v", err)
        return nil, err
    }
    
    log.Printf("✅ Message inserted with ID: %d", messageID)

    // Get sender username
    var senderName string
    err = database.DB.QueryRow("SELECT username FROM users WHERE id = ?", senderID).Scan(&senderName)
    if err != nil {
        log.Printf("❌ Error getting sender username: %v", err)
        senderName = "Unknown"
    }
    
    log.Printf("✅ Sender username: %s", senderName)

    chatMessage := &model.ChatMessage{
        ID:         int(messageID),
        SenderID:   senderID,
        ReceiverID: receiverID,
        Message:    message,
        CreatedAt:  time.Now(),
        IsRead:     false,
        SenderName: senderName,
    }
    
    log.Printf("✅ Returning chat message: %+v", chatMessage)
    return chatMessage, nil
}




func updateUserOnlineStatus(userID string, isOnline bool) {
    query := `
        INSERT OR REPLACE INTO user_online (user_id, is_online, last_activity)
        VALUES (?, ?, ?)
    `
    database.DB.Exec(query, userID, isOnline, time.Now())
}

func updateLastMessage(user1ID, user2ID string, messageID int) {
    // Ensure consistent ordering
    if user1ID > user2ID {
        user1ID, user2ID = user2ID, user1ID
    }

    query := `
        INSERT OR REPLACE INTO user_chat_last_message (user1_id, user2_id, last_message_id)
        VALUES (?, ?, ?)
    `
    database.DB.Exec(query, user1ID, user2ID, messageID)
}
