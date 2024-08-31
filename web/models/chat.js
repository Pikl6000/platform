const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Chat = sequelize.define('Chat', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        recipient_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'chats'
    });

    Chat.associate = (models) => {
        Chat.belongsTo(models.User, {
            as: 'sender',
            foreignKey: 'sender_id'
        });
        Chat.belongsTo(models.User, {
            as: 'recipient',
            foreignKey: 'recipient_id'
        });
    };

    return Chat;
};
