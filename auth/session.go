package auth

import (
	"realtimeforum/model"
	"realtimeforum/utils"
	"database/sql"
	"errors"
)

// UpdateUserSession updates the session token and its expiration for the user in the database
func UpdateUserSession(user *model.User, sessionToken string) error {
	_, err := model.DB.Exec(`
		UPDATE users
		SET session_token = ?, session_expiry = ?
		WHERE id = ?`, sessionToken, utils.SessionExpiry(), user.ID)
	return err
}

// GetUserBySessionToken fetches the user by their session token
func GetUserBySessionToken(sessionToken string) (*model.User, error) {
	var user model.User
	err := model.DB.QueryRow(`
		SELECT id, username, email, password_hash, session_token, session_expiry
		FROM users
		WHERE session_token = ? AND session_expiry > ?`, sessionToken, utils.GetCurrentTime()).
		Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.SessionToken, &user.SessionExpiry)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid session token or session expired")
		}
		return nil, err
	}

	return &user, nil
}

// LogoutUser clears the session token for the user
func LogoutUser(userID int) error {
	_, err := model.DB.Exec(`
		UPDATE users
		SET session_token = NULL, session_expiry = NULL
		WHERE id = ?`, userID)
	return err
}
