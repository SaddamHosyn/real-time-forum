package handler

import (
	"encoding/json"
	"net/http"
	"realtimeforum/database"
)

// GetUserPostsHandler handles GET /api/user/posts
func GetUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	posts, err := database.GetUserPosts(userID)
	if err != nil {
		http.Error(w, "Failed to fetch user posts: "+err.Error(), http.StatusInternalServerError)
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

// GetUserCommentsHandler handles GET /api/user/comments
// GetUserCommentsHandler handles GET /api/user/comments
func GetUserCommentsHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
        return
    }

    userID, err := getUserIDFromSession(r)
    if err != nil {
        http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
        return
    }

    comments, err := database.GetUserComments(userID)
    if err != nil {
        http.Error(w, "Failed to fetch user comments: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // REMOVE the problematic loop that overwrites Author field

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(comments)
}
