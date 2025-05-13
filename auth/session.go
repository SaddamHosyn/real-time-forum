package auth

import (
	"errors"
	"log"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"

)

func UpdateUserSession(user *model.User, sessionToken string) error {
	// First, check if a session already exists for this user
	var exists bool
	var sessionID int64
	err := database.DB.QueryRow(`
		SELECT id, COUNT(*) > 0
		FROM sessions 
		WHERE user_id = ?`,
		user.ID).Scan(&sessionID, &exists)
		
	if err != nil {
		log.Printf("Error checking existing session: %v", err)
		// Continue with insert attempt if query fails
	}
	
	if exists {
		// Update existing session
		_, err = database.DB.Exec(`
			UPDATE sessions
			SET session_token = ?, session_expiry = ?
			WHERE user_id = ?`,
			sessionToken, utils.SessionExpiry(), user.ID)
	} else {
		// Insert new session
		_, err = database.DB.Exec(`
			INSERT INTO sessions (user_id, session_token, session_expiry)
			VALUES (?, ?, ?)`,
			user.ID, sessionToken, utils.SessionExpiry())
	}
	
	return err
}

func GetUserBySessionToken(sessionToken string) (*model.User, error) {
	var user model.User
	
	// Join users and sessions tables to get user data by session token
	err := database.DB.QueryRow(`
		SELECT u.id, u.username, u.email, u.password_hash, s.session_token, s.session_expiry
		FROM users u
		JOIN sessions s ON u.id = s.user_id
		WHERE s.session_token = ? AND s.session_expiry > ?`,
		sessionToken, utils.GetCurrentTime()).
		Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash,
			&user.SessionToken, &user.SessionExpiry)
			
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, errors.New("invalid session token")
		}
		return nil, err
	}
	return &user, nil
}

func LogoutUser(userID string) error {
	// Delete the session instead of updating it to NULL
	_, err := database.DB.Exec(`
		DELETE FROM sessions
		WHERE user_id = ?`, userID)
	return err
}

// CheckUserLoggedIn validates the session token from the cookie and returns (loggedIn, userID)
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
