import 'dotenv/config';
import { EmailService } from './src/services/email.service';

async function testEmail() {
  const emailService = new EmailService();
  try {
    const htmlContent = `
      <html>
        <body>
          <h1>Test Email from Rolevate</h1>
          <p>This is a test email sent from <strong>admin@rolevate.com</strong> via AWS SES.</p>
          <p>If you receive this, email integration is working correctly!</p>
          <hr>
          <small>Sent from Rolevate Backend - ${new Date().toISOString()}</small>
        </body>
      </html>
    `;
    
    await emailService.sendEmail(
      'husain.f4l@gmail.com', 
      'Test Email from Rolevate - AWS SES', 
      'This is a test email from Rolevate via AWS SES. If you can read this, the email was delivered successfully!',
      htmlContent
    );
    console.log('Email sent successfully! Check your inbox (and spam folder) at husain.f4l@gmail.com');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();
