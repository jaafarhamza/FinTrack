const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

   //Initialize email transporter
   initializeTransporter() {
     this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD 
      }
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.log('Email transporter error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }

  // Send password reset email

  async sendPasswordResetEmail(email, resetUrl, userName = 'User') {
    try {
      const mailOptions = {
        from: {
          name: 'FinTrack',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Reset Your Password - FinTrack',
        html: this.getPasswordResetEmailTemplate(resetUrl, userName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Get password reset email HTML template

  getPasswordResetEmailTemplate(resetUrl, userName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                background-color: #3B82F6;
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                display: inline-block;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #3B82F6;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #1E40AF;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
            .warning {
                background-color: #FEF3C7;
                border: 1px solid #F59E0B;
                color: #92400E;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">FinTrack</div>
                <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                
                <p>We received a request to reset your password for your FinTrack account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                    ${resetUrl}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your password will not be changed until you click the link above</li>
                    </ul>
                </div>
                
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from FinTrack - Professional Financial Management Platform</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>© 2024 FinTrack. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send email

  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: {
          name: 'FinTrack',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Welcome to FinTrack!',
        html: this.getWelcomeEmailTemplate(userName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Get welcome email HTML template

  getWelcomeEmailTemplate(userName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FinTrack</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                background-color: #3B82F6;
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                display: inline-block;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                background-color: #10B981;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">FinTrack</div>
                <h1>Welcome to FinTrack!</h1>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                
                <p>Welcome to FinTrack - your professional financial management platform!</p>
                
                <p>You can now:</p>
                <ul>
                    <li>Track your expenses and income</li>
                    <li>Set and monitor your financial goals</li>
                    <li>View detailed financial reports</li>
                    <li>Manage your budget effectively</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" class="button">Get Started</a>
                </div>
                
                <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 FinTrack. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();
