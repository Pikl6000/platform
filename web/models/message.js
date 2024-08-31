const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importuje pripojenie k databáze

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    from: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    to: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sendTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = Message;
