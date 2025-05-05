package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"
	"github.com/google/uuid"
)

const minPasswordLength = 6

type LoginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User      *model.User `json:"user"`
	Token     string      `json:"token"`
	ExpiresIn int         `json:"expires_in"`
}






func LoginUser(usernameOrEmail, password string) (*model.User, string, error) {
	if len(password) < minPasswordLength {
		return nil, "", errors.New("invalid credentials")
	}

	user, err := database.GetUserByIdentity(usernameOrEmail)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", errors.New("invalid credentials")
		}
		return nil, "", fmt.Errorf("database error: %w", err)
	}

	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, "", errors.New("invalid credentials")
	}
	token, err := utils.GenerateSessionToken(user)
	if err != nil {
		 return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	if err := UpdateUserSession(user, token); err != nil {
		 return nil, "", fmt.Errorf("failed to update session: %w", err)
	}

	return user, token, nil
}




func UserExist(db *sql.DB, identity string) (string, error) {
	var id string
	err := db.QueryRow(`SELECT id FROM users WHERE username = ? OR email = ?`, identity, identity).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil // user does not exist
		}
		return "", err // actual error
	}
	return id, nil // user exists
}















func AddUser(db *sql.DB, username, email, password, firstName, lastName string, age int, gender string, termsAccepted bool) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}
	
	_, err = db.Exec(`
		INSERT INTO users (
			id, username, email, password_hash, 
			first_name, last_name, age, gender, terms_accepted
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		uuid.New().String(), username, email, hashedPassword, 
		firstName, lastName, age, gender, termsAccepted,
	)
	return err
}
