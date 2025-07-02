# Real-Time Forum

A modern, single-page forum application built with **Go**, **SQLite**, and **Vanilla JavaScript**. This project supports real-time private messaging, live user status, post feeds, commenting, and more—all in a single HTML file (SPA).

---

## Features

- **User Registration & Login**

  - Register
  - Login
  - Secure session management (cookies)
  - Logout from any page

- **Posts & Comments**

  - Create posts with categories
  - Feed view of all posts
  - Click a post to view and comment
  - Only logged-in users can post/comment

- **Real-Time Private Messaging**

  - Live chat with online/offline users
  - See user list ordered by last message or alphabetically
  - Click a user to view chat history
  - Real-time updates
  - Message format includes sender, date, and content

- **SPA (Single Page Application)**
  - All navigation handled via JavaScript and hash routing
  - Only one HTML file (`index.html`)
  - All UI updates are dynamic (no page reloads)

---

## Tech Stack

- **Backend:** Go (Golang), Gorilla WebSocket, SQLite3, bcrypt, uuid
- **Frontend:** HTML, CSS, Vanilla JavaScript (no frameworks)
- **Database:** SQLite (file-based, easy to run anywhere)
- **Docker:** For easy deployment and reproducibility

---

## Project Structure

.
├── assets/ # Static files (css, js, images)
├── auth/ # Authentication logic (Go)
├── database/ # DB schema, seed, and access logic (Go)
├── handler/ # HTTP route handlers (Go)
├── middleware/ # Middleware (Go)
├── model/ # Data models (Go)
├── server/ # Server setup (Go)
├── utils/ # Utility functions (Go)
├── websocket/ # Real-time chat logic (Go)
├── index.html # Single page application entry point
├── main.go # Main entry point
├── Dockerfile # Docker build instructions
├── .dockerignore # Docker ignore rules
├── go.mod/go.sum # Go dependencies
└── mydatabase.db # SQLite database (local/dev only)

text

---

## Getting Started

### Local Development (without Docker)

1. **Install Go and SQLite3**
2. **Prepare the database:**
   make prepare-db

text 3. **Run the server:**
make run

text 4. Visit [http://localhost:8080](http://localhost:8080)

### Run with Docker

1. **Build the Docker image:**
   docker build -t realtimeforum .

text 2. **Run the container:**
docker run -p 8080:8080 realtimeforum

text

- For persistent database:
  ```
  docker run -p 8080:8080 -v $(pwd)/mydatabase.db:/app/mydatabase.db realtimeforum
  ```

---

## Allowed Go Packages

- All standard Go packages
- [Gorilla websocket](https://github.com/gorilla/websocket)
- [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3)
- [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt)
- [gofrs/uuid](https://github.com/gofrs/uuid) or [google/uuid](https://github.com/google/uuid)

**No frontend frameworks or libraries (React, Vue, Angular, etc.).**

---

## Learning Outcomes

- HTML, CSS, JavaScript (DOM, SPA, hash routing)
- HTTP, sessions, cookies
- Go routines, channels, WebSockets (Go & JS)
- SQL and database manipulation
- Real-time web application architecture

---

## License

This project is for educational purposes.

---

_Happy hacking! If you have questions or want to contribute, open an issue or pull request._

**Tip:**

- For best real-time experience, open two browsers and log in as different users!
- Test on both desktop and mobile for responsive design.
