-- Enable foreign key constraints
PRAGMA foreign_keys = ON;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    terms_accepted BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_token TEXT,
    session_expiry DATETIME 
);

-- topics table
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    emoji TEXT UNIQUE NOT NULL,
    UNIQUE(name, emoji)
);
-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
);
-- Posts_topics table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS posts_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(post_id, topic_id)
);
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    session_expiry DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
-- Chat_Messages table to store private messages between users
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT 0,
    -- Track if the message is read or not
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
-- User_Online table to track users' online status
CREATE TABLE IF NOT EXISTS user_online (
    user_id TEXT PRIMARY KEY,
    is_online BOOLEAN DEFAULT 0,
    -- 1 if online, 0 if offline
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- A table to track the last message sent between users (for "last message" sorting)
CREATE TABLE IF NOT EXISTS user_chat_last_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    last_message_id INTEGER NOT NULL,
    FOREIGN KEY(user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(last_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    UNIQUE(user1_id, user2_id)
);
CREATE TABLE IF NOT EXISTS reset_tokens (
    id TEXT PRIMARY KEY,
    -- UUID
    user_id TEXT NOT NULL,
    -- assuming user.id is a UUID
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
