// websocket/hub.go
package websocket

import (
    "encoding/json"
    "log"
    "net/http"
    "sync"
    "realtimeforum/model"
    
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Allow all origins in development
    },
}

// UpgradeConnection upgrades HTTP connection to WebSocket
func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
    return upgrader.Upgrade(w, r, nil)
}

type Client struct {
    ID       string
    Username string
    Conn     *websocket.Conn
    Hub      *Hub
    Send     chan []byte
}

type Hub struct {
    Clients    map[string]*Client
    Register   chan *Client
    Unregister chan *Client
    Broadcast  chan []byte
    mutex      sync.RWMutex
}

func NewHub() *Hub {
    return &Hub{
        Clients:    make(map[string]*Client),
        Register:   make(chan *Client, 10),    // ✅ BUFFERED CHANNEL
        Unregister: make(chan *Client, 10),    // ✅ BUFFERED CHANNEL  
        Broadcast:  make(chan []byte, 100),    // ✅ BUFFERED CHANNEL
    }
}



func (h *Hub) Run() {
    log.Printf("🔵 Hub.Run() started - listening for clients...")
    
    for {
        select {
        case client := <-h.Register:
            log.Printf("🔵 Hub: Registering client %s (ID: %s)", client.Username, client.ID)
            h.mutex.Lock()
            h.Clients[client.ID] = client
            h.mutex.Unlock()
            
            log.Printf("✅ Hub: Client %s registered successfully", client.Username)
            
            // Update user online status
            updateUserOnlineStatus(client.ID, true)
            
            // Notify all clients about online status change
            h.broadcastOnlineStatus(client.ID, client.Username, true)
            
            log.Printf("✅ Hub: Client %s connected and online status updated", client.Username)

        case client := <-h.Unregister:
            log.Printf("🔵 Hub: Unregistering client %s (ID: %s)", client.Username, client.ID)
            h.mutex.Lock()
            if _, ok := h.Clients[client.ID]; ok {
                delete(h.Clients, client.ID)
                close(client.Send)
                log.Printf("✅ Hub: Client %s unregistered successfully", client.Username)
            } else {
                log.Printf("⚠️ Hub: Client %s was not found in clients map", client.Username)
            }
            h.mutex.Unlock()
            
            // Update user offline status
            updateUserOnlineStatus(client.ID, false)
            
            // Notify all clients about offline status change
            h.broadcastOnlineStatus(client.ID, client.Username, false)
            
            log.Printf("✅ Hub: Client %s disconnected and offline status updated", client.Username)

        case message := <-h.Broadcast:
            log.Printf("🔵 Hub: Broadcasting message to %d clients", len(h.Clients))
            h.mutex.RLock()
            for clientID, client := range h.Clients {
                select {
                case client.Send <- message:
                    // Message sent successfully
                default:
                    log.Printf("⚠️ Hub: Failed to send message to client %s, removing", clientID)
                    close(client.Send)
                    delete(h.Clients, clientID)
                }
            }
            h.mutex.RUnlock()
            log.Printf("✅ Hub: Broadcast completed")
        }
    }
}







func (h *Hub) SendToUser(userID string, message []byte) {
    h.mutex.RLock()
    defer h.mutex.RUnlock()
    
    if client, ok := h.Clients[userID]; ok {
        select {
        case client.Send <- message:
        default:
            close(client.Send)
            delete(h.Clients, userID)
        }
    }
}

func (h *Hub) broadcastOnlineStatus(userID, username string, isOnline bool) {
    message := model.WebSocketMessage{
        Type: "user_status",
        Data: map[string]interface{}{
            "user_id":   userID,
            "username":  username,
            "is_online": isOnline,
        },
    }
    
    data, _ := json.Marshal(message)
    h.Broadcast <- data
}

// EXPORTED METHODS (Capital letters) - These can be called from handler package


// In websocket/hub.go
func (c *Client) ReadPump() {
    defer func() {
        log.Printf("🔌 Client %s disconnecting from ReadPump", c.Username)
        c.Hub.Unregister <- c
        c.Conn.Close()
    }()

    log.Printf("🔵 ReadPump started for client %s (ID: %s)", c.Username, c.ID)

    for {
        _, messageBytes, err := c.Conn.ReadMessage()
        if err != nil {
            log.Printf("❌ ReadPump error for client %s: %v", c.Username, err)
            break
        }

        log.Printf("📨 Raw message received from %s: %s", c.Username, string(messageBytes))

        var wsMessage model.WebSocketMessage
        if err := json.Unmarshal(messageBytes, &wsMessage); err != nil {
            log.Printf("❌ JSON unmarshal error for client %s: %v", c.Username, err)
            log.Printf("❌ Raw message was: %s", string(messageBytes))
            continue
        }

        log.Printf("📨 Parsed message from %s: Type=%s, Data=%+v", c.Username, wsMessage.Type, wsMessage.Data)
        wsMessage.UserID = c.ID
        
        switch wsMessage.Type {
        case "chat_message":
            log.Printf("💬 Routing to handleChatMessage")
            handleChatMessage(c, wsMessage)
        case "typing":
            log.Printf("⌨️ Routing to handleTypingEvent")
            handleTypingEvent(c, wsMessage)
        default:
            log.Printf("❓ Unknown message type: %s", wsMessage.Type)
        }
    }
}




func (c *Client) WritePump() {
    defer c.Conn.Close()

    for {
        select {
        case message, ok := <-c.Send:
            if !ok {
                c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }
            c.Conn.WriteMessage(websocket.TextMessage, message)
        }
    }
}

// Global hub instance
var ChatHub = NewHub()
