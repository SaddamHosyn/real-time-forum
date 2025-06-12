package server

import (
	"log"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/handler"
	"realtimeforum/websocket"

	_ "github.com/mattn/go-sqlite3"
)

// StartServer starts the HTTP server
func StartServer() {

	// Serve static files from the "static" folder
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))

	// Define root handler (homepage)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./index.html")
	})

	// Define API routes
	http.HandleFunc("/api/login", handler.LoginHandler)
	http.HandleFunc("/api/create-post", handler.CreatePostHandler)
	http.HandleFunc("/api/submit-post", handler.SubmitPostHandler)
	http.HandleFunc("/api/register", handler.RegisterHandler)
	http.HandleFunc("/api/check-session", auth.CheckSessionHandler)
	http.HandleFunc("/api/user/posts", handler.GetUserPostsHandler)

	http.HandleFunc("/api/posts/topic/", handler.GetPostsByTopicHandler)

	http.HandleFunc("/api/comments/create", handler.CreateCommentHandler)
	http.HandleFunc("/api/posts/", handler.GetCommentsByPostHandler) // This handles /api/posts/{id}/comments

	http.HandleFunc("/api/feed/posts", handler.GetFeedHandler)

	http.HandleFunc("/api/user/comments", handler.GetUserCommentsHandler)

	http.HandleFunc("/api/logout", handler.LogoutHandler)

	// Chat routes
	http.HandleFunc("/api/debug/online-status", handler.DebugOnlineStatusHandler)

	http.HandleFunc("/ws", handler.WebSocketHandler)
	http.HandleFunc("/api/chat/users", handler.GetChatUsersHandler)
	http.HandleFunc("/api/chat/messages/", handler.GetChatMessagesHandler)
	http.HandleFunc("/api/chat/public-users", handler.GetPublicUsersHandler) // ← NEW ROUTE ADDED

	// Initialize WebSocket hub
	log.Println("🔵 Starting WebSocket Hub...")
	go websocket.ChatHub.Run()
	log.Println("✅ WebSocket Hub started")

	// Start the server
	log.Println("Server started on http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Server error:", err)
	}
}
