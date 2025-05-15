package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"
)

func UpdateUserSession(user *model.User, sessionToken string) error {
	// First delete any existing sessions to ensure single session per user
	_, err := database.DB.Exec(`
		DELETE FROM sessions 
		WHERE user_id = ?`, user.ID)
	if err != nil {
		log.Printf("Error deleting existing sessions: %v", err)
		return err
	}

	// Insert new session
	_, err = database.DB.Exec(`
		INSERT INTO sessions (user_id, session_token, session_expiry)
		VALUES (?, ?, ?)`,
		user.ID, sessionToken, utils.SessionExpiry())

	return err
}

func GetUserBySessionToken(sessionToken string) (*model.User, error) {
	var user model.User

	err := database.DB.QueryRow(`
		SELECT u.id, u.username, u.email, u.password_hash, s.session_token, s.session_expiry
		FROM users u
		JOIN sessions s ON u.id = s.user_id
		WHERE s.session_token = ? AND s.session_expiry > ?`,
		sessionToken, utils.GetCurrentTime()).
		Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
			&user.SessionToken, &user.SessionExpiry)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid session token")
		}
		return nil, err
	}
	return &user, nil
}

func LogoutUser(userID string) error {
	_, err := database.DB.Exec(`
		DELETE FROM sessions
		WHERE user_id = ?`, userID)
	return err
}

func CheckUserLoggedIn(r *http.Request) (bool, string) {
	cookie, err := r.Cookie("session_token")
	if err != nil || cookie.Value == "" {
		return false, ""
	}

	user, err := GetUserBySessionToken(cookie.Value)
	if err != nil {
		return false, ""
	}

	return true, user.ID
}

func SetSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Expires:  utils.SessionExpiry(),
	})
}

// CheckSessionHandler handles the session verification endpoint
func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	if database.DB == nil {
		log.Println("Database connection is nil in CheckSessionHandler")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	cookie, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			// No session cookie found
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
		if errors.Is(err, sql.ErrNoRows) {
			// Invalid session token
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}
		log.Printf("Error checking session: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
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
