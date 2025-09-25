const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

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

// Import routes
const authRoutes = require('./routes/authRoutes');

// Routes
app.use('/auth', authRoutes);

// Home route - redirect to registration
app.get('/', (req, res) => {
  res.redirect('/auth/register');
});

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
  console.log(`Server running on port ${PORT}`);
  console.log(`Registration: http://localhost:${PORT}/auth/register`);
  
  // Test database connection 
  await testDatabaseConnection();
});
