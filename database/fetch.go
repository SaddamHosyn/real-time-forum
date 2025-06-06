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
        SELECT p.id, p.title, p.content, p.created_at, u.username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ? 
        ORDER BY p.created_at DESC
        LIMIT 10`, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var post model.Post
        if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.Author); err != nil {
            return nil, err
        }
        post.UserID = userID
        posts = append(posts, post)
    }

    return posts, nil
}

// Get all posts for homepage
func GetAllPosts() ([]model.Post, error) {
    var posts []model.Post
    
    rows, err := DB.Query(`
        SELECT p.id, p.title, p.content, p.user_id, p.created_at, u.username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 50`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var post model.Post
        if err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.UserID, &post.CreatedAt, &post.Author); err != nil {
            return nil, err
        }
        posts = append(posts, post)
    }

    return posts, nil
}

func GetUserComments(userID string) ([]model.Comment, error) {
    var comments []model.Comment
    
    // ✅ IMPROVED QUERY - Make sure we get all user comments
    rows, err := DB.Query(`
        SELECT c.id, c.content, c.created_at, c.post_id, p.title, u.username
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ? 
        ORDER BY c.created_at DESC`, userID) // ✅ REMOVED LIMIT to see all comments
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var comment model.Comment
        var postTitle string
        if err := rows.Scan(&comment.ID, &comment.Content, &comment.CreatedAt, &comment.PostID, &postTitle, &comment.Author); err != nil {
            return nil, err
        }
        comment.UserID = userID
        comment.PostTitle = postTitle
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


// Add this function to your existing fetch.go file
func GetCommentsByPostID(postID int) ([]model.Comment, error) {
	query := `
		SELECT c.id, c.content, u.username, c.user_id, c.post_id, c.created_at
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`

	rows, err := DB.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []model.Comment
	for rows.Next() {
		var comment model.Comment
		err := rows.Scan(&comment.ID, &comment.Content, &comment.Author, &comment.UserID, &comment.PostID, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}



// Add this function to fetch.go to get topics for a post
func GetTopicsForPost(postID int) ([]string, error) {
    query := `
        SELECT t.name 
        FROM topics t
        JOIN posts_topics pt ON t.id = pt.topic_id
        WHERE pt.post_id = ?
    `

    rows, err := DB.Query(query, postID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var topics []string
    for rows.Next() {
        var topicName string
        err := rows.Scan(&topicName)
        if err != nil {
            return nil, err
        }
        topics = append(topics, topicName)
    }

    return topics, nil
}








// ADD THESE TO YOUR EXISTING database/fetch.go FILE

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

// GetFeedPosts retrieves paginated posts for the feed
func GetFeedPosts(limit, offset int) ([]model.FeedPost, error) {
	query := `
		SELECT p.id, p.title, p.content, p.user_id, p.created_at, p.updated_at, u.username
		FROM posts p
		JOIN users u ON p.user_id = u.id
		ORDER BY p.created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.FeedPost
	for rows.Next() {
		var post model.FeedPost
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.UserID, 
			&post.CreatedAt, &post.UpdatedAt, &post.Author)
		if err != nil {
			return nil, err
		}

		// Get topics for this post
		topics, err := GetTopicsForPost(post.ID)
		if err != nil {
			post.Topics = []string{} // Default to empty if error
		} else {
			post.Topics = topics
		}

		// Get comment count
		commentCount, err := GetPostCommentsCount(post.ID)
		if err != nil {
			post.CommentsCount = 0
		} else {
			post.CommentsCount = commentCount
		}

		// Get views count (placeholder for now)
		post.ViewsCount = 0

		// Get recent comments (first 3)
		recentComments, err := GetPostCommentsPaginated(post.ID, 3, 0)
		if err != nil {
			post.RecentComments = []model.FeedComment{}
		} else {
			post.RecentComments = recentComments
		}

		posts = append(posts, post)
	}

	return posts, nil
}

// GetTotalPostsCount returns the total number of posts
func GetTotalPostsCount() (int, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM posts").Scan(&count)
	return count, err
}

// GetPostCommentsCount returns the number of comments for a specific post
func GetPostCommentsCount(postID int) (int, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM comments WHERE post_id = ?", postID).Scan(&count)
	return count, err
}

// GetPostCommentsPaginated retrieves paginated comments for a specific post
func GetPostCommentsPaginated(postID, limit, offset int) ([]model.FeedComment, error) {
	query := `
		SELECT c.id, c.content, c.user_id, c.post_id, c.created_at, u.username
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
		LIMIT ? OFFSET ?
	`

	rows, err := DB.Query(query, postID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []model.FeedComment
	for rows.Next() {
		var comment model.FeedComment
		err := rows.Scan(&comment.ID, &comment.Content, &comment.UserID, 
			&comment.PostID, &comment.CreatedAt, &comment.Author)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}
