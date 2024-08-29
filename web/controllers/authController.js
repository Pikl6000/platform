const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Funkcia na generovanie tokenu
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        process.env.JWT_SECRET, // Použitie environmentálnej premennej
        { expiresIn: '1h' }
    );
};

// Middleware na overenie tokenu
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        const verified = jwt.verify(token, 'your-jwt-secret');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};


// Prihlásenie používateľa
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid credentials');

        const token = generateToken(user);
        res.cookie('token', token, { httpOnly: true, secure: false });
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Server error');
    }
};

// Registrácia používateľa
exports.register = async (req, res) => {
    const { email, password, name, lastname, joineddate } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            lastname,
            joineddate: joineddate || new Date(),
        });

        const token = generateToken(user);
        res.cookie('token', token, { httpOnly: true, secure: false });
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
};

// Odhlásenie používateľa
exports.logout = (req, res) => {
    res.clearCookie('token');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            res.send('Session destroyed');
        }
    });
};
