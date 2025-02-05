const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, login, register, logout } = require('../controllers/authController');
const chatController = require("../controllers/chatController");

const router = express.Router();

router.get('/', authenticateToken, userController.getAllUsersWithout);
router.get('/all', userController.getAllUsers);
router.get('/search',authenticateToken, userController.search);
router.get('/profile/:id', userController.getUserById);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyToken',userController.verifyToken);
router.put('/update/:userId', authenticateToken, userController.updateUserData);

module.exports = router;
