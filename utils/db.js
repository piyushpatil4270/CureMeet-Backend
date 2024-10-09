require("dotenv").config();
const Sequelize = require("sequelize");


const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
   // timezone: '+05:30',
    dialectModule: require('mysql2'),
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false 
        }
    },
    logging: false,
    
});

module.exports = sequelize;
