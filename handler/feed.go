package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"realtimeforum/database"
	"realtimeforum/model"
)

// FeedResponse represents the feed API response
type FeedResponse struct {
	Success   bool              `json:"success"`
	Posts     []model.FeedPost  `json:"posts"`
	Page      int               `json:"page"`
	Limit     int               `json:"limit"`
	Total     int               `json:"total"`
	HasMore   bool              `json:"has_more"`
}

// GetFeedHandler handles GET /api/feed/posts
func GetFeedHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse pagination parameters
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	
	page := 1
	limit := 10
	
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Get total count of posts
	totalPosts, err := database.GetTotalPostsCount()
	if err != nil {
		http.Error(w, "Failed to get total posts count: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get feed posts with pagination
	posts, err := database.GetFeedPosts(limit, offset)
	if err != nil {
		http.Error(w, "Failed to fetch feed posts: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Determine if there are more posts
	hasMore := (offset + len(posts)) < totalPosts

	// Create response
	response := FeedResponse{
		Success: true,
		Posts:   posts,
		Page:    page,
		Limit:   limit,
		Total:   totalPosts,
		HasMore: hasMore,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
