package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/database"
	"strconv"
	"realtimeforum/auth"
)

// JSON response structure
type VoteResponse struct {
	Message string `json:"message"`
}

// handleVote processes votes for posts or comments.
func handleVote(w http.ResponseWriter, r *http.Request, entity string) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	isLoggedIn, userID := auth.CheckUserLoggedIn(r)
	if !isLoggedIn {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	entityIDStr := r.FormValue(entity + "_id")
	voteStr := r.FormValue("vote")

	entityID, err := strconv.Atoi(entityIDStr)
	if err != nil || entityID <= 0 {
		http.Error(w, "Invalid "+entity+" ID", http.StatusBadRequest)
		return
	}

	voteValue, err := strconv.Atoi(voteStr)
	if err != nil || (voteValue != 1 && voteValue != -1) {
		http.Error(w, "Invalid vote value", http.StatusBadRequest)
		return
	}

	var existingVote int
	query := "SELECT vote FROM votes WHERE user_id = ? AND " + entity + "_id = ?"
	err = database.DB.QueryRow(query, userID, entityID).Scan(&existingVote)

	switch {
	case err == sql.ErrNoRows:
		// Insert new vote
		_, err = database.DB.Exec("INSERT INTO votes (user_id, "+entity+"_id, vote) VALUES (?, ?, ?)", userID, entityID, voteValue)
		if err != nil {
			http.Error(w, "Failed to insert vote", http.StatusInternalServerError)
			return
		}
		respondJSON(w, http.StatusCreated, "Vote recorded")

	case err == nil:
		if existingVote == voteValue {
			// Undo vote
			_, err = database.DB.Exec("DELETE FROM votes WHERE user_id = ? AND "+entity+"_id = ?", userID, entityID)
			if err != nil {
				http.Error(w, "Failed to remove vote", http.StatusInternalServerError)
				return
			}
			respondJSON(w, http.StatusOK, "Vote removed")
		} else {
			// Change vote
			_, err = database.DB.Exec("UPDATE votes SET vote = ? WHERE user_id = ? AND "+entity+"_id = ?", voteValue, userID, entityID)
			if err != nil {
				http.Error(w, "Failed to update vote", http.StatusInternalServerError)
				return
			}
			respondJSON(w, http.StatusOK, "Vote updated")
		}

	default:
		http.Error(w, "Database error", http.StatusInternalServerError)
		log.Println("DB error during vote:", err)
	}
}

func respondJSON(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(VoteResponse{Message: message})
}

// VoteHandler handles voting for posts
func VoteHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "post")
}

// VoteCommentHandler handles voting for comments
func VoteCommentHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "comment")
}
