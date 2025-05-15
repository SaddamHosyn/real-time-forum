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
    SELECT id, first_name, last_name, username, email, password_hash, age, gender, terms_accepted, session_token, session_expiry, created_at
    FROM users
    WHERE username = ? OR email = ?`, usernameOrEmail, usernameOrEmail).
		Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.PasswordHash,
			&user.Age, &user.Gender, &user.TermsAccepted, &user.SessionToken, &user.SessionExpiry, &user.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}




func GetUserPosts(userID string) ([]model.Post, error) {
	var posts []model.Post
	
	rows, err := DB.Query(`
		SELECT id, title, content, created_at 
		FROM posts 
		WHERE user_id = ? 
		ORDER BY created_at DESC
		LIMIT 10`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post model.Post
		if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GetUserComments(userID string) ([]model.Comment, error) {
	var comments []model.Comment
	
	rows, err := DB.Query(`
		SELECT c.id, c.content, c.created_at, c.post_id 
		FROM comments c
		WHERE c.user_id = ? 
		ORDER BY c.created_at DESC
		LIMIT 10`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment model.Comment
		if err := rows.Scan(&comment.ID, &comment.Content, &comment.CreatedAt, &comment.PostID); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

func UpdateUser(userID, firstName, lastName, email string) error {
	_, err := DB.Exec(`
		UPDATE users 
		SET first_name = ?, last_name = ?, email = ?
		WHERE id = ?`,
		firstName, lastName, email, userID)
	return err
}
// Add other general query functions here as needed...
// For example:
// func GetAllUsers() ([]model.User, error) {...}
// func CreateUser(user *model.User) error {...}
// func UpdateUserProfile(user *model.User) error {...}
