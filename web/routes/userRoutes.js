const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getAllUsers); // Získanie všetkých používateľov
router.get('/:id', userController.getUserById); // Získanie konkrétneho používateľa podľa ID
router.put('/:id', userController.updateUser); // Aktualizácia používateľa
router.delete('/:id', userController.deleteUser); // Zmazanie používateľa

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;
