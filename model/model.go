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
	PostTitle string    `json:"post_title"` // Add this field
	CreatedAt time.Time `json:"created_at"`
	TimeAgo   string    `json:"time_ago"`
}


// ADD THESE TO YOUR EXISTING model/model.go FILE

// FeedPost represents a post in the feed with additional metadata
// ADD THESE TO YOUR EXISTING model/model.go FILE

// FeedPost represents a post in the feed with additional metadata
type FeedPost struct {
	ID            int           `json:"id"`
	Title         string        `json:"title"`
	Content       string        `json:"content"`
	Author        string        `json:"author"`
	UserID        string        `json:"user_id"`
	CreatedAt     string        `json:"created_at"`
	UpdatedAt     string        `json:"updated_at"`
	Topics        []string      `json:"topics"`
	CommentsCount int           `json:"comments_count"`
	ViewsCount    int           `json:"views_count"`
	RecentComments []FeedComment `json:"comments"`
}

// FeedComment represents a comment in the feed
type FeedComment struct {
	ID        int    `json:"id"`
	Content   string `json:"content"`
	Author    string `json:"author"`
	UserID    string `json:"user_id"`
	PostID    int    `json:"post_id"`
	CreatedAt string `json:"created_at"`
}


// FeedData represents the complete feed response
type FeedData struct {
	Success   bool       `json:"success"`
	Posts     []FeedPost `json:"posts"`
	Page      int        `json:"page"`
	Limit     int        `json:"limit"`
	Total     int        `json:"total"`
	HasMore   bool       `json:"has_more"`
}
  

// Add these to your existing model.go file

type ChatMessage struct {
    ID         int       `json:"id"`
    SenderID   string    `json:"sender_id"`
    ReceiverID string    `json:"receiver_id"`
    Message    string    `json:"message"`
    CreatedAt  time.Time `json:"created_at"`
    IsRead     bool      `json:"is_read"`
    SenderName string    `json:"sender_name"`
}

type ChatUser struct {
    ID               string    `json:"id"`
    Username         string    `json:"username"`
    IsOnline         bool      `json:"is_online"`
    LastActivity     time.Time `json:"last_activity"`
    LastMessage      string    `json:"last_message,omitempty"`
    LastMessageTime  time.Time `json:"last_message_time"`
    UnreadCount      int       `json:"unread_count"`
}

type TypingEvent struct {
    UserID     string `json:"user_id"`
    Username   string `json:"username"`
    ReceiverID string `json:"receiver_id"`
    IsTyping   bool   `json:"is_typing"`
}

type WebSocketMessage struct {
    Type    string      `json:"type"`
    Data    interface{} `json:"data"`
    UserID  string      `json:"user_id"`
    ChatID  string      `json:"chat_id,omitempty"`
}
