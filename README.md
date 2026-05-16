# Real-Time Forum

A modern, single-page forum application built with **Go**, **SQLite**, and **Vanilla JavaScript**. Supports real-time private messaging, live user status, post feeds, and commenting — all in a single HTML file (SPA).

---

## Features

### User Registration & Login

- Register and login with secure session management (cookies)
- Logout from any page

### Posts & Comments

- Create posts with categories
- Feed view of all posts
- Click a post to view and add comments
- Only logged-in users can post or comment

### Real-Time Private Messaging

- Live chat with online/offline users
- User list ordered by last message or alphabetically
- Click a user to view chat history
- Real-time updates via WebSocket
- Messages include sender, date, and content

### SPA (Single Page Application)

- All navigation handled via JavaScript and hash routing
- Single HTML file (`index.html`)
- All UI updates are dynamic — no page reloads

---

## Tech Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Backend  | Go (Golang), Gorilla WebSocket, SQLite3, bcrypt, uuid |
| Frontend | HTML, CSS, Vanilla JavaScript (no frameworks)         |
| Database | SQLite (file-based)                                   |
| DevOps   | Docker                                                |

---

## Project Structure

```
.
├── assets/          # Static files (CSS, JS, images)
├── auth/            # Authentication logic (Go)
├── database/        # DB schema, seed, and access logic (Go)
├── handler/         # HTTP route handlers (Go)
├── middleware/       # Middleware (Go)
├── model/           # Data models (Go)
├── server/          # Server setup (Go)
├── utils/           # Utility functions (Go)
├── websocket/       # Real-time chat logic (Go)
├── index.html       # SPA entry point
├── main.go          # Main entry point
├── Dockerfile       # Docker build instructions
├── .dockerignore    # Docker ignore rules
├── go.mod / go.sum  # Go dependencies
└── mydatabase.db    # SQLite database (local/dev only)
```

---

## Getting Started

### Local Development (without Docker)

1. **Install Go and SQLite3**

2. **Prepare the database:**

   ```bash
   make prepare-db
   ```

3. **Run the server:**

   ```bash
   make run
   ```

4. Visit [http://localhost:8080](http://localhost:8080)

### Run with Docker

1. **Build the image:**

   ```bash
   docker build -t realtimeforum .
   ```

2. **Run the container:**

   ```bash
   docker run -p 8080:8080 realtimeforum
   ```

3. **With a persistent database:**
   ```bash
   docker run -p 8080:8080 -v $(pwd)/mydatabase.db:/app/mydatabase.db realtimeforum
   ```

---

## Allowed Go Packages

- All standard Go packages
- [gorilla/websocket](https://github.com/gorilla/websocket)
- [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3)
- [golang.org/x/crypto/bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt)
- [gofrs/uuid](https://github.com/gofrs/uuid) or [google/uuid](https://github.com/google/uuid)

> **No frontend frameworks or libraries (React, Vue, Angular, etc.)**

---

## Learning Outcomes

- HTML, CSS, JavaScript — DOM manipulation, SPA architecture, hash routing
- HTTP, sessions, and cookies
- Go routines, channels, and WebSockets (Go & JS)
- SQL and database manipulation
- Real-time web application architecture

---

## Tips

- For the best real-time experience, open two browsers and log in as different users
- Test on both desktop and mobile for responsive design

---

## License

This project is for educational purposes.
