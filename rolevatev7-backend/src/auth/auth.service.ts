import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { PasswordReset } from './password-reset.entity';
import { LoginResponseDto } from './login-response.dto';
import { AuditService } from '../audit.service';
import { CommunicationService } from '../communication/communication.service';
import { CommunicationType, CommunicationDirection } from '../communication/communication.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly resetTokenExpiryMinutes: number;
  private readonly bcryptRounds: number;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private communicationService: CommunicationService,
    private configService: ConfigService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {
    this.resetTokenExpiryMinutes = this.configService.get<number>('RESET_TOKEN_EXPIRY_MINUTES', 15);
    this.bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validatePassword(email, password);
  }

  async login(user: User, ip?: string): Promise<LoginResponseDto> {
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
      this.auditService.logLoginAttempt(user.email, true, ip);
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

    // Generate secure reset token (6-digit code)
    const resetToken = crypto.randomInt(100000, 999999).toString();
    
    // Store token in database with configurable expiration
    const expiresAt = new Date(Date.now() + this.resetTokenExpiryMinutes * 60 * 1000);
    
    // Create password reset record
    const passwordReset = this.passwordResetRepository.create({
      email: user.email,
      token: resetToken,
      expiresAt,
      used: false,
    });
    
    await this.passwordResetRepository.save(passwordReset);

    console.log(`✅ Generated reset token: ${resetToken} for ${user.email} (phone: ${user.phone}), expires at ${expiresAt.toISOString()}`);

    // Clean up expired tokens
    await this.cleanupExpiredTokens();

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
    
    // Find token in database
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token, used: false }
    });
    
    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Check if token has expired
    if (new Date() > passwordReset.expiresAt) {
      await this.passwordResetRepository.delete(passwordReset.id);
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    // Find user
    const user = await this.userService.findByEmail(passwordReset.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update user password
    await this.userService.updatePassword(user.id, hashedPassword);

    // Mark token as used
    await this.passwordResetRepository.update(passwordReset.id, { used: true });

    // Log audit event
    console.log(`Password reset completed for: ${user.email}`);

    return true;
  }

  /**
   * Clean up expired reset tokens
   */
  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.passwordResetRepository.delete({
      expiresAt: LessThan(now),
    });
  }
}