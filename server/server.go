package server

import (
	"log"
	"net/http"
	"net/url"
	"realtimeforum/auth"
	"realtimeforum/handler"
	"realtimeforum/middleware"
	"realtimeforum/websocket"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

// StartServer starts the HTTP server
func StartServer() {
	// Serve static files from the "assets" folder
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))

	// Define API routes (these take priority)
	http.HandleFunc("/api/login", handler.LoginHandler)

	http.HandleFunc("/api/create-post", middleware.RequireAuth(handler.CreatePostHandler))

	http.HandleFunc("/api/submit-post", middleware.RequireAuth(handler.SubmitPostHandler))
	http.HandleFunc("/api/register", handler.RegisterHandler)
	http.HandleFunc("/api/check-session", auth.CheckSessionHandler)

	http.HandleFunc("/api/user/posts", middleware.RequireAuth(handler.GetUserPostsHandler))

	http.HandleFunc("/api/posts/topic/", handler.GetPostsByTopicHandler)

	http.HandleFunc("/api/comments/create", middleware.RequireAuth(handler.CreateCommentHandler))

	http.HandleFunc("/api/posts/", handler.GetCommentsByPostHandler)

	http.HandleFunc("/api/feed/posts", middleware.RequireAuth(handler.GetFeedHandler))

	http.HandleFunc("/api/user/comments", middleware.RequireAuth(handler.GetUserCommentsHandler))

	http.HandleFunc("/api/logout", middleware.RequireAuth(handler.LogoutHandler))

	// Chat routes
	http.HandleFunc("/api/debug/online-status", handler.DebugOnlineStatusHandler)
	http.HandleFunc("/ws", middleware.RequireAuth(handler.WebSocketHandler))

	http.HandleFunc("/api/chat/users", middleware.RequireAuth(handler.GetChatUsersHandler))

	http.HandleFunc("/api/chat/messages/", middleware.RequireAuth(handler.GetChatMessagesHandler))
	http.HandleFunc("/api/chat/public-users", handler.GetPublicUsersHandler)

	// SPA Catch-all handler (MUST be last)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Handle non-existent API routes
		if strings.HasPrefix(r.URL.Path, "/api/") {
			handler.WriteAPIError(w, 404, "API endpoint not found")
			return
		}

		// Check for malformed URLs
		if _, err := url.ParseRequestURI(r.RequestURI); err != nil {
			handler.WriteAPIError(w, 400, "Malformed URL")
			return
		}

		// Check for specific bad request patterns
		if strings.Contains(r.URL.Path, "%") && !strings.Contains(r.URL.Path, "%20") {
			// Serve index.html with error parameter
			http.Redirect(w, r, "/?error=400", http.StatusFound)
			return
		}

		// For all other routes, serve index.html (let JavaScript handle routing)
		http.ServeFile(w, r, "./index.html")
	})

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
