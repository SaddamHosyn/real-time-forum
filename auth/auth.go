package auth

import (
	"database/sql"
)

func UserExists(db *sql.DB, username string) (string, error) {
	var id string
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&id)
	return id, err
}

func AddUser(db *sql.DB, username, email, password, firstName, lastName string, age int, gender string) error {
	stmt, err := db.Prepare(`
		INSERT INTO users (
			username, email, password, 
			first_name, last_name, age, gender
		) VALUES (?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(username, email, password, firstName, lastName, age, gender)
	return err
}
