const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');
const { Op } = require('sequelize');

exports.getChatsForUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user.id;
        console.log('User ID:', userId);

        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId },
                    { recipient_id: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'lastname'] },
                { model: User, as: 'recipient', attributes: ['id', 'name', 'lastname'] }
            ]
        });

        const chatUsers = chats.map(chat => {
            const isSender = chat.sender_id === userId;
            const otherUser = isSender ? chat.recipient : chat.sender;
            return {
                chatId: chat.id,
                userId: otherUser.id,
                name: otherUser.name,
                lastname: otherUser.lastname
            };
        });

        res.json(chatUsers);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).send('Server error');
    }
};


// Funkcia na získanie alebo vytvorenie chatu medzi dvoma používateľmi
exports.getOrCreateChat = async (req, res) => {
    try {
        const userId1 = req.user.id; // ID prihláseného používateľa
        const userId2 = parseInt(req.params.userId, 10); // ID vybraného používateľa z parametra

        if (!userId2 || userId1 === userId2) {
            return res.status(400).send('Invalid user ID');
        }

        // Skontroluj, či už existuje chat medzi týmito používateľmi
        let chat = await Chat.findOne({
            where: {
                [Op.or]: [
                    { sender_id: userId1, recipient_id: userId2 },
                    { sender_id: userId2, recipient_id: userId1 }
                ]
            }
        });

        // Ak chat neexistuje, vytvor nový
        if (!chat) {
            chat = await Chat.create({
                sender_id: userId1,
                recipient_id: userId2
            });
        }

        // Vráť ID chatu
        res.json({ chatId: chat.id });
    } catch (error) {
        console.error('Error creating or fetching chat:', error);
        res.status(500).send('Server error');
    }
};

// Funkcia na získanie správ pre daný chat
exports.getMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId; // ID chatu

        // Získaj všetky správy pre daný chat
        const messages = await Message.findAll({
            where: { chatId: chatId },
            order: [['sendTime', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server error');
    }
};

// Funkcia na odoslanie správy
exports.sendMessage = async (req, res) => {
    const { chatId, message } = req.body;
    const senderId = req.user.id; // Získaj ID prihláseného používateľa

    if (!chatId || !message) {
        return res.status(400).send('Chat ID and message are required');
    }

    try {
        const newMessage = await Message.create({
            from: senderId,
            to: req.body.to, // Predpokladáme, že ID príjemcu je odoslané v tele požiadavky
            chatId,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};
