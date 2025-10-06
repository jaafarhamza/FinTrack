# 🔔 FinTrack Notification System Documentation

## 📋 Overview

The FinTrack notification system provides automated email alerts for budget overruns and warnings. Users receive timely notifications when their spending approaches or exceeds their budget limits, helping them maintain better financial control.

## 🏗️ System Architecture

### Core Components

1. **Notification Model** (`models/Notification.js`)
2. **Notification Service** (`services/notificationService.js`)
3. **Email Service** (`services/emailService.js`)
4. **Scheduler Service** (`services/schedulerService.js`)
5. **Notification Controller** (`controllers/notificationController.js`)
6. **Notification Routes** (`routes/notificationRoutes.js`)
7. **User Interface** (`views/notifications.ejs`)

## 📊 Database Schema

### Notifications Table
```sql
CREATE TABLE Notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  budgetId INT NULL,
  type ENUM('budget_warning', 'budget_exceeded', 'system') NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (budgetId) REFERENCES Budgets(id) ON DELETE SET NULL
);
```

### User Notification Preferences
```sql
ALTER TABLE Users ADD COLUMN emailNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE Users ADD COLUMN budgetAlertThreshold INT DEFAULT 90;
```

## 🔧 Configuration

### Environment Variables
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5000
```

### User Preferences
- **Email Notifications**: Enable/disable email alerts
- **Budget Alert Threshold**: Percentage (50-100%) when warnings are sent

## 🚀 Features

### 1. Automated Budget Monitoring
- **Frequency**: Every hour (configurable)
- **Scope**: All active budgets for current month
- **Triggers**: 
  - Budget exceeded (100%+ spending)
  - Budget warning (user-defined threshold reached)

### 2. Email Notifications
- **Professional HTML templates**
- **Responsive design**
- **Budget details included**
- **Action buttons for quick access**

### 3. In-App Notifications
- **Real-time notification center**
- **Mark as read functionality**
- **Notification history**
- **Budget details display**

### 4. Duplicate Prevention
- **24-hour cooldown** between similar notifications
- **Per-budget tracking**
- **Type-specific alerts**

## 📧 Email Templates

### Budget Warning Email
- **Subject**: ⚠️ Budget Warning - FinTrack Alert
- **Content**: 
  - User-friendly greeting
  - Budget details (name, category, amounts)
  - Current spending percentage
  - Remaining budget amount
  - Call-to-action button

### Budget Exceeded Email
- **Subject**: 🚨 Budget Exceeded - FinTrack Alert
- **Content**:
  - Urgent alert styling
  - Over-budget amount
  - Detailed budget breakdown
  - Recommendations for action

## 🎯 Notification Types

### 1. Budget Warning (`budget_warning`)
- **Trigger**: Spending reaches user-defined threshold (default 90%)
- **Frequency**: Once per day per budget
- **Purpose**: Early warning before budget is exceeded

### 2. Budget Exceeded (`budget_exceeded`)
- **Trigger**: Spending exceeds budget limit
- **Frequency**: Once per day per budget
- **Purpose**: Immediate alert for over-spending

### 3. System Notifications (`system`)
- **Trigger**: System events (future feature)
- **Purpose**: General application notifications

## 🔄 Workflow

### 1. Scheduled Check Process
```
1. Scheduler triggers every hour
2. Get all users with email notifications enabled
3. For each user:
   a. Update budget spent amounts
   b. Get current month budgets
   c. Check each budget status
   d. Determine if notification needed
   e. Check for recent duplicate notifications
   f. Create notification record
   g. Send email if enabled
4. Log results
```

### 2. Manual Check Process
```
1. User clicks "Check Budgets Now"
2. System checks current user's budgets
3. Same logic as scheduled check
4. Return results to user
```

### 3. Notification Display Process
```
1. User visits /notifications
2. Fetch user's notifications (last 20)
3. Mark all as read
4. Display with budget details
5. Provide action buttons
```

## 🛠️ API Endpoints

### GET `/notifications`
- **Purpose**: Display notifications page
- **Authentication**: Required
- **Response**: Rendered notifications page

### POST `/notifications/:id/read`
- **Purpose**: Mark specific notification as read
- **Authentication**: Required
- **Response**: JSON success/error

### POST `/notifications/mark-all-read`
- **Purpose**: Mark all user notifications as read
- **Authentication**: Required
- **Response**: JSON success/error

### POST `/notifications/preferences`
- **Purpose**: Update user notification preferences
- **Authentication**: Required
- **Body**: `{ emailNotifications, budgetAlertThreshold }`
- **Response**: Redirect to profile page

### POST `/notifications/check-budgets`
- **Purpose**: Manually trigger budget check
- **Authentication**: Required
- **Response**: JSON with notification count

## 🎨 User Interface

### Notifications Page (`/notifications`)
- **Header**: Page title and description
- **Actions**: Mark all read, Check budgets now
- **List**: Recent notifications with details
- **Empty State**: Friendly message when no notifications

### Profile Page Integration
- **Notification Preferences Section**
- **Email toggle switch**
- **Threshold slider (50-100%)**
- **Save preferences button**

### Navigation Integration
- **Notifications link in main navigation**
- **Bell icon with potential badge**
- **Consistent styling across pages**

## 🔒 Security Features

### Authentication
- All notification routes require user authentication
- User can only access their own notifications
- Session-based security

### Data Validation
- Budget threshold validation (50-100%)
- Email format validation
- Input sanitization

### Rate Limiting
- 24-hour cooldown between similar notifications
- Prevents notification spam
- Per-budget tracking

## 📈 Performance Considerations

### Database Optimization
- Indexed columns: `userId`, `budgetId`, `isRead`, `type`
- Efficient queries with proper joins
- Limited result sets (20 notifications max)

### Email Delivery
- Asynchronous email sending
- Error handling and logging
- Retry mechanisms (future enhancement)

### Scheduler Efficiency
- Hourly checks (configurable)
- User filtering (only enabled users)
- Batch processing

## 🧪 Testing

### Manual Testing
1. **Create test budget** with low amount
2. **Add transaction** to exceed budget
3. **Check notifications** page
4. **Verify email** delivery
5. **Test preferences** update

### Automated Testing (Future)
- Unit tests for notification service
- Integration tests for email delivery
- End-to-end tests for user workflow

## 🚀 Deployment

### Prerequisites
1. **Database migrations** applied
2. **Email configuration** set up
3. **Environment variables** configured
4. **Dependencies** installed

### Steps
1. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Verify scheduler starts:
   ```
   Starting budget notification scheduler...
   Budget notification scheduler started (runs every hour)
   ```

## 🔧 Configuration Options

### Email Templates
- Customize HTML templates in `emailService.js`
- Modify styling and content
- Add branding elements

## 🐛 Troubleshooting

### Common Issues

#### 1. Emails Not Sending
- Check email configuration in `.env`
- Verify SMTP credentials
- Check email service logs

#### 2. Notifications Not Appearing
- Verify database migrations applied
- Check user notification preferences
- Review scheduler service logs

#### 3. Duplicate Notifications
- Check 24-hour cooldown logic
- Verify notification type filtering
- Review database constraints

### Debug Commands
```bash
# Check notification service manually
npm run check-budgets

# View server logs
npm start

# Check database
npx sequelize-cli db:migrate:status
```

