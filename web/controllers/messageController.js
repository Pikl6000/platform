

// Získanie všetkých správ pre konkrétny chat
exports.getMessagesByChatId = async (req, res) => {
    try {
        const messages = await Message.findAll({ where: { chatId: req.params.chatId } });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server error');
    }
};

// Vytvorenie novej správy
exports.createMessage = async (req, res) => {
    try {
        const { chatId, userId, message } = req.body;
        const newMessage = await Message.create({ chatId, userId, message, sendTime: new Date() });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).send('Server error');
    }
};
