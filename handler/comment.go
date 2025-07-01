package handler

import (
	"encoding/json"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"strconv"
	"strings"
	"time"
)

// CreateCommentHandler handles POST /api/comments/create
func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	var body struct {
		Content string `json:"content"`
		PostID  int    `json:"post_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	if len(strings.TrimSpace(body.Content)) < 1 {
		http.Error(w, "Comment content cannot be empty", http.StatusBadRequest)
		return
	}

	now := time.Now()
	res, err := database.DB.Exec(
		`INSERT INTO comments (content, user_id, post_id, created_at) VALUES (?, ?, ?, ?)`,
		body.Content, userID, body.PostID, now,
	)
	if err != nil {
		http.Error(w, "Failed to insert comment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	commentID64, err := res.LastInsertId()
	if err != nil {
		http.Error(w, "Failed to get comment ID: "+err.Error(), http.StatusInternalServerError)
		return
	}

	commentID := int(commentID64)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"message":    "Comment created successfully",
		"comment_id": commentID,
	})
}

// GetSinglePostHandler handles GET /api/posts/{id}
func GetSinglePostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract post ID from URL path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	postIDStr := pathParts[3] // /api/posts/{id}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	// Get post from database
	post, err := database.GetPostByID(postID)
	if err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	// Get comments for this post
	comments, err := database.GetCommentsByPostID(postID)
	if err != nil {
		comments = []model.Comment{} // Empty array if error
	}

	response := map[string]interface{}{
		"success": true,
		"post": map[string]interface{}{
			"id":      post.ID,
			"title":   post.Title,
			"content": post.Content,
			"author":  post.Author,
			"date":    post.CreatedAt,
		},
		"comments": comments,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetCommentsByPostHandler handles GET /api/posts/{postId}/comments
func GetCommentsByPostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	var postIDStr string
	for i, part := range pathParts {
		if part == "posts" && i+1 < len(pathParts) && i+2 < len(pathParts) && pathParts[i+2] == "comments" {
			postIDStr = pathParts[i+1]
			break
		}
	}

	if postIDStr == "" {
		http.Error(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	comments, err := database.GetCommentsByPostID(postID)
	if err != nil {
		http.Error(w, "Failed to fetch comments: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"comments": comments,
	})
}
