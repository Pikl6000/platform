const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, login, register, logout } = require('../controllers/authController'); // Správny import


const router = express.Router();

router.get('/', authenticateToken, userController.getAllUsersWithout); // Unikátna cesta
router.get('/all', userController.getAllUsers); // Použitie inej cesty pre getAllUsers
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;
