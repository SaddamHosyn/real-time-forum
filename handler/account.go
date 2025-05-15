// account.go
package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/database"
)

func GetUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from session
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get posts from database
	posts, err := database.GetUserPosts(userID)
	if err != nil {
		log.Printf("Error getting user posts: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func GetUserCommentsHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from session
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get comments from database
	comments, err := database.GetUserComments(userID)
	if err != nil {
		log.Printf("Error getting user comments: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from session
	authenticated, userID := auth.CheckUserLoggedIn(r)
	if !authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var updateData struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update user in database
	err := database.UpdateUser(userID, updateData.FirstName, updateData.LastName, updateData.Email)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "User updated successfully",
	})
}
