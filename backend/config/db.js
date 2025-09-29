const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const dbHost = process.env.DB_HOST;

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: dbHost,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, 
  }
);

module.exports = sequelize;
