package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"

	"github.com/google/uuid"
)

type LoginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User      *model.User `json:"user"`
	Token     string      `json:"token"`
	ExpiresIn int         `json:"expires_in"`
}

func LoginUser(usernameOrEmail, password string) (*LoginResponse, error) {
	log.Printf("Login attempt with identity: %s", usernameOrEmail)

	// Fetch user data
	user, err := database.GetUserByIdentity(usernameOrEmail)
	if err != nil {
		log.Printf("Error finding user by identity: %v", err)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid credentials")
		}
		return nil, fmt.Errorf("database error: %w", err)
	}

	log.Printf("User found with ID: %s", user.ID)

	// Validate password hash
	log.Printf("Comparing password with stored hash for user: %s", user.Username)
	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// Generate a new session token
	token, err := utils.GenerateSessionToken(user)
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Insert the new session in the database (create or update)
	if err := updateSessionForUser(user.ID, token); err != nil {
		log.Printf("Failed to update session: %v", err)
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	return &LoginResponse{
		User:      user,
		Token:     token,
		ExpiresIn: 3600, // Token expiration (e.g., 1 hour)
	}, nil
}

// Helper function to update the session for the user
func updateSessionForUser(userID, token string) error {
	_, err := database.DB.Exec(`
		INSERT INTO sessions (user_id, session_token, session_expiry) 
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE 
			session_token = ?, session_expiry = ?
	`, userID, token, utils.SessionExpiry(), token, utils.SessionExpiry())
	return err
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
