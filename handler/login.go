package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"realtimeforum/auth"
	"realtimeforum/utils"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginData auth.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(loginData.Identity) == "" || strings.TrimSpace(loginData.Password) == "" {
		http.Error(w, "Username/email and password are required", http.StatusBadRequest)
		return
	}

	user, token, err := auth.LoginUser(loginData.Identity, loginData.Password)
	if err != nil {
		log.Printf("Failed login attempt for: %s - %v", loginData.Identity, err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Set the response content type to application/json
	w.Header().Set("Content-Type", "application/json")

	// Set the session cookie with proper expiry and Secure flag in production
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(utils.SessionDuration), // Expiry based on your session duration
		Secure:   true, // Only send over HTTPS in production
	})

	// Send the login response back with the user and token information
	json.NewEncoder(w).Encode(auth.LoginResponse{
		User:      user,
		Token:     token,
		ExpiresIn: int(utils.SessionDuration.Seconds()),
	})
}
