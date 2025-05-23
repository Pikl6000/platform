const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const db = require('./models');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Nastavenie CORS
app.use(cors({
    origin: 'http://localhost:63342',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Nastavenie session
app.use(session({
    secret: 'your-secret-key', // Nastavte silný tajný kľúč
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none'
    }
}));

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

sequelize.sync()
    .then(() => console.log('Database synchronized.'))
    .catch(err => console.error('Database synchronization error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
