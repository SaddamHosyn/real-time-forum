package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"realtimeforum/database"
	"time"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	// 1) Only POST allowed
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// 2) Get user ID from session cookie
	userID, err := getUserIDFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// 3) Decode JSON body
	var body struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		Topics  []int  `json:"topics"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	// 4) Validate input
	var validationErrors []string
	if len(body.Title) < 10 {
		validationErrors = append(validationErrors, "Title must be at least 10 characters.")
	}
	if len(body.Content) < 20 {
		validationErrors = append(validationErrors, "Content must be at least 20 characters.")
	}
	if len(body.Topics) < 3 {
		validationErrors = append(validationErrors, "Select at least 3 topics.")
	}

	if len(validationErrors) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"errors":  validationErrors,
		})
		return
	}

	// 5) Begin transaction
	now := time.Now()
	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 6) Insert post (use user_id, not author_id)
	res, err := tx.Exec(
		`INSERT INTO posts (title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
		body.Title, body.Content, userID, now, now,
	)
	if err != nil {
		http.Error(w, "Failed to insert post: "+err.Error(), http.StatusInternalServerError)
		return
	}

	postID64, err := res.LastInsertId()
	if err != nil {
		http.Error(w, "Failed to get post ID: "+err.Error(), http.StatusInternalServerError)
		return
	}
	postID := int(postID64)

	// 7) Insert topics associations
	for _, topicID := range body.Topics {
		if topicID > 0 { // Skip invalid topic IDs
			_, err := tx.Exec(
				`INSERT INTO posts_topics (post_id, topic_id) VALUES (?, ?)`,
				postID, topicID,
			)
			if err != nil {
				http.Error(w, "Failed to associate topic: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	// 8) Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 9) Return success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Post created successfully",
		"post_id": postID,
	})
}

// getUserIDFromSession retrieves user ID from session token
func getUserIDFromSession(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return "", fmt.Errorf("no session cookie found")
	}

	var userID string
	var sessionExpiry time.Time

	err = database.DB.QueryRow(
		`SELECT user_id, session_expiry FROM sessions WHERE session_token = ?`,
		cookie.Value,
	).Scan(&userID, &sessionExpiry)

	if err != nil {
		return "", fmt.Errorf("invalid session token")
	}

	if time.Now().After(sessionExpiry) {
		database.DB.Exec("DELETE FROM sessions WHERE session_token = ?", cookie.Value)
		return "", fmt.Errorf("session expired")
	}

	return userID, nil
}
