package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/database"
	"strings"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method allowed", http.StatusMethodNotAllowed)
		return
	}

	log.Printf("Login request received: %s %s", r.Method, r.URL.Path)

	var loginData auth.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(loginData.Identity) == "" || strings.TrimSpace(loginData.Password) == "" {
		http.Error(w, "Username/email and password are required", http.StatusBadRequest)
		return
	}

	log.Printf("Login attempt for identity: %s", loginData.Identity)

	// First check if user already has an active session
	var existingSession string
	var userID int
	err := database.DB.QueryRow(`
		SELECT s.session_token, s.user_id 
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		WHERE u.username = ? OR u.email = ?`,
		loginData.Identity, loginData.Identity).Scan(&existingSession, &userID)

	if err == nil && existingSession != "" {
		// User already has a session - remove it to ensure single session
		_, err = database.DB.Exec("DELETE FROM sessions WHERE user_id = ?", userID)
		if err != nil {
			log.Printf("Error removing existing session: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	loginResp, err := auth.LoginUser(loginData.Identity, loginData.Password)
	if err != nil {
		log.Printf("Failed login attempt for: %s - %v", loginData.Identity, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Invalid credentials",
			"status":  "error",
		})
		return
	}

	auth.SetSessionCookie(w, loginResp.Token)
	log.Printf("Successful login for user: %s", loginData.Identity)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loginResp)
}
