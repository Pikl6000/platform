const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, login, register, logout } = require('../controllers/authController');

const router = express.Router();

router.get('/', authenticateToken, userController.getAllUsersWithout);
router.get('/all', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyToken',userController.verifyToken);
router.get('/profile/:id', userController.getUserById);

module.exports = router;
