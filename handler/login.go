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
	// Enable CORS for local development if needed
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method allowed", http.StatusMethodNotAllowed)
		return
	}

	// Log request details for debugging
	log.Printf("Login request received: %s %s", r.Method, r.URL.Path)

	var loginData auth.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if strings.TrimSpace(loginData.Identity) == "" || strings.TrimSpace(loginData.Password) == "" {
		http.Error(w, "Username/email and password are required", http.StatusBadRequest)
		return
	}

	// Log login attempt (without password)
	log.Printf("Login attempt for identity: %s", loginData.Identity)

	// Use correct return unpacking
	loginResp, err := auth.LoginUser(loginData.Identity, loginData.Password)
	if err != nil {
		log.Printf("Failed login attempt for: %s - %v", loginData.Identity, err)
		
		// Return structured error
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Invalid credentials",
			"status":  "error",
		})
		return
	}

	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    loginResp.Token,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(utils.SessionDuration),
		SameSite: http.SameSiteLaxMode,
		// Secure:   true, // Only enable in production with HTTPS
	})

	// Log successful login
	log.Printf("Successful login for user: %s", loginData.Identity)

	// Send back LoginResponse
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loginResp)
}

// Add route handler to main.go
func SetupRoutes() {
	http.HandleFunc("/api/login", LoginHandler)
	// Add other route handlers here...
}
