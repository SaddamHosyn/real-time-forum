package server

import (
	"database/sql"
	"realtimeforum/auth"
	"realtimeforum/model"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3" // or your database driver
)

// StartServer initializes the database and starts the HTTP server
func StartServer() {
	// Connect to the database
	var err error
	model.DB, err = sql.Open("sqlite3", "./forum.db") // Adjust path if needed
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer model.DB.Close()

	// Define routes
	http.HandleFunc("/api/login", auth.LoginHandler)


	// Start the server
	log.Println("Server started on http://localhost:8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Server error:", err)
	}
}
