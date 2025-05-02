package handler

import (
	"encoding/json"
	"log"
	"net/http"
	
	"realtimeforum/auth"
	"realtimeforum/model"
	"realtimeforum/utils"
)

type RegisterRequest struct {
	FirstName     string `json:"firstName"`
	LastName      string `json:"lastName"`
	Username      string `json:"username"`
	Email         string `json:"email"`
	Age           int    `json:"age"`
	Gender        string `json:"gender"`
	Password      string `json:"password"`
	TermsAccepted bool   `json:"termsAccepted"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON data", http.StatusBadRequest)
		return
	}

	if err := utils.ValidateInputs(
		req.Username, req.Email, req.Password, 
		req.FirstName, req.LastName, req.Age, 
		req.Gender, req.TermsAccepted,
	); err != nil {
		respondWithJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	if existingID, _ := auth.UserExists(model.DB, req.Username); existingID != "" {
		respondWithJSON(w, http.StatusConflict, map[string]string{"error": "username already exists"})
		return
	}

	if err := auth.AddUser(
		model.DB,
		req.Username,
		req.Email,
		req.Password,
		req.FirstName,
		req.LastName,
		req.Age,
		req.Gender,
		req.TermsAccepted,
	); err != nil {
		log.Printf("Error adding user: %v", err)
		respondWithJSON(w, http.StatusInternalServerError, map[string]string{"error": "registration failed"})
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]string{
		"message":  "User registered successfully",
		"username": req.Username,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}
