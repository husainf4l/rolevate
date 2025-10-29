import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * JOSMS Gateway Service
 * 
 * Integration with JOSMS SMS platform (josms.net)
 * Supports:
 * - Single OTP messages
 * - Single General messages
 * - Bulk messages (up to 120 numbers)
 * - Balance checking
 * 
 * Message Length Limits:
 * - Arabic: 70 chars (1 msg), 62 chars per part (multiple)
 * - English: 160 chars (1 msg), 152 chars per part (multiple)
 */

export enum JOSMSMessageType {
  OTP = 'OTP',
  GENERAL = 'GENERAL',
  BULK = 'BULK',
}

export interface JOSMSSendResponse {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
  statusCode?: number;
}

export interface JOSMSBalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  error?: string;
}

export interface JOSMSBulkSendOptions {
  numbers: string[];
  message: string;
  senderId?: string;
  messageId?: string;
}

@Injectable()
export class JOSMSService {
  private readonly logger = new Logger(JOSMSService.name);
  private readonly httpClient: AxiosInstance;
  
  // JOSMS Configuration
  private readonly accName: string;
  private readonly accPass: string;
  private readonly senderId: string;
  private readonly baseUrl: string = 'https://www.josms.net';

  constructor(private configService: ConfigService) {
    // Load credentials from environment variables
    this.accName = this.configService.get<string>('JOSMS_ACC_NAME', 'margogroup');
    this.accPass = this.configService.get<string>('JOSMS_ACC_PASS', 'nR@9g@Z7yV0@sS9bX1y');
    this.senderId = this.configService.get<string>('JOSMS_SENDER_ID', 'MargoGroup');

    // Create axios instance with default config
    this.httpClient = axios.create({
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.logger.log(`JOSMS Service initialized with account: ${this.accName}`);
  }

  /**
   * Format phone number to JOSMS format (962XXXXXXXXX)
   * Accepts: +962XXXXXXXXX, 962XXXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If starts with 00962, remove 00
    if (cleaned.startsWith('00962')) {
      cleaned = cleaned.substring(2);
    }
    // If starts with 0, replace with 962
    else if (cleaned.startsWith('0')) {
      cleaned = '962' + cleaned.substring(1);
    }
    // If doesn't start with 962, add it
    else if (!cleaned.startsWith('962')) {
      cleaned = '962' + cleaned;
    }

    // Validate: Should be 12 digits starting with 962
    if (cleaned.length !== 12 || !cleaned.startsWith('962')) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Expected format: 962XXXXXXXXX`);
    }

    // Validate operator code (77, 78, 79)
    const operatorCode = cleaned.substring(3, 5);
    if (!['77', '78', '79'].includes(operatorCode)) {
      throw new Error(`Invalid operator code: ${operatorCode}. Must be 77, 78, or 79`);
    }

    return cleaned;
  }

  /**
   * Encode message for URL (handle special characters)
   */
  private encodeMessage(message: string): string {
    return encodeURIComponent(message)
      .replace(/%20/g, '+')  // Space as +
      .replace(/%25/g, '%25') // % as %25
      .replace(/%26/g, '%26'); // & as %26
  }

  /**
   * Validate message length
   */
  private validateMessageLength(message: string): { valid: boolean; parts: number; error?: string } {
    // Check if message contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(message);
    
    let maxSingleLength: number;
    let maxPartLength: number;

    if (hasArabic) {
      maxSingleLength = 70;
      maxPartLength = 62;
    } else {
      maxSingleLength = 160;
      maxPartLength = 152;
    }

    const length = message.length;

    if (length <= maxSingleLength) {
      return { valid: true, parts: 1 };
    }

    const parts = Math.ceil(length / maxPartLength);

    if (parts > 10) {
      return {
        valid: false,
        parts,
        error: `Message too long: ${length} chars, ${parts} parts. Maximum 10 parts allowed.`,
      };
    }

    return { valid: true, parts };
  }

  /**
   * Check account balance
   */
  async getBalance(): Promise<JOSMSBalanceResponse> {
    try {
      this.logger.log('Fetching JOSMS account balance...');

      const url = `${this.baseUrl}/SMS/API/GetBalance?AccName=${this.accName}&AccPass=${this.accPass}`;

      const response = await this.httpClient.get(url);

      this.logger.log(`Balance response: ${response.data}`);

      // Parse the response (usually returns a number or string)
      const balanceData = response.data.toString().trim();
      const balance = parseFloat(balanceData);

      if (isNaN(balance)) {
        return {
          success: false,
          error: `Invalid balance response: ${balanceData}`,
        };
      }

      return {
        success: true,
        balance,
        currency: 'JOD', // Assuming Jordanian Dinar
      };
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send OTP message (single recipient)
   */
  async sendOTPMessage(
    phoneNumber: string,
    message: string,
    messageId?: string,
  ): Promise<JOSMSSendResponse> {
    try {
      this.logger.log(`Sending OTP SMS to ${phoneNumber}`);

      // Format and validate phone number
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // Validate message length
      const validation = this.validateMessageLength(message);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (validation.parts > 1) {
        this.logger.warn(`OTP message will be sent in ${validation.parts} parts`);
      }

      // Encode message
      const encodedMessage = this.encodeMessage(message);

      // Build URL
      const url = `${this.baseUrl}/SMSServices/Clients/Prof/RestSingleSMS/SendSMS?senderid=${this.senderId}&numbers=${formattedNumber}&accname=${this.accName}&AccPass=${this.accPass}&msg=${encodedMessage}`;

      // Send request
      const response = await this.httpClient.get(url);

      this.logger.log(`OTP SMS sent successfully to ${formattedNumber}. Response: ${response.data}`);

      return {
        success: true,
        messageId: messageId || `otp-${Date.now()}`,
        response: response.data.toString(),
        statusCode: response.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send general message (single recipient)
   * For announcements, payments, notifications, etc.
   */
  async sendGeneralMessage(
    phoneNumber: string,
    message: string,
    messageId?: string,
  ): Promise<JOSMSSendResponse> {
    try {
      this.logger.log(`Sending General SMS to ${phoneNumber}`);

      // Format and validate phone number
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // Validate message length
      const validation = this.validateMessageLength(message);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (validation.parts > 1) {
        this.logger.warn(`General message will be sent in ${validation.parts} parts`);
      }

      // Encode message
      const encodedMessage = this.encodeMessage(message);

      // Build URL
      const url = `${this.baseUrl}/SMSServices/Clients/Prof/RestSingleSMS_General/SendSMS?senderid=${this.senderId}&numbers=${formattedNumber}&accname=${this.accName}&AccPass=${this.accPass}&msg=${encodedMessage}`;

      // Send request
      const response = await this.httpClient.get(url);

      this.logger.log(`General SMS sent successfully to ${formattedNumber}. Response: ${response.data}`);

      return {
        success: true,
        messageId: messageId || `gen-${Date.now()}`,
        response: response.data.toString(),
        statusCode: response.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send General SMS: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send bulk messages (up to 120 recipients)
   */
  async sendBulkMessages(options: JOSMSBulkSendOptions): Promise<JOSMSSendResponse> {
    try {
      const { numbers, message, senderId, messageId } = options;

      this.logger.log(`Sending Bulk SMS to ${numbers.length} recipients`);

      // Validate recipient count
      if (numbers.length === 0) {
        throw new Error('No recipients provided');
      }

      if (numbers.length > 120) {
        throw new Error(`Too many recipients: ${numbers.length}. Maximum 120 allowed per bulk request.`);
      }

      // Format all phone numbers
      const formattedNumbers = numbers.map(num => this.formatPhoneNumber(num));

      // Validate message length
      const validation = this.validateMessageLength(message);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (validation.parts > 1) {
        this.logger.warn(`Bulk message will be sent in ${validation.parts} parts to each recipient`);
      }

      // Encode message
      const encodedMessage = this.encodeMessage(message);

      // Join numbers with comma
      const numbersString = formattedNumbers.join(',');

      // Build URL
      const senderIdToUse = senderId || this.senderId;
      const url = `${this.baseUrl}/sms/api/SendBulkMessages.cfm?numbers=${numbersString}&senderid=${senderIdToUse}&AccName=${this.accName}&AccPass=${this.accPass}&msg=${encodedMessage}&requesttimeout=5000000`;

      // Send request
      const response = await this.httpClient.get(url);

      this.logger.log(`Bulk SMS sent successfully to ${formattedNumbers.length} recipients. Response: ${response.data}`);

      return {
        success: true,
        messageId: messageId || `bulk-${Date.now()}`,
        response: response.data.toString(),
        statusCode: response.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send Bulk SMS: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Smart send - automatically chooses the right message type
   */
  async sendSMS(
    phoneNumber: string | string[],
    message: string,
    options?: {
      type?: JOSMSMessageType;
      messageId?: string;
      senderId?: string;
    },
  ): Promise<JOSMSSendResponse> {
    const messageType = options?.type || JOSMSMessageType.GENERAL;

    // Handle bulk messages
    if (Array.isArray(phoneNumber)) {
      return this.sendBulkMessages({
        numbers: phoneNumber,
        message,
        senderId: options?.senderId,
        messageId: options?.messageId,
      });
    }

    // Handle single messages
    switch (messageType) {
      case JOSMSMessageType.OTP:
        return this.sendOTPMessage(phoneNumber, message, options?.messageId);
      case JOSMSMessageType.GENERAL:
      default:
        return this.sendGeneralMessage(phoneNumber, message, options?.messageId);
    }
  }

  /**
   * Calculate SMS cost estimation
   */
  calculateCost(message: string, recipientCount: number = 1): {
    parts: number;
    totalMessages: number;
    estimatedCost: number;
  } {
    const validation = this.validateMessageLength(message);
    const parts = validation.parts;
    const totalMessages = parts * recipientCount;
    
    // Average cost per SMS in Jordan (adjust based on your actual rates)
    const costPerMessage = 0.03; // JOD
    const estimatedCost = totalMessages * costPerMessage;

    return {
      parts,
      totalMessages,
      estimatedCost,
    };
  }
}
