package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"realtimeforum/database"
	"realtimeforum/model"
	"realtimeforum/utils"
	"strings"
	"github.com/google/uuid"
	
)

const (
	minPasswordLength = 6
)

// Auth request/response structs
type LoginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User      *model.User `json:"user"`
	Token     string      `json:"token"`
	ExpiresIn int         `json:"expires_in"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginData LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(loginData.Identity) == "" || strings.TrimSpace(loginData.Password) == "" {
		http.Error(w, "Username/email and password are required", http.StatusBadRequest)
		return
	}

	user, token, err := LoginUser(loginData.Identity, loginData.Password)
	if err != nil {
		log.Printf("Failed login attempt for: %s - %v", loginData.Identity, err)
		http.Error(w, "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(LoginResponse{
		User:      user,
		Token:     token,
		ExpiresIn: int(utils.SessionDuration.Seconds()),
	})
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

	sessionToken, err := utils.GenerateSessionToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	if err := UpdateUserSession(user, sessionToken); err != nil {
		return nil, "", fmt.Errorf("failed to update session: %w", err)
	}

	return user, sessionToken, nil
}

func UserExists(db *sql.DB, username string) (string, error) {
	var id string
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&id)
	return id, err
}

func AddUser(db *sql.DB, username, email, password, firstName, lastName string, age int, gender string, termsAccepted bool) error {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}
	newUUID := uuid.New().String() // ✅ Generate UUID here

	_, err = db.Exec(`
		INSERT INTO users (
			username, email, password_hash, 
			first_name, last_name, age, gender, terms_accepted
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		newUUID, username, email, hashedPassword, firstName, lastName, age, gender, termsAccepted,
	)
	return err
}



