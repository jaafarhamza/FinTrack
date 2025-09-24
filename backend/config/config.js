const path = require('path');
const dotenv = require('dotenv');

// chemin absolu vers ton .env dans le root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// console.log('DB_USER:', process.env.MYSQL_USER);
// console.log('DB_PASSWORD:', process.env.MYSQL_PASSWORD);
// console.log('DB_NAME:', process.env.MYSQL_DATABASE);

module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
  test: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
};
