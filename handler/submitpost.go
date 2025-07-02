package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"time"
)

// SubmitPostHandler handles the POST request to create a new forum post
func SubmitPostHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle OPTIONS request for CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request body
	var postData struct {
		Title   string   `json:"title"`
		Content string   `json:"content"`
		Topics  []string `json:"topics"`
		UserID  string   `json:"user_id"`
	}

	err := json.NewDecoder(r.Body).Decode(&postData)
	if err != nil {
		http.Error(w, "Failed to parse request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate post data
	errors := []string{}
	if len(postData.Title) < 10 {
		errors = append(errors, "Title must be at least 10 characters long")
	}
	if len(postData.Content) < 20 {
		errors = append(errors, "Content must be at least 20 characters long")
	}
	if len(postData.Topics) < 3 {
		errors = append(errors, "At least 3 topics are required")
	}

	if len(errors) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"errors":  errors,
		})
		return
	}

	// Get user details for the author name
	var firstName, lastName string
	err = database.DB.QueryRow("SELECT first_name, last_name FROM users WHERE id = ?", postData.UserID).Scan(&firstName, &lastName)
	if err != nil {
		http.Error(w, "Failed to get user details: "+err.Error(), http.StatusInternalServerError)
		return
	}

	authorName := firstName + " " + lastName

	// Create timestamps
	now := time.Now()

	// Begin transaction
	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback() // Rollback in case of error

	// Insert post
	result, err := tx.Exec(
		"INSERT INTO posts (title, content, user_id, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		postData.Title, postData.Content, postData.UserID, authorName, now, now,
	)

	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get post ID
	postID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Failed to get post ID: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert topics
	for _, topicName := range postData.Topics {
		// Check if topic exists
		var topicID string
		var emoji string
		err := tx.QueryRow("SELECT id, emoji FROM topics WHERE name = ?", topicName).Scan(&topicID, &emoji)

		if err != nil {
			// Topic doesn't exist, create a new topic ID and emoji
			topicID = generateUniqueID()       // You need to implement this function
			emoji = getDefaultEmoji(topicName) // You need to implement this function

			_, err := tx.Exec("INSERT INTO topics (id, name, emoji) VALUES (?, ?, ?)",
				topicID, topicName, emoji)
			if err != nil {
				http.Error(w, "Failed to create topic: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		// Create post-topic association
		_, err = tx.Exec(
			"INSERT INTO post_topics (post_id, topic_id) VALUES (?, ?)",
			postID, topicID,
		)

		if err != nil {
			http.Error(w, "Failed to associate topic with post: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		http.Error(w, "Failed to commit transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response with post data
	post := model.Post{
		ID:        int(postID),
		Title:     postData.Title,
		Content:   postData.Content,
		UserID:    postData.UserID,
		Author:    authorName,
		Topics:    postData.Topics,
		CreatedAt: now,
		UpdatedAt: now,
		Comments:  []model.Comment{}, // Initialize with empty comments
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Post created successfully",
		"post":    post,
	})
}

// Helper function to generate a unique ID for topics
// You should implement this according to your ID generation strategy
func generateUniqueID() string {
	// This is a simple implementation. Consider using UUID or other approaches
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// Helper function to get a default emoji for a topic
// You should implement this according to your application's design
func getDefaultEmoji(topicName string) string {
	// This is a simple implementation. Consider using a mapping of topics to emojis
	return "📝" // Default emoji
}
