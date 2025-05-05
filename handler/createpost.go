package handler

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
	 	"realtimeforum/model"
    "realtimeforum/database"
)



func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
        return
    }

    var post model.Post
    err := json.NewDecoder(r.Body).Decode(&post)
    if err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    post.CreatedAt = time.Now()

    stmt, err := database.DB.Prepare("INSERT INTO posts (title, content, author_id, created_at) VALUES (?, ?, ?, ?)")
    if err != nil {
        http.Error(w, "Failed to prepare statement", http.StatusInternalServerError)
        return
    }
    _, err = stmt.Exec(post.Title, post.Content, post.Author, post.CreatedAt)
    if err != nil {
        http.Error(w, "Failed to insert post", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    fmt.Fprintln(w, "Post created successfully")
}
