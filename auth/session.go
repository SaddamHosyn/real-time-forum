package auth

import (
	"encoding/json"
	"log"
	"net/http"
	
)

// CheckSessionHandler handles the session verification endpoint
func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Clean up expired sessions first
	CleanupExpiredSessions()

	cookie, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			// No session cookie found - user is not authenticated
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}
		log.Printf("Error retrieving cookie: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	user, err := GetUserBySessionToken(cookie.Value)
	if err != nil {
		// Invalid or expired session - clear the cookie and return unauthenticated
		ClearSessionCookie(w)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": false,
		})
		return
	}

	// Valid session
	json.NewEncoder(w).Encode(map[string]interface{}{
		"authenticated": true,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}
