const db = require('../models');
const { Op } = require('sequelize');

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "." : text;
}

exports.getChatsForUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user.id;

        const chats = await db.Chat.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId },
                    { recipient_id: userId }
                ]
            },
            include: [
                { model: db.User, as: 'sender', attributes: ['id', 'name', 'lastname'] },
                { model: db.User, as: 'recipient', attributes: ['id', 'name', 'lastname'] }
            ],
            order: [['last_activity', 'DESC']]
        });

        const chatUsers = chats.map(chat => {
            const isSender = chat.sender_id === userId;
            const otherUser = isSender ? chat.recipient : chat.sender;
            return {
                chatId: chat.id,
                userId: otherUser.id,
                name: otherUser.name,
                lastname: otherUser.lastname,
                chatname: chat.name,
                lastActivity: chat.last_activity
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
        const userId1 = req.user.id;
        const userId2 = parseInt(req.params.userId, 10);

        if (!userId2 || userId1 === userId2) {
            return res.status(400).send('Invalid user ID');
        }

        // Skontroluj, či už existuje chat medzi týmito používateľmi
        let chat = await db.Chat.findOne({
            where: {
                [Op.or]: [
                    { sender_id: userId1, recipient_id: userId2 },
                    { sender_id: userId2, recipient_id: userId1 }
                ]
            }
        });

        // Ak chat neexistuje, vytvor nový
        if (!chat) {
            // Load Usernames
            const user1 = await db.User.findByPk(userId1, {
                attributes: ['name', 'lastname']
            });
            const user2 = await db.User.findByPk(userId2, {
                attributes: ['name', 'lastname']
            });

            if (!user1 || !user2) {
                return res.status(400).send('Invalid user IDs');
            }

            const chatName = truncateText(user1.name,6) +' '+ truncateText(user1.lastname,1) +'-' + truncateText(user2.name,6) +' '+ truncateText(user2.lastname,1);

            // Create new chat
            chat = await db.Chat.create({
                sender_id: userId1,
                recipient_id: userId2,
                name: chatName
            });
        }

        // Return chatID and name
        res.json({ chatId: chat.id, name: chat.name });
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
        const messages = await db.Message.findAll({
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
    const { chatId, message, to } = req.body;
    const senderId = req.user.id;

    console.log("recipient_id:", to);
    console.log("sender_id:", senderId);

    if (!chatId || !message || !to) {
        return res.status(400).send('Chat ID, recipient, and message are required');
    }

    try {
        const newMessage = await db.Message.create({
            sender_id: senderId,
            recipient_id: to,
            chatId,
            message
        });

        // Update chat activity time
        await db.Chat.update(
            { last_activity: new Date() },
            {
                where: {
                    id: chatId,
                },
            },
        );

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};

exports.updateChatName = async (req, res) => {
    const { chatId, name } = req.body;

    if (!chatId || !name || name.trim() === '') {
        return res.status(400).json({ error: 'Not enough data' });
    }

    try {
        const chat = await db.Chat.findByPk(chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        chat.name = name;
        await chat.save();

        // Update chat activity time
        await db.Chat.update(
            { last_activity: new Date() },
            {
                where: {
                    id: chatId,
                },
            },
        );

        res.json(chat);
    } catch (error) {
        console.error('Error updating chat name:', error);
    }
}
