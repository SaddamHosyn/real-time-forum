package middleware

import (
	"context"
	"net/http"
	"time"
	"realtimeforum/database"
	"realtimeforum/handler"
)

type contextKey string

const userIDContextKey = contextKey("user_id")

// RequireAuth middleware that returns 401 for unauthenticated requests
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil || cookie.Value == "" {
			handler.WriteAPIError(w, http.StatusUnauthorized, "Authentication required")
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
			handler.WriteAPIError(w, http.StatusUnauthorized, "Invalid or expired session")
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
