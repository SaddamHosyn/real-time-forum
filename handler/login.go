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
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Only POST method allowed",
			"status":  "error",
		})
		return
	}

	log.Printf("Login request received: %s %s", r.Method, r.URL.Path)

	var loginData auth.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Invalid request body",
			"status":  "error",
		})
		return
	}

	loginData.Identity = strings.TrimSpace(loginData.Identity)
	loginData.Password = strings.TrimSpace(loginData.Password)

	if loginData.Identity == "" || loginData.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Username/email and password are required",
			"status":  "error",
		})
		return
	}

	log.Printf("Login attempt for identity: %s", loginData.Identity)

	// Check for existing session
	var existingSession string
	var userID int
	err := database.DB.QueryRow(`
		SELECT s.session_token, s.user_id 
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		WHERE u.username = ? OR u.email = ?`,
		loginData.Identity, loginData.Identity).Scan(&existingSession, &userID)

	if err == nil && existingSession != "" {
		_, err = database.DB.Exec("DELETE FROM sessions WHERE user_id = ?", userID)
		if err != nil {
			log.Printf("Error removing existing session: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Internal server error",
				"status":  "error",
			})
			return
		}
	}

	loginResp, err := auth.LoginUser(loginData.Identity, loginData.Password)
	if err != nil {
		log.Printf("Failed login attempt for: %s - %v", loginData.Identity, err)
		w.WriteHeader(http.StatusUnauthorized)

		// Enhanced error messaging
		var errorMsg string
		if strings.Contains(err.Error(), "user not found") {
			errorMsg = "User not found. Please check your username/email"
		} else if strings.Contains(err.Error(), "invalid password") {
			errorMsg = "Incorrect password. Please try again"
		} else {
			errorMsg = "Invalid username/email or password"
		}

		json.NewEncoder(w).Encode(map[string]string{
			"message": errorMsg,
			"status":  "error",
		})
		return
	}

	auth.SetSessionCookie(w, loginResp.Token)
	log.Printf("Successful login for user: %s", loginData.Identity)

	json.NewEncoder(w).Encode(loginResp)
}
