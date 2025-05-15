package utils

import (
	"errors"
	"regexp"
	"time"

	"realtimeforum/model"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	SessionDuration = 24 * time.Hour
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	emailRegex    = regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`)
)

// ValidateInputs checks if the provided inputs are valid
func ValidateInputs(username, email, password, firstName, lastName string, age int, gender string, termsAccepted bool) error {
	if len(username) < 4 {
		return errors.New("username must be at least 4 characters")
	}
	if !usernameRegex.MatchString(username) {
		return errors.New("username can only contain letters, numbers and underscores")
	}
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	if len(firstName) < 2 {
		return errors.New("first name must be at least 2 characters")
	}
	if len(lastName) < 2 {
		return errors.New("last name must be at least 2 characters")
	}
	if age < 13 {
		return errors.New("you must be at least 13 years old")
	}
	if gender != "male" && gender != "female" && gender != "other" {
		return errors.New("invalid gender")
	}
	if !termsAccepted {
		return errors.New("you must accept the terms and conditions")
	}
	return nil
}

// CheckPasswordHash verifies if the provided password matches the stored hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// HashPassword hashes the password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// GenerateSessionToken generates a secure random session token
func GenerateSessionToken(user *model.User) (string, error) {
	token := uuid.New().String()

	return token, nil
}

// GetCurrentTime returns the current time in UTC
func GetCurrentTime() time.Time {
	return time.Now().UTC()
}

// SessionExpiry returns the expiry time for a session
func SessionExpiry() time.Time {
	return GetCurrentTime().Add(SessionDuration)
}
