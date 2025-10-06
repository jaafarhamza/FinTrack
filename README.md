# 💰 FinTrack - Professional Financial Management Platform

<div align="center">

![FinTrack Logo](https://img.shields.io/badge/FinTrack-Professional%20Finance-blue?style=for-the-badge&logo=wallet)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?style=for-the-badge&logo=mysql)
![Express.js](https://img.shields.io/badge/Express.js-5.1+-black?style=for-the-badge&logo=express)

**A comprehensive full-stack web application for personal financial management with advanced analytics, automated notifications, and professional-grade features.**

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🛠️ Installation](#installation) • [📊 Features](#features)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Installation](#️-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Usage](#-usage)
- [📊 Advanced Features](#-advanced-features)
- [🔒 Security](#-security)
- [📱 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

**FinTrack** is a professional-grade personal finance management application built with modern web technologies. It provides users with comprehensive tools to track income, manage expenses, set budgets, monitor saving goals, and receive intelligent financial insights through automated notifications and detailed analytics.

### 🎯 Key Objectives
- **Complete Financial Control**: Track all income and expenses with detailed categorization
- **Intelligent Budgeting**: Set and monitor monthly budgets with real-time spending alerts
- **Goal Achievement**: Create and track saving goals with progress visualization
- **Data Insights**: Generate comprehensive financial reports and analytics
- **Automated Alerts**: Receive email notifications for budget overruns and financial milestones

---

## ✨ Features

### 🔐 **User Management & Authentication**
- **Secure Registration & Login**: bcrypt password hashing with session management
- **Profile Management**: Complete user profile with preferences and settings
- **Password Reset**: Email-based password recovery system
- **Multi-Currency Support**: Support for different currencies (USD, EUR, etc.)
- **Notification Preferences**: Customizable email notification settings

### 💳 **Transaction Management**
- **Complete CRUD Operations**: Create, read, update, and delete transactions
- **Income & Expense Tracking**: Separate tracking for all financial movements
- **Advanced Categorization**: Custom categories with unlimited subcategories
- **Smart Filtering**: Filter by date range, type, category, and amount
- **Search Functionality**: Full-text search across transaction descriptions
- **Pagination**: Efficient handling of large transaction datasets
- **Bulk Operations**: Mass import/export capabilities

### 📊 **Budget Management**
- **Monthly Budget Creation**: Set budgets for specific categories or general spending
- **Real-Time Tracking**: Automatic calculation of spent amounts vs. budget limits
- **Visual Progress Indicators**: Color-coded progress bars and status indicators
- **Budget Alerts**: Automated warnings at customizable thresholds (default 90%)
- **Budget History**: Track budget performance across multiple months
- **Flexible Budgeting**: Support for both category-specific and general budgets

### 🎯 **Saving Goals**
- **Goal Creation**: Set financial targets with deadlines and descriptions
- **Progress Tracking**: Visual progress bars and percentage completion
- **Multiple Goal Types**: Short-term and long-term saving objectives
- **Goal Status Management**: Active, completed, and paused goal states
- **Achievement Celebrations**: Automatic completion detection and notifications

### 📈 **Analytics & Visualization**
- **Interactive Dashboard**: Comprehensive overview with key financial metrics
- **Chart.js Integration**: Professional charts for spending patterns and trends
- **Income Analytics**: Detailed breakdown of income sources and patterns
- **Expense Analysis**: Category-wise spending analysis with visual representations
- **Monthly Comparisons**: Compare financial performance across different periods
- **Quick Statistics**: Real-time financial health indicators

### 📧 **Advanced Notification System**
- **Automated Budget Alerts**: Email notifications for budget warnings and overruns
- **Customizable Thresholds**: Set personalized alert percentages (50-100%)
- **Professional Email Templates**: Beautiful HTML email notifications
- **Notification History**: Track all sent notifications in the application
- **Smart Alert Logic**: Prevents spam with intelligent notification timing
- **Email Preferences**: User-controlled notification settings

### 📤 **Data Export & Reporting**
- **Multiple Export Formats**: CSV and PDF export for all data types
- **Comprehensive Reports**: Detailed financial reports with summaries
- **Transaction Exports**: Filtered transaction data with custom date ranges
- **Budget Reports**: Monthly budget performance analysis
- **Saving Goals Reports**: Progress tracking and achievement summaries
- **Financial Statements**: Complete financial overview documents

---

## 🏗️ Architecture

### **Backend Architecture**
```
backend/
├── config/                 # Database and application configuration
├── controllers/            # Business logic and request handling
├── middleware/             # Authentication and validation middleware
├── models/                 # Sequelize database models
├── routes/                 # Express.js route definitions
├── services/               # Business logic services
├── utils/                  # Utility functions and helpers
├── views/                  # EJS templates and partials
└── public/                 # Static assets and exports
```

### **Technology Stack**

#### **Backend Technologies**
- **Node.js 18+**: Runtime environment
- **Express.js 5.1+**: Web application framework
- **MySQL 8.0+**: Relational database
- **Sequelize 6.37+**: Object-Relational Mapping (ORM)
- **bcrypt**: Password hashing and security
- **Nodemailer**: Email service integration
- **PDFKit**: PDF generation for reports
- **CSV-Writer**: CSV export functionality

#### **Frontend Technologies**
- **EJS**: Server-side templating engine
- **TailwindCSS**: Utility-first CSS framework
- **Chart.js**: Interactive data visualization
- **Font Awesome**: Icon library
- **Vanilla JavaScript ES6+**: Client-side interactivity

#### **Security & Validation**
- **express-validator**: Input validation and sanitization
- **express-session**: Session management
- **connect-session-sequelize**: Session store
- **bcrypt**: Secure password hashing
- **SQL Injection Protection**: Sequelize ORM security

---

## 🛠️ Installation

### **Prerequisites**
- Node.js 18.0 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/jaafarhamza/FinTrack.git
cd fintrack
```

### **Step 2: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 3: Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE fintrack;
exit

# Run database migrations
npx sequelize-cli db:migrate
```

### **Step 4: Environment Configuration**
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
MYSQL_DATABASE=fintrack
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password

# Application Configuration
PORT=5000
SESSION_SECRET=your_super_secret_session_key

# Email Configuration (for notifications and password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5000
```

### **Step 5: Start the Application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

---

## ⚙️ Configuration

### **Email Setup (Gmail)**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and create a custom app password
   - Use this password in your `.env` file

### **Database Configuration**
The application uses Sequelize migrations for database schema management. All tables are automatically created with proper relationships and constraints.

### **Session Configuration**
Sessions are stored in the database using `connect-session-sequelize` for persistence and scalability.

---

## 🚀 Usage

### **Getting Started**
1. **Register**: Create a new account with email and secure password
2. **Setup Profile**: Configure your personal information and preferences
3. **Create Categories**: Set up custom categories for your transactions
4. **Add Transactions**: Start tracking your income and expenses
5. **Set Budgets**: Create monthly budgets for different categories
6. **Define Goals**: Set saving goals with target amounts and deadlines

### **Dashboard Overview**
The dashboard provides a comprehensive view of your financial health:
- **Current Balance**: Real-time calculation of your financial position
- **Monthly Summary**: Income, expenses, and net amount for the current month
- **Recent Transactions**: Latest financial activities
- **Budget Overview**: Current budget status with visual indicators
- **Saving Goals**: Progress towards your financial objectives
- **Interactive Charts**: Visual representation of your spending patterns

### **Transaction Management**
- **Add Transactions**: Quick form for income and expense entries
- **Categorize**: Assign transactions to custom categories
- **Filter & Search**: Find specific transactions using various criteria
- **Edit/Delete**: Modify or remove transactions as needed
- **Export**: Download transaction data in CSV or PDF format

---

## 📊 Advanced Features

### **🔔 Intelligent Notification System**

#### **Automated Budget Alerts**
- **Warning Notifications**: Sent when spending reaches 90% of budget (customizable)
- **Overrun Alerts**: Immediate notification when budget is exceeded
- **Smart Timing**: Prevents notification spam with intelligent scheduling
- **Email Templates**: Professional HTML email notifications with detailed information

#### **Notification Types**
- `budget_warning`: When approaching budget limit
- `budget_exceeded`: When budget limit is exceeded
- `system`: General system notifications

#### **Customization Options**
- **Alert Thresholds**: Set custom percentages (50-100%)
- **Email Preferences**: Enable/disable email notifications
- **Notification History**: View all sent notifications in the app

### **📈 Advanced Analytics**

#### **Interactive Visualizations**
- **Spending Charts**: Pie charts showing category-wise expense distribution
- **Income Analysis**: Bar charts displaying income sources and trends
- **Progress Tracking**: Visual progress bars for saving goals
- **Trend Analysis**: Month-over-month financial performance comparison

#### **Financial Insights**
- **Quick Statistics**: Real-time financial health indicators
- **Balance Calculations**: Automatic balance computation including saving goals
- **Percentage Analysis**: Detailed breakdown of income and expense percentages
- **Monthly Comparisons**: Compare current month with previous periods

### **📤 Comprehensive Export System**

#### **Export Formats**
- **CSV Exports**: Structured data for spreadsheet applications
- **PDF Reports**: Professional formatted documents
- **Financial Reports**: Comprehensive monthly financial statements

#### **Export Types**
- **Transaction Reports**: Filtered transaction data with summaries
- **Budget Reports**: Monthly budget performance analysis
- **Saving Goals Reports**: Progress tracking and achievement summaries
- **Complete Financial Reports**: All-in-one financial overview

#### **Advanced Export Features**
- **Custom Date Ranges**: Export data for specific time periods
- **Category Filtering**: Export transactions by specific categories
- **Type Filtering**: Separate exports for income and expenses
- **Automatic Cleanup**: Old export files are automatically removed

### **🎯 Goal Management System**

#### **Saving Goals Features**
- **Target Setting**: Define specific financial targets with deadlines
- **Progress Tracking**: Visual progress indicators and percentage completion
- **Status Management**: Active, completed, and paused goal states
- **Achievement Detection**: Automatic completion recognition
- **Flexible Deadlines**: Optional deadline setting for time-bound goals

#### **Goal Analytics**
- **Progress Visualization**: Interactive progress bars and charts
- **Achievement Celebrations**: Special notifications for completed goals
- **Performance Tracking**: Monitor goal completion rates and patterns

---

## 🔒 Security

### **Authentication & Authorization**
- **Secure Password Hashing**: bcrypt with salt rounds for password protection
- **Session Management**: Secure session handling with database storage
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection attacks

### **Data Protection**
- **User Isolation**: Complete data separation between users
- **Secure File Handling**: Safe file upload and export mechanisms
- **Email Security**: Secure email transmission for notifications
- **Environment Variables**: Sensitive data stored in environment variables

### **Best Practices**
- **HTTPS Ready**: Application prepared for secure connections
- **Error Handling**: Secure error messages without sensitive information
- **Input Sanitization**: All user inputs are validated and sanitized
- **Session Security**: Secure session configuration with proper timeouts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Chart.js** for beautiful data visualizations
- **TailwindCSS** for the utility-first CSS framework
- **Font Awesome** for the comprehensive icon library
- **Sequelize** for the powerful ORM capabilities
- **Express.js** community for the robust web framework

---

## 📞 Support

For support, email jaafar.hamza711@gmail.com or join our community discussions.

---

<div align="center">

**Built with ❤️ for better financial management**

[⭐ Star this repository](https://github.com/jaafarhamza/FinTrack)

</div>