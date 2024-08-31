const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Načítajte modely
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Chat = require('./chat')(sequelize, Sequelize.DataTypes);

// Nastavenie asociácií
db.User.associate(db);
db.Chat.associate(db);

// Exportovanie databázového objektu
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;