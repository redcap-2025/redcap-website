const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Password reset email template
const resetPasswordTemplate = (resetUrl, userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { 
            background: #dc2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block; 
            margin: 20px 0; 
        }
        .footer { 
            margin-top: 20px; 
            padding: 20px; 
            background: #f3f4f6; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RedCap Courier</h1>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your RedCap account. 
            Click the button below to create a new password:</p>
            
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If you didn't request this reset, please ignore this email. 
            Your password will remain unchanged.</p>
            
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            
            <p>Best regards,<br>The RedCap Team</p>
        </div>
        
        <div class="footer">
            <p>© 2024 RedCap Courier. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

// Send reset email function
const sendResetEmail = async (email, resetUrl, userName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@redcap.com',
      to: email,
      subject: 'RedCap - Password Reset Request',
      html: resetPasswordTemplate(resetUrl, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Test email connection (optional)
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};

module.exports = { sendResetEmail, testEmailConnection };