package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"realtimeforum/database"
	"strconv"
	"strings"
)

type PostWithTopics struct {
	ID        int      `json:"id"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Author    string   `json:"author"`
	CreatedAt string   `json:"created_at"`
	Topics    []string `json:"topics"`
}

func GetPostsByTopicHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract topic ID from URL path - handle both /api/posts/topic/1 and /api/posts/topic/1/
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	
	var topicIDStr string
	// Look for the topic ID after "topic"
	for i, part := range pathParts {
		if part == "topic" && i+1 < len(pathParts) {
			topicIDStr = pathParts[i+1]
			break
		}
	}
	
	if topicIDStr == "" {
		http.Error(w, "Topic ID is required", http.StatusBadRequest)
		return
	}

	topicID, err := strconv.Atoi(topicIDStr)
	if err != nil {
		http.Error(w, "Invalid topic ID", http.StatusBadRequest)
		return
	}

	posts, err := getPostsByTopicID(topicID)
	if err != nil {
		http.Error(w, "Failed to fetch posts: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"posts":   posts,
	})
}

func getPostsByTopicID(topicID int) ([]PostWithTopics, error) {
	query := `
		SELECT DISTINCT p.id, p.title, p.content, u.username, p.created_at
		FROM posts p
		JOIN posts_topics pt ON p.id = pt.post_id
		JOIN users u ON p.user_id = u.id
		WHERE pt.topic_id = ?
		ORDER BY p.created_at DESC
	`

	rows, err := database.DB.Query(query, topicID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []PostWithTopics
	for rows.Next() {
		var post PostWithTopics
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.Author, &post.CreatedAt)
		if err != nil {
			return nil, err
		}

		// Get topics for this post
		topics, err := getTopicsForPost(post.ID)
		if err != nil {
			return nil, err
		}
		post.Topics = topics

		posts = append(posts, post)
	}

	return posts, nil
}

func getTopicsForPost(postID int) ([]string, error) {
	query := `
		SELECT t.name 
		FROM topics t
		JOIN posts_topics pt ON t.id = pt.topic_id
		WHERE pt.post_id = ?
	`

	rows, err := database.DB.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []string
	for rows.Next() {
		var topicName sql.NullString
		err := rows.Scan(&topicName)
		if err != nil {
			return nil, err
		}
		if topicName.Valid {
			topics = append(topics, topicName.String)
		}
	}

	return topics, nil
}
