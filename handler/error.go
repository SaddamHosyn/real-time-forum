package handler

import (
	"net/http"
	"strconv"
)

// ErrorHandler handles HTTP errors by redirecting to the SPA shell (index.html)
// with the appropriate error code as a query parameter, so JavaScript can render the correct error page.
func ErrorHandler(w http.ResponseWriter, r *http.Request, status int) {
	// Redirect to index.html with the error code as a query parameter
	http.Redirect(w, r, "/index.html?error="+strconv.Itoa(status), http.StatusTemporaryRedirect)
}
