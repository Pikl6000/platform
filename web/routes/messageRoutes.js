const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/:chatId', messageController.getMessagesByChatId); // Získanie všetkých správ pre konkrétny chat
router.post('/', messageController.createMessage); // Vytvorenie novej správy

module.exports = router;
