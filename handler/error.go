package handler

import (
	"encoding/json"
	"log"
	"net/http"
)

// APIError represents a structured error for API responses.
type APIError struct {
	Code    int    `json:"code"`
	Title   string `json:"title"`
	Message string `json:"message"`
}

// errorData maps HTTP status codes to default error titles and messages.
var errorData = map[int]struct {
	Title   string
	Message string
}{
	400: {"Bad Request", "The server could not understand your request."},
	401: {"Unauthorized", "You need to sign in to access this page."},
	403: {"Forbidden", "You don't have permission to access this page."},
	404: {"Page Not Found", "The page you are looking for does not exist."},
	405: {"Method Not Allowed", "The method you used is not allowed for this request."},
	500: {"Server Error", "Something went wrong on our end. Please try again later."},
}

// WriteAPIError writes a JSON error response with the given code and optional custom message.
func WriteAPIError(w http.ResponseWriter, code int, customMessage ...string) {
	data, ok := errorData[code]
	if !ok {
		code = 404
		data = errorData[404]
	}
	message := data.Message
	if len(customMessage) > 0 && customMessage[0] != "" {
		message = customMessage[0]
	}
	apiErr := APIError{
		Code:    code,
		Title:   data.Title,
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(apiErr)
}

// RecoverMiddleware is HTTP middleware that recovers from panics and writes a 500 error.
func RecoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("Recovered from panic: %v", rec)
				WriteAPIError(w, http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
