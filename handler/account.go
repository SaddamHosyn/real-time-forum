// account.go
package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/database"
)

// GetUserPostsHandler handles GET /user/posts
func GetUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	posts, err := database.GetUserPosts(userID)
	if err != nil {
		log.Printf("Error getting user posts: %v", err)
		http.Error(w, "Failed to get posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// GetUserCommentsHandler handles GET /user/comments
func GetUserCommentsHandler(w http.ResponseWriter, r *http.Request) {
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	comments, err := database.GetUserComments(userID)
	if err != nil {
		log.Printf("Error getting user comments: %v", err)
		http.Error(w, "Failed to get comments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// UpdateUserHandler handles POST /user/update
func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var updateData struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if updateData.FirstName == "" || updateData.LastName == "" || updateData.Email == "" {
		http.Error(w, "Missing fields in request body", http.StatusBadRequest)
		return
	}

	err := database.UpdateUser(userID, updateData.FirstName, updateData.LastName, updateData.Email)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User updated successfully",
	})
}
