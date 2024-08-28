const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    joineddate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    birthday: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastonline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    number: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    refresh_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    token_expiration: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
