package middleware

import (
	"context"
	"net/http"
	"time"
	"realtimeforum/database"
)

type contextKey string

const userIDContextKey = contextKey("user_id")

func SessionMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil || cookie.Value == "" {
			// No session cookie present - continue without setting context
			next.ServeHTTP(w, r)
			return
		}

		// Check if session exists and is valid
		var userID string
		var expiresAt time.Time

		err = database.DB.QueryRow(
			"SELECT user_id, session_expiry FROM sessions WHERE session_token = ?",
			cookie.Value,
		).Scan(&userID, &expiresAt)

		if err != nil || time.Now().After(expiresAt) {
			// Invalid or expired session - clean up
			if err == nil {
				// Delete expired session from database
				database.DB.Exec("DELETE FROM sessions WHERE session_token = ?", cookie.Value)
			}
			
			// Clear the invalid cookie
			http.SetCookie(w, &http.Cookie{
				Name:     "session_token",
				Value:    "",
				Path:     "/",
				Expires:  time.Unix(0, 0),
				MaxAge:   -1,
				HttpOnly: true,
			})
			next.ServeHTTP(w, r)
			return
		}

		// Valid session - add user ID to context
		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func GetUserIDFromContext(r *http.Request) (string, bool) {
	userID, ok := r.Context().Value(userIDContextKey).(string)
	return userID, ok
}

