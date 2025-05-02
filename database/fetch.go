package database

import (
	"database/sql"
	"errors"
	"realtimeforum/model"
)

// DB is the global database connection
var DB *sql.DB

// GetUserByIdentity fetches the user from the DB by either username or email
func GetUserByIdentity(usernameOrEmail string) (*model.User, error) {
	var user model.User
	err := DB.QueryRow(`
		SELECT id, username, email, password_hash
		FROM users
		WHERE username = ? OR email = ?`, usernameOrEmail, usernameOrEmail).
		Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// Add other general query functions here as needed...
// For example:
// func GetAllUsers() ([]model.User, error) {...}
// func CreateUser(user *model.User) error {...}
// func UpdateUserProfile(user *model.User) error {...}
