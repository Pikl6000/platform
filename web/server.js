require('dotenv').config(); // Toto musí byť na začiatku súboru

const express = require("express");
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3000;

console.log('Session Secret:', process.env.SESSION_SECRET);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// CORS
app.use(cors({
    origin: 'http://localhost:63342',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'my-secret-key',
    resave: false, // Zlepšuje výkon tým, že session nebude znovu uložená, ak sa nebola zmenená
    saveUninitialized: false, // Zlepšuje výkon tým, že sa nebudú vytvárať sessions pre neautentizovaných používateľov
    cookie: {
        secure: false, // Toto by malo byť 'true' v produkcii s HTTPS
        sameSite: 'Lax', // Default hodnota, vhodná pre väčšinu prípadov
        maxAge: 60000 * 60 * 24 // 24 hodín
    }
}));

// Middleware pre overenie autentifikácie
const requireAuth = (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        next(); // Používateľ je autentifikovaný, pokračujeme
    } else {
        res.redirect('/login'); // Používateľ nie je autentifikovaný, presmerovanie na prihlásenie
    }
}

// Debugovanie session ID
app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    next();
});

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src *; img-src *; script-src *");
    next();
});

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
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342'); // URL frontend aplikácie
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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
            req.session.user = { id: user.id, name: user.name, email: user.email };
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.send('Logged in successfully');
                console.log('Session ID after login:', req.session.id);
            });

        } else {
            res.status(401).send('Incorrect username or password');
        }
    });
});

// Endpoint na získanie session informácií
app.get("/getSession", (req, res) => {
    if (req.session.user) {
        res.send("Username: " + req.session.user.name);
    } else {
        res.send("No session data found");
    }
});

// Logout Endpoint
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send("Error destroying session");
        } else {
            res.send("Session destroyed");
        }
    });
});

// Get Users Endpoint
app.get('/api/users', requireAuth, (req, res) => {
    console.log('Session:', req.session); // Logovanie session pre debugovanie

    const loggedInUserId = req.session.user.id;

    connection.query('SELECT * FROM users WHERE id != ?', [loggedInUserId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/api/current-user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('User not logged in');
    } else {
        return res.json({ id: req.session.user.id, name: req.session.user.name, email: req.session.user.email });
    }
});

// Post Message Endpoint
app.post('/api/messages', requireAuth, (req, res) => {
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
app.get('/api/messages/:chatId', requireAuth, (req, res) => {
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
app.get('/api/chats/', requireAuth, (req, res) => {
    const userId = req.session.user.id;
    const sql = 'SELECT chatId FROM chats WHERE userId = ?'; // Prispôsob podľa svojej štruktúry databázy

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Poskytnutie chatov a súčasného používateľa v odpovedi
        res.json({ chats: results, currentUser: req.session.user });
    });
});

// Start Server
app.listen(port, () => {
    console.log('Session Secret:', process.env.SESSION_SECRET);
    console.log(`Server is running on http://localhost:${port}`);
});
