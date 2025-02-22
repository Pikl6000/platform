# Messaging Platform
This project is a backend application built with Node.js and Express.js, providing authentication and user session management using express-session and a MySQL database.

Key Features:
  User Authentication – Registration and login with bcrypt password hashing
  Session Management – Storing logged-in user information using express-session
  User Data Retrieval – Endpoints to fetch a list of registered users (excluding the currently logged-in user)
  Chat & Messaging – Allows sending and retrieving messages between users, with messages stored in the database
  CORS Support – Enables communication with the frontend running on http://localhost:63342
  Authentication Middleware – Protects endpoints that require login
  Content Security Policy (CSP) – Basic protection against malicious content
  
This project was created as my experimentation with NodeJs
