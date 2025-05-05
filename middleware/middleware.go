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
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		var userID int
		var expiresAt time.Time

		err = database.DB.QueryRow(
			"SELECT user_id, session_expiry FROM sessions WHERE session_token = ?",
			cookie.Value,
		).Scan(&userID, &expiresAt)

		if err != nil || time.Now().After(expiresAt) {
			http.SetCookie(w, &http.Cookie{
				Name:    "session_token",
				Value:   "",
				Expires: time.Now(),
			})
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Optional: helper to get user ID
func GetUserIDFromContext(ctx context.Context) (int, bool) {
	userID, ok := ctx.Value(userIDContextKey).(int)
	return userID, ok
}
