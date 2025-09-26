const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

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

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

sessionStore.sync();

const authRoutes = require('./routes/authRoutes');
const { showDashboard } = require('./controllers/authController');

app.use('/auth', authRoutes);

app.get('/dashboard', showDashboard);

// Home page route
app.get('/home', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  
  res.render('home', {
    title: 'FinSolutions - Professional Financial Management'
  });
});

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/home');
  }
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
