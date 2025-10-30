import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { LoginResponseDto } from './login-response.dto';
import { AuditService } from '../audit.service';
import { CommunicationService } from '../communication/communication.service';
import { CommunicationType, CommunicationDirection } from '../communication/communication.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private resetTokens: Map<string, { email: string; expiresAt: Date }> = new Map();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private communicationService: CommunicationService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validatePassword(email, password);
  }

  async login(user: User): Promise<LoginResponseDto> {
    // Fetch user with company relation first to get companyId
    const fullUser = await this.userService.findOne(user.id);
    
    const payload = { 
      email: user.email, 
      sub: user.id, 
      userType: user.userType,
      companyId: fullUser?.companyId || null
    };
    const access_token = this.jwtService.sign(payload);

    if (user.email) {
      this.auditService.logLoginAttempt(user.email, true);
    }

    return {
      access_token,
      user: {
        id: fullUser!.id,
        userType: fullUser!.userType,
        email: fullUser!.email,
        name: fullUser!.name,
        phone: fullUser!.phone,
        avatar: fullUser!.avatar,
        isActive: fullUser!.isActive,
        companyId: fullUser!.companyId,
        company: fullUser!.company ? {
          id: fullUser!.company.id,
          name: fullUser!.company.name,
          description: fullUser!.company.description,
          website: fullUser!.company.website,
          logo: fullUser!.company.logo,
          industry: fullUser!.company.industry,
          size: fullUser!.company.size,
          founded: fullUser!.company.founded,
          location: fullUser!.company.location,
          addressId: fullUser!.company.addressId,
          createdAt: fullUser!.company.createdAt,
          updatedAt: fullUser!.company.updatedAt,
        } : undefined,
        createdAt: fullUser!.createdAt,
        updatedAt: fullUser!.updatedAt,
      },
    };
  }

  /**
   * Request password reset - generates token and sends via WhatsApp
   */
  async forgotPassword(email: string): Promise<boolean> {
    console.log(`🟢 AuthService.forgotPassword called with email: ${email}`);
    
    // Find user by email
    const user = await this.userService.findByEmail(email);
    console.log(`🟢 User found:`, user ? `${user.email} (ID: ${user.id}, phone: ${user.phone})` : 'NOT FOUND');
    
    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`🟡 User not found, returning true for security`);
      return true;
    }

    // Check if user has a phone number
    if (!user.phone) {
      throw new BadRequestException('User does not have a phone number registered. Please contact support.');
    }

    // Generate reset token (6-digit code for simplicity)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store token with 15 minute expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    this.resetTokens.set(resetToken, { email: user.email, expiresAt });

    console.log(`✅ Generated reset token: ${resetToken} for ${user.email} (phone: ${user.phone}), expires at ${expiresAt.toISOString()}`);

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    // Send reset token via WhatsApp using temppassword template
    try {
      console.log(`📤 Attempting to send WhatsApp to ${user.phone} with token: ${resetToken}`);
      
      const result = await this.communicationService.create({
        candidateId: user.userType === 'CANDIDATE' ? user.id : undefined,
        companyId: user.companyId,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: `Password reset code sent to ${user.phone}`,
        phoneNumber: user.phone,
        templateName: 'temppassword',
        templateParams: [resetToken],
      });

      console.log(`✅ WhatsApp sent successfully:`, result);

      // Log audit event
      console.log(`Password reset requested for: ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset WhatsApp:', error);
      throw new BadRequestException('Failed to send reset code. Please try again later.');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    console.log(`🔍 Attempting to reset password with token: ${token}`);
    console.log(`📋 Available tokens:`, Array.from(this.resetTokens.keys()));
    
    // Validate token
    const tokenData = this.resetTokens.get(token);
    if (!tokenData) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    // Find user
    const user = await this.userService.findByEmail(tokenData.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.userService.updatePassword(user.id, hashedPassword);

    // Delete used token
    this.resetTokens.delete(token);

    // Log audit event
    console.log(`Password reset completed for: ${user.email}`);

    return true;
  }

  /**
   * Clean up expired reset tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
      }
    }
  }
}