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
- Typing indicators
- Scroll-based pagination for older messages

### Home Page

- Welcome announcement with community prompts
- Budget Digest Highlights section
- Quick links to Top Tips and Budgeting Calculator

### Top Tips & Budgeting Calculator

- Curated budget tips accessible from the home page
- In-page budgeting calculator (income vs. expenses breakdown)

### Find a Store

- Dedicated store finder section (`findastore.js`)

### Account Management

- User account page with profile details (`account.js`, `account.go`)

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
| DevOps   | Docker, Docker Compose                                |

---

## Project Structure

```
.
├── assets/
│   ├── css/
│   │   └── styles.css          # Global styles
│   ├── images/                 # SVG, WebP, AVIF, and favicon assets
│   └── js/
│       ├── account.js          # Account page logic
│       ├── app.js              # App bootstrap
│       ├── auth.js             # Auth state management
│       ├── authutils.js        # Auth helper utilities
│       ├── chat.js             # Real-time chat UI
│       ├── comment.js          # Comment rendering
│       ├── createpost.js       # Post creation form
│       ├── error.js            # Error page handling
│       ├── feed.js             # Post feed rendering
│       ├── findastore.js       # Store finder
│       ├── home.js             # Home page logic
│       ├── loginlogout.js      # Login/logout flow
│       ├── registerfront.js    # Registration form
│       ├── router.js           # Hash-based SPA router
│       ├── signinpage.js       # Sign-in page
│       └── topicsbar.js        # Topics/category bar
├── auth/
│   ├── auth.go                 # Authentication logic
│   └── session.go              # Session management
├── database/
│   ├── createdb.go             # DB initialisation
│   ├── fetch.go                # DB query helpers
│   ├── schema.sql              # Table definitions
│   └── seed.sql                # Seed data
├── handler/
│   ├── account.go              # Account handler
│   ├── chat.go                 # Chat HTTP handler
│   ├── comment.go              # Comment handler
│   ├── createpost.go           # Post creation handler
│   ├── error.go                # Error handler
│   ├── feed.go                 # Feed handler
│   ├── login.go                # Login handler
│   ├── logout.go               # Logout handler
│   ├── register.go             # Registration handler
│   ├── submitpost.go           # Post submit handler
│   └── topicposts.go           # Topic-filtered posts handler
├── middleware/
│   └── middleware.go           # HTTP middleware (auth guards, etc.)
├── model/
│   └── model.go                # Shared data models / structs
├── server/
│   └── server.go               # HTTP server setup and route registration
├── utils/
│   └── utils.go                # Shared utility functions
├── websocket/
│   ├── hub.go                  # WebSocket hub (connection registry)
│   └── websocket.go            # WebSocket upgrade and message handling
├── index.html                  # SPA entry point
├── main.go                     # Application entry point
├── makefile                    # Dev workflow commands
├── Dockerfile                  # Docker build instructions
├── docker-compose.yml          # Docker Compose configuration
├── .dockerignore               # Docker ignore rules
├── go.mod                      # Go module definition
├── go.sum                      # Go dependency checksums
└── mydatabase.db               # SQLite database (local/dev only — not committed)
```

---

## Getting Started

### Prerequisites

- [Go 1.20+](https://go.dev/dl/)
- [SQLite3](https://www.sqlite.org/download.html)
- [Docker](https://www.docker.com/) (optional, for containerised runs)

### Local Development (without Docker)

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd real-time-forum
   ```

2. **Prepare the database:**

   ```bash
   make prepare-db
   ```

3. **Run the server:**

   ```bash
   make run
   ```

4. Visit [http://localhost:8080](http://localhost:8080)

### Other Make Commands

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `make run`          | Fresh database + start server             |
| `make run-existing` | Start server with existing database       |
| `make run-seeded`   | Fresh database + seed data + start server |
| `make fresh-db`     | Drop and recreate database only           |
| `make db-seed`      | Seed the database                         |
| `make db-clean`     | Delete the database file                  |
| `make clean`        | Full cleanup                              |

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

### Run with Docker Compose

```bash
docker compose up --build
```

To stop and remove volumes:

```bash
docker compose down -v
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
- Docker and containerised deployment

---

## Tips

- For the best real-time experience, open two browsers and log in as different users
- Test on both desktop and mobile for responsive design
- Use `make run-seeded` to start with pre-populated data for testing

---

## License

This project is for educational purposes.
