// logout.go

package handler

import (
	"log"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/utils"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if database.DB == nil {
		log.Println("Database connection is nil in LogoutHandler")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	cookie, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No active session", http.StatusBadRequest)
			return
		}
		log.Printf("Error retrieving cookie: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	sessionToken := cookie.Value

	// First get the user ID from the session to clear all sessions for this user
	var userID int
	err = database.DB.QueryRow("SELECT user_id FROM sessions WHERE session_token = ?", sessionToken).Scan(&userID)
	if err != nil {
		log.Printf("Error getting user ID from session: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Delete all sessions for this user to ensure single session
	_, err = database.DB.Exec("DELETE FROM sessions WHERE user_id = ?", userID)
	if err != nil {
		log.Printf("Error deleting sessions: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Clear the cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		Expires:  utils.GetCurrentTime().Add(-utils.SessionDuration), // Use SessionDuration from utils
		MaxAge:   -1,
		HttpOnly: true,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Logged out successfully"}`))
}
