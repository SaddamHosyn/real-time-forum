package model

import (
	"time"
)



type HomePageData struct {
	Posts      []Post   `json:"posts"`
	Topics     []Topic  `json:"topics"`
	User       *User    `json:"user,omitempty"`
	Success    bool     `json:"success"`
	IsLoggedIn bool     `json:"is_logged_in"`
}

type SubmitPostData struct {
	Topics []Topic `json:"topics"`
	User   *User   `json:"user,omitempty"`
}

type ProfileData struct {
	Title      string   `json:"title"`
	User       *User    `json:"user,omitempty"`
	Posts      []*Post  `json:"posts"`
	Topics     []Topic  `json:"topics"`
	IsLoggedIn bool     `json:"is_logged_in"`
	Success    bool     `json:"success"`
	Error      string   `json:"error"`
}

type Topic struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Emoji string `json:"emoji"`
}

type User struct {
	ID            string        `json:"id"`
	FirstName     string     `json:"first_name"`
	LastName      string     `json:"last_name"`
	Username      string     `json:"username"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"`
	Age           int        `json:"age"`
	Gender        string     `json:"gender"`
	TermsAccepted bool       `json:"terms_accepted"`
	SessionToken  *string    `json:"session_token,omitempty"`
	SessionExpiry *time.Time `json:"session_expiry,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

type Post struct {
	ID        int       `json:"id"`
	Author    string    `json:"author"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	UserID    string       `json:"user_id"`
	Topics    []string   `json:"topics"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Comments  []Comment `json:"comments"`
}

type Comment struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	Author    string    `json:"author"`
	UserID    string       `json:"user_id"`
	PostID    int       `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
	TimeAgo   string    `json:"time_ago"`
}


