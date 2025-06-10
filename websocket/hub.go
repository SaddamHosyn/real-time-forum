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
        Register:   make(chan *Client),
        Unregister: make(chan *Client),
        Broadcast:  make(chan []byte),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.Register:
            h.mutex.Lock()
            h.Clients[client.ID] = client
            h.mutex.Unlock()
            
            // Update user online status
            updateUserOnlineStatus(client.ID, true)
            
            // Notify all clients about online status change
            h.broadcastOnlineStatus(client.ID, client.Username, true)
            
            log.Printf("Client %s connected", client.Username)

        case client := <-h.Unregister:
            h.mutex.Lock()
            if _, ok := h.Clients[client.ID]; ok {
                delete(h.Clients, client.ID)
                close(client.Send)
            }
            h.mutex.Unlock()
            
            // Update user offline status
            updateUserOnlineStatus(client.ID, false)
            
            // Notify all clients about offline status change
            h.broadcastOnlineStatus(client.ID, client.Username, false)
            
            log.Printf("Client %s disconnected", client.Username)

        case message := <-h.Broadcast:
            h.mutex.RLock()
            for _, client := range h.Clients {
                select {
                case client.Send <- message:
                default:
                    close(client.Send)
                    delete(h.Clients, client.ID)
                }
            }
            h.mutex.RUnlock()
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
func (c *Client) ReadPump() {
    defer func() {
        c.Hub.Unregister <- c
        c.Conn.Close()
    }()

    for {
        _, messageBytes, err := c.Conn.ReadMessage()
        if err != nil {
            break
        }

        var wsMessage model.WebSocketMessage
        if err := json.Unmarshal(messageBytes, &wsMessage); err != nil {
            continue
        }

        wsMessage.UserID = c.ID
        
        switch wsMessage.Type {
        case "chat_message":
            handleChatMessage(c, wsMessage)
        case "typing":
            handleTypingEvent(c, wsMessage)
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
