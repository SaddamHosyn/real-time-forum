package server

import (
	"log"
	"net/http"
	"realtimeforum/auth"

	"realtimeforum/handler"

	_ "github.com/mattn/go-sqlite3" // or your database driver
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
	http.HandleFunc("/api/user/comments", handler.GetUserCommentsHandler)
	http.HandleFunc("/api/user/update", handler.UpdateUserHandler)

	// Start the server
	log.Println("Server started on http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Server error:", err)
	}
}
