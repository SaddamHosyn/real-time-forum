// websocket/hub.go
package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/model"
	"sync"
	"time"

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
		Register:   make(chan *Client, 10), // ✅ BUFFERED CHANNEL
		Unregister: make(chan *Client, 10), // ✅ BUFFERED CHANNEL
		Broadcast:  make(chan []byte, 100), // ✅ BUFFERED CHANNEL
	}
}

// ✅ ENHANCED: Updated Run method with immediate status sync and force refresh
func (h *Hub) Run() {
	log.Printf("🔵 Hub.Run() started - listening for clients...")

	for {
		select {
		case client := <-h.Register:
			log.Printf("🔵 Hub: Registering client %s (ID: %s)", client.Username, client.ID)

			// 1. Add to clients map first
			h.mutex.Lock()
			h.Clients[client.ID] = client
			h.mutex.Unlock()

			// 2. Critical: Force update database status immediately
			log.Printf("🔄 FORCING database update for user %s (ID: %s)", client.Username, client.ID)
			UpdateUserOnlineStatus(client.ID, true)

			// 3. Send current online users to new client immediately
			h.sendOnlineUsersToNewClient(client)

			// 4. Broadcast status to all clients
			log.Printf("📢 Broadcasting online status for user %s", client.Username)
			h.broadcastOnlineStatus(client.ID, client.Username, true)

			// 5. Force all clients to refresh their user lists
			time.Sleep(500 * time.Millisecond)
			h.broadcastForceRefresh()

			log.Printf("✅ Hub: Client %s connected and online status updated", client.Username)

		case client := <-h.Unregister:
			log.Printf("🔴 Hub: Unregistering client %s (ID: %s)", client.Username, client.ID)
			h.mutex.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
				h.mutex.Unlock()

				// Update database status
				UpdateUserOnlineStatus(client.ID, false)

				// Broadcast offline status
				h.broadcastOnlineStatus(client.ID, client.Username, false)

				log.Printf("✅ Hub: Client %s disconnected and offline status updated", client.Username)
			} else {
				h.mutex.Unlock()
			}

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

// ✅ NEW: Add this new method to Hub for force refresh
func (h *Hub) broadcastForceRefresh() {
	message := model.WebSocketMessage{
		Type: "force_refresh",
		Data: map[string]interface{}{
			"timestamp": time.Now(),
		},
	}

	data, _ := json.Marshal(message)
	h.Broadcast <- data
}

// ✅ NEW: Send current online users to newly connected client
func (h *Hub) sendOnlineUsersToNewClient(newClient *Client) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	log.Printf("📤 Sending current online users to new client %s", newClient.Username)

	for clientID, client := range h.Clients {
		if clientID != newClient.ID {
			// Send each online user's status to the new client
			message := model.WebSocketMessage{
				Type: "user_status",
				Data: map[string]interface{}{
					"user_id":   clientID,
					"username":  client.Username,
					"is_online": true,
				},
			}

			data, _ := json.Marshal(message)
			select {
			case newClient.Send <- data:
				log.Printf("✅ Sent online status of %s to new client %s", client.Username, newClient.Username)
			default:
				log.Printf("⚠️ Failed to send online status to new client %s", newClient.Username)
			}
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

// ✅ ENHANCED: Better online status broadcasting with forced delivery
func (h *Hub) broadcastOnlineStatus(userID, username string, isOnline bool) {
	log.Printf("📢 Broadcasting status change: %s is %s", username, map[bool]string{true: "online", false: "offline"}[isOnline])

	message := model.WebSocketMessage{
		Type: "user_status",
		Data: map[string]interface{}{
			"user_id":   userID,
			"username":  username,
			"is_online": isOnline,
		},
	}

	data, _ := json.Marshal(message)

	// ✅ ENHANCED: Send directly to each client instead of using broadcast channel
	h.mutex.RLock()
	clientCount := len(h.Clients)
	successCount := 0

	for clientID, client := range h.Clients {
		// Don't send status update to the user whose status changed
		if clientID != userID {
			select {
			case client.Send <- data:
				successCount++
				log.Printf("✅ Status update sent to client %s", clientID)
			default:
				log.Printf("⚠️ Failed to send status update to client %s", clientID)
			}
		}
	}
	h.mutex.RUnlock()

	log.Printf("📢 Status broadcast completed: sent to %d/%d clients", successCount, clientCount-1)
}

// EXPORTED METHODS (Capital letters) - These can be called from handler package
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
