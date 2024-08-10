const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: 'http://localhost:63342', // URL vašej frontend aplikácie
    credentials: true // Povolenie cookies a prístupových údajov
}));

// Session
app.use(session({
    secret: 'your-secret-key', // Zmeňte na vlastný tajný kľúč
    resave: false,
    saveUninitialized: false, // Nastavte na false pre efektívnejšie používanie session
    cookie: { secure: false, httpOnly: true } // Nastavte secure na true, ak používate HTTPS
}));

// Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'platform'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// CORS Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342'); // URL vašej frontend aplikácie
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' http://localhost:3000; script-src 'self'");
    next();
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
    console.log('Received a registration request');
    const { email, password, name, lastName, joineddate, lastonline } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hashovanie hesla

    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(400).send('Email already exists');
        }

        const sql = 'INSERT INTO users (email, password, name, lastName, joineddate, lastonline) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [email, hashedPassword, name, lastName, joineddate, lastonline], (err, results) => {
            if (err) {
                console.error('Error inserting into the database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).send('User registered');
        });
    });
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(401).send('Incorrect username or password');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.user = user; // Uložte používateľa do relácie
            res.send('Logged in successfully');
        } else {
            res.status(401).send('Incorrect username or password');
        }
    });
});

// Logout Endpoint
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Unable to log out');
        }
        res.send('Logged out successfully');
    });
});

// Get Users Endpoint
app.get('/api/users', (req, res) => {
    console.log('Received request for /api/users');
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// Post Message Endpoint
app.post('/api/messages', (req, res) => {
    const { from, to, chatId, message } = req.body;
    const sendTime = new Date();

    const sql = 'INSERT INTO messages (from, to, chatId, message, sendTime) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [from, to, chatId, message, sendTime], (err, results) => {
        if (err) {
            console.error('Error inserting into the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(201).json({ id: results.insertId });
    });
});

// Get Messages for a Chat
app.get('/api/messages/:chatId', (req, res) => {
    const chatId = req.params.chatId;
    connection.query('SELECT * FROM messages WHERE chatId = ?', [chatId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// Get Chats for a User
app.get('/api/chats/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT chatId FROM chats WHERE userId = ?'; // Prispôsob podľa svojej štruktúry databázy
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
