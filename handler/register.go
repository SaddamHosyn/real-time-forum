package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"realtimeforum/auth"
	"realtimeforum/model"
	"realtimeforum/utils"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// Only accept POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the JSON body from the request
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	// Validate the user inputs (e.g., username, email, password, etc.)
	if err := utils.ValidateInputs(req.Username, req.Email, req.Password, req.FirstName, req.LastName, req.Age); err != nil {
		respondWithJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// Check if the username already exists
	if existingUserID, _ := auth.UserExists(model.DB, req.Username); existingUserID != "" {
		respondWithJSON(w, http.StatusConflict, map[string]string{"error": "username already exists"})
		return
	}

	// Add the new user to the database
	if err := auth.AddUser(model.DB, req.Username, req.Email, req.Password, req.FirstName, req.LastName, req.Age, req.Gender); err != nil {
		log.Printf("Error adding user: %v", err)
		respondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}

	// Respond with a success message
	respondWithJSON(w, http.StatusCreated, map[string]string{
		"message":  "User registered successfully",
		"username": req.Username,
	})
}

// Helper function to respond with JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}
