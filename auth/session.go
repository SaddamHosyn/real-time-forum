package auth

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"
)

func UpdateUserSession(user *model.User, sessionToken string) error {
	var sessionID int64
	err := database.DB.QueryRow(`
		SELECT id 
		FROM sessions 
		WHERE user_id = ? 
		LIMIT 1`, user.ID).Scan(&sessionID)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("Error checking existing session: %v", err)
		return err
	}

	if err == nil {
		// Session exists, update it
		_, err = database.DB.Exec(`
			UPDATE sessions
			SET session_token = ?, session_expiry = ?
			WHERE user_id = ?`,
			sessionToken, utils.SessionExpiry(), user.ID)
	} else {
		// No existing session, insert new one
		_, err = database.DB.Exec(`
			INSERT INTO sessions (user_id, session_token, session_expiry)
			VALUES (?, ?, ?)`,
			user.ID, sessionToken, utils.SessionExpiry())
	}

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
