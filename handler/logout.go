package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/auth"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Only POST method allowed",
			"status":  "error",
		})
		return
	}

	// Get session token from cookie
	cookie, err := r.Cookie("session_token")
	if err != nil {
		// No session cookie, but that's okay for logout
		auth.ClearSessionCookie(w)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Logged out successfully",
		})
		return
	}

	// Delete session from database
	if err := auth.LogoutUser(cookie.Value); err != nil {
		log.Printf("Error during logout: %v", err)
	}

	// Clear the session cookie
	auth.ClearSessionCookie(w)
	
	log.Printf("User logged out successfully")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}
