package handler

import (
	"encoding/json"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/database"
)

// GetUserPostsHandler handles GET /api/user/posts
func GetUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	// 400: Method validation
	if r.Method != http.MethodGet {
		WriteAPIError(w, http.StatusMethodNotAllowed, "Only GET method is allowed")
		return
	}

	// 401: Check if user is authenticated
	isLoggedIn, requestingUserID := auth.CheckUserLoggedIn(r)
	if !isLoggedIn {
		WriteAPIError(w, http.StatusUnauthorized, "You must be logged in to access this resource")
		return
	}

	// 400: Validate request parameters
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		// If no user_id provided, use the requesting user's ID
		userID = requestingUserID
	}

	// Get posts with authorization check
	posts, err := database.GetUserPosts(userID, requestingUserID)
	if err != nil {
		// This will automatically map to 403, 404, or 500 based on error type
		HandleError(w, err)
		return
	}

	// For each post, get its topics
	for i := range posts {
		topics, err := getTopicsForPost(posts[i].ID)
		if err != nil {
			posts[i].Topics = []string{} // Empty topics if error
		} else {
			posts[i].Topics = topics
		}
	}

	// Success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// GetUserCommentsHandler handles GET /api/user/comments
func GetUserCommentsHandler(w http.ResponseWriter, r *http.Request) {
	// 400: Method validation
	if r.Method != http.MethodGet {
		WriteAPIError(w, http.StatusMethodNotAllowed, "Only GET method is allowed")
		return
	}

	// 401: Check if user is authenticated
	isLoggedIn, userID := auth.CheckUserLoggedIn(r)
	if !isLoggedIn {
		WriteAPIError(w, http.StatusUnauthorized, "You must be logged in to access this resource")
		return
	}

	// Get user comments
	comments, err := database.GetUserComments(userID)
	if err != nil {
		// This will automatically map to 403, 404, or 500 based on error type
		HandleError(w, err)
		return
	}

	// Success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}
