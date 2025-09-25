const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbHost = process.env.NODE_ENV === 'development' && !process.env.DOCKER ? 'localhost' : process.env.DB_HOST;

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: dbHost,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
  }
);

// Test database connection
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successfully!");
    return true;
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    return false;
  }
}

// Start server
app.listen(PORT, async () => {
  // Test database connection 
  await testDatabaseConnection();
});
