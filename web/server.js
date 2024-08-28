require('dotenv').config();
const express = require("express");
const jwt = require('jsonwebtoken'); // Pridaj JWT knižnicu
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors({
    origin: 'http://localhost:63342',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
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

// Funkcia na generovanie JWT tokenu
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        'your_super_secret_key',
        { expiresIn: '1h' }
    );
};

// Middleware na overenie JWT tokenu
const requireAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log(token);
    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, 'your_super_secret_key', (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).send('Invalid token');
        }
        req.user = decoded; // Uložíme si dekódované informácie o používateľovi
        next();
    });
};


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { email, password, name, lastName, joineddate, lastonline } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

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
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
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
                const token = generateToken(user); // Vytvoríme JWT token
                return res.json({ token }); // Vrátime token používateľovi
            } else {
                return res.status(401).send('Incorrect username or password');
            }
        });
    } else {
        return res.status(400).send('Please provide both username and password');
    }
});


// Endpoint na získanie session informácií
// app.get("/api/getSession", (req, res) => {
//     if (req.session.user) {
//         res.send("Username: " + req.session.user.name);
//     } else {
//         res.send("No session data found");
//     }
// });

// Logout Endpoint
app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send("Error destroying session");
        } else {
            res.send("Session destroyed");
        }
    });
});

// Protected endpoint
app.get('/api/users', requireAuth, (req, res) => {
    const loggedInUserId = req.user.id; // Používame req.user.id namiesto req.session.user.id
    connection.query('SELECT * FROM users WHERE id != ?', [loggedInUserId], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// Get Current User Endpoint
app.get('/api/current-user', requireAuth, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
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