package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"
)

func UpdateUserSession(user *model.User, sessionToken string) error {
	_, err := database.DB.Exec(`
		UPDATE users
		SET session_token = ?, session_expiry = ?
		WHERE id = ?`, 
		sessionToken, utils.SessionExpiry(), user.ID)
	return err
}

func GetUserBySessionToken(sessionToken string) (*model.User, error) {
	var user model.User
	err := database.DB.QueryRow(`
		SELECT id, username, email, password_hash, session_token, session_expiry
		FROM users
		WHERE session_token = ? AND session_expiry > ?`, 
		sessionToken, utils.GetCurrentTime()).
		Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, 
			&user.SessionToken, &user.SessionExpiry)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid session token")
		}
		return nil, err
	}
	return &user, nil
}

func LogoutUser(userID string) error {
	_, err := database.DB.Exec(`
		UPDATE users
		SET session_token = NULL, session_expiry = NULL
		WHERE id = ?`, userID)
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
