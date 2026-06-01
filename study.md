+-------------------+         +-------------------+         +-------------------+
|                   |         |                   |         |                   |
|    Web Browser    | <-----> |   Frontend JS     | <-----> |   Static Assets   |
| (User Interface)  |         | (assets/js/*.js)  |         | (HTML/CSS/Images) |
|                   |         |                   |         |                   |
+-------------------+         +-------------------+         +-------------------+
         |                             |                             
         |                             |                             
         |   HTTP Requests (AJAX)      |                             
         +---------------------------->|                             
         |                             |                             
         |   WebSocket Connection      |                             
         +---------------------------->|                             
         |                             |                             
         v                             v                             
+---------------------------------------------------------------+
|                        Go Web Server                          |
|                  (main.go, server/server.go)                  |
|                                                               |
|   +-------------------+      +-------------------+            |
|   |   Middleware      |      |   WebSocket Hub   |            |
|   | (middleware.go)   |      | (websocket/hub.go)|            |
|   +-------------------+      +-------------------+            |
|            |                          |                       |
|            v                          v                       |
|   +-------------------+      +-------------------+            |
|   |   Handlers        |      |   WebSocket       |            |
|   | (handler/*.go)    |      | (websocket.go)    |            |
|   +-------------------+      +-------------------+            |
|            |                          |                       |
|            v                          v                       |
|   +-------------------+      +-------------------+            |
|   |   Auth/Session    |      |   Real-Time Msgs  |            |
|   | (auth/*.go)       |      |                   |            |
|   +-------------------+      +-------------------+            |
|            |                                              |
|            v                                              |
|   +-------------------+                                   |
|   |   Database Layer  |                                   |
|   | (database/*.go,   |                                   |
|   |  schema.sql)      |                                   |
|   +-------------------+                                   |
|            |                                              |
|            v                                              |
|   +-------------------+                                   |
|   |   Utilities       |                                   |
|   | (utils/utils.go)  |                                   |
|   +-------------------+                                   |
+-----------------------------------------------------------+


1. Web Browser (User Interface)

Users interact with the forum via forms, buttons, and chat windows.
2. Frontend JS (assets/js/)

Handles all dynamic UI logic, form submissions, and real-time updates.
Sends HTTP requests for actions like login, register, posting, etc.
Opens WebSocket connections for real-time chat.
3. Static Assets

HTML, CSS, and images for rendering the UI.
4. Go Web Server

The core backend, started from main.go.
Sets up HTTP routes and WebSocket endpoints.
5. Middleware (middleware.go)
Intercepts requests for authentication, authorization, and logging.
6. Handlers (handler/*.go)

Business logic for each route (login, register, post, comment, etc.).
Validates input, interacts with the database, and returns responses.
7. Auth/Session (auth/*.go)

Manages user authentication, session creation, and validation.
8. WebSocket Hub (websocket/hub.go) & WebSocket (websocket.go)

Manages all real-time connections and message broadcasting for chat.

9. Database Layer (database/*.go, schema.sql)

Handles all data storage and retrieval (users, posts, comments, etc.).
10. Utilities (utils/utils.go)

Helper functions used throughout the backend.

Typical User Flow Example
User opens the site (browser loads HTML, CSS, JS).
User logs in (JS sends HTTP POST to /login).
Server authenticates, creates a session, responds.
User posts a message (JS sends HTTP POST to /post).
Handler validates, stores in database, responds.
For chat, JS opens a WebSocket connection.
User sends a chat message (JS → WebSocket).
Server broadcasts message to all connected clients in real time.
