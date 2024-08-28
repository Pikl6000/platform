const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('platform', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection unsuccessful :', err));

module.exports = sequelize;
