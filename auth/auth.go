package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
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
	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// ENFORCE SINGLE SESSION: Delete ALL existing sessions for this user
	_, err = database.DB.Exec("DELETE FROM sessions WHERE user_id = ?", user.ID)
	if err != nil {
		log.Printf("Failed to delete existing sessions: %v", err)
		return nil, fmt.Errorf("failed to clear existing sessions: %w", err)
	}

	// Generate a new session token
	token := uuid.New().String()
	expiryTime := time.Now().Add(24 * time.Hour) // 24 hour session

	// Insert the new session in the database
	_, err = database.DB.Exec(`
		INSERT INTO sessions (user_id, session_token, session_expiry)
		VALUES (?, ?, ?)`,
		user.ID, token, expiryTime)
	if err != nil {
		log.Printf("Failed to create new session: %v", err)
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	log.Printf("New session created for user %s with token: %s", user.Username, token)

	return &LoginResponse{
		User:      user,
		Token:     token,
		ExpiresIn: 86400, // 24 hours in seconds
	}, nil
}

func GetUserBySessionToken(sessionToken string) (*model.User, error) {
	var user model.User

	err := database.DB.QueryRow(`
		SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.password_hash, 
		       u.age, u.gender, u.terms_accepted, u.created_at, s.session_expiry
		FROM users u
		JOIN sessions s ON u.id = s.user_id
		WHERE s.session_token = ? AND s.session_expiry > ?`,
		sessionToken, time.Now()).
		Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, 
			 &user.PasswordHash, &user.Age, &user.Gender, &user.TermsAccepted, 
			 &user.CreatedAt, &user.SessionExpiry)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid session token")
		}
		return nil, err
	}
	return &user, nil
}

func LogoutUser(sessionToken string) error {
	// Delete the specific session
	result, err := database.DB.Exec("DELETE FROM sessions WHERE session_token = ?", sessionToken)
	if err != nil {
		return err
	}
	
	rowsAffected, _ := result.RowsAffected()
	log.Printf("Logout: deleted %d sessions", rowsAffected)
	return nil
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
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(24 * time.Hour),
	})
}

func ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
}

func UserExist(db *sql.DB, identity string) (string, error) {
	var id string
	err := db.QueryRow(`SELECT id FROM users WHERE username = ? OR email = ?`, identity, identity).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return id, nil
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

// Clean up expired sessions
func CleanupExpiredSessions() error {
	_, err := database.DB.Exec("DELETE FROM sessions WHERE session_expiry < ?", time.Now())
	return err
}
