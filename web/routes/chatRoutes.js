const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

router.post('/chat/:userId', authenticateToken, chatController.getOrCreateChat);
router.get('/messages/:chatId', authenticateToken, chatController.getMessages);
router.post('/message', authenticateToken, chatController.sendMessage);
router.get('/chats', authenticateToken, chatController.getChatsForUser);

module.exports = router;
