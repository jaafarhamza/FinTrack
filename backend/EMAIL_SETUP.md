# Email Configuration Setup

This guide will help you configure email sending for password reset functionality.

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "FinTrack" as the app name
5. Copy the generated 16-character password

### Step 3: Update Environment Variables
Update your `.env` file with your email credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
FRONTEND_URL=http://localhost:5000
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP
If you want to use a custom SMTP server, modify the `emailService.js` file:

```javascript
this.transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## Testing Email Functionality

1. Start your server: `npm run dev`
2. Go to: http://localhost:5000/auth/forgot-password
3. Enter a valid email address
4. Check your email for the password reset link
5. Check the server console for email sending status
