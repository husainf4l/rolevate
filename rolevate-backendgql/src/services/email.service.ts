import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const params = {
      Source: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: text,
          },
          ...(html && {
            Html: {
              Data: html,
            },
          }),
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendTemplateEmail(to: string, templateName: string, params: string[]): Promise<void> {
    // For now, simple template handling. In production, use SES templates.
    let subject = 'Notification';
    let content = `Hello, this is a ${templateName} message.`;

    if (templateName === 'application_status_update' && params.length >= 2) {
      subject = `Application Status Update for ${params[0]}`;
      content = `Dear ${params[1]}, your application status has been updated.`;
    }
    // Add more templates as needed

    await this.sendEmail(to, subject, content);
  }
}
