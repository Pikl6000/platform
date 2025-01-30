const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Získanie všetkých používateľov
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
};

exports.getAllUsersWithout = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const users = await db.User.findAll({
            where: {
                id: { [Op.ne]: currentUserId }
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
};

// Získanie konkrétneho používateľa podľa ID
exports.getUserById = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
};

// Registrácia nového používateľa
exports.registerUser = async (req, res) => {
    const { email, password, name, lastname, joineddate, lastonline } = req.body;

    if (!email || !password || !name || !lastname) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Skontrolujte, či už používateľ s týmto emailom existuje
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hashovanie hesla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Vytvorenie nového používateľa
        const user = await db.User.create({
            email,
            password: hashedPassword,
            name,
            lastname,
            joineddate,
            lastonline,
            number
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
};

// Prihlásenie používateľa
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        // Skontrolujte, či používateľ existuje
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        // Overenie hesla
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        // Generovanie JWT tokenu
        const token = jwt.sign(
            { id: user.id, email: user.email },
            'your-jwt-secret',
            { expiresIn: '1h' }
        );

        // Nastavenie cookie s tokenom
        res.cookie('token', token, { httpOnly: true, secure: false }); // secure: true pre HTTPS

        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Error logging in user');
    }
};

// Aktualizácia používateľa
exports.updateUser = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) return res.status(404).send('User not found');

        const { name, lastname, email, password } = req.body;
        user.name = name || user.name;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;
        user.password = password || user.password;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Server error');
    }
};

// Zmazanie používateľa
exports.deleteUser = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) return res.status(404).send('User not found');

        await user.destroy();
        res.send('User deleted');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Server error');
    }
};

exports.updateUserData = async (req, res) => {
    const { userId, name, lastname, number } = req.body;

    if (!userId || !name || name.trim() === '') {
        return res.status(400).json({ error: 'Not enough data' });
    }

    try {
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = name;
        user.lastname = lastname;
        user.number = number;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error updating chat name:', error);
    }
}

exports.verifyToken = (req, res) => {
    try {
        // Získaj token z hlavičky Authorization
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).send('Access Denied: No token provided');
        }

        const verified = jwt.verify(token, 'your-jwt-secret');

        if (!verified) {
            return res.status(401).send('Access Denied: Invalid token');
        }

        // Ak je token platný, odošli odpoveď so statusom 200
        res.status(200).send('Token is valid');
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).send('Invalid Token');
    }
};