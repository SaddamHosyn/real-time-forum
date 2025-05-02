package utils

import (
	"errors"
	"math/rand"
	"realtimeforum/model"
	"regexp"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	SessionDuration = 24 * time.Hour
)

// ValidateInputs checks if the provided inputs are valid
func ValidateInputs(username, email, password, firstName, lastName string, age int, gender string, termsAccepted bool) error {
	if len(username) < 4 {
		return errors.New("username must be at least 4 characters")
	}
	if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(username) {
		return errors.New("username can only contain letters, numbers and underscores")
	}
	if !regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`).MatchString(email) {
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

// For hashing passwords during registration
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// GenerateSessionToken generates a session token (simple random string)
func GenerateSessionToken(user *model.User) (string, error) {
	// Generate a random session ID
	rand.Seed(time.Now().UnixNano())
	sessionToken := randSeq(64) // Longer random string for better security

	// Optionally, set an expiration time for the session in the database
	// expiration := time.Now().Add(time.Hour * 24) // 1-day expiration

	// Store sessionToken and expiration time in the user's session (in the DB)
	return sessionToken, nil
}

// randSeq generates a random string of a given length
func randSeq(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var result []byte
	for i := 0; i < n; i++ {
		result = append(result, letters[rand.Intn(len(letters))])
	}
	return string(result)
}

// GetCurrentTime returns the current time in UTC
func GetCurrentTime() time.Time {
	return time.Now().UTC()
}

// GetSessionExpiry returns the session expiry time (e.g., 24 hours from now)
// SessionExpiry calculates when a session should expire
func SessionExpiry() time.Time {
	return GetCurrentTime().Add(SessionDuration)
}
