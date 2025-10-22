import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from './user.entity';
import { AuditService } from '../audit.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(userType: UserType, email?: string, password?: string, name?: string, phone?: string): Promise<User> {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = this.userRepository.create({
      userType,
      email,
      password: hashedPassword,
      name,
      phone,
      isActive: true
    });
    const savedUser = await this.userRepository.save(user);
    if (email) {
      this.auditService.logUserRegistration(savedUser.id, email);
    }
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['company'] });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['company'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update user
    await this.userRepository.update(id, updateData);

    // Return updated user
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new BadRequestException('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      this.auditService.logUserLogin(user.id, email);
      return user;
    }
    return null;
  }

  /**
   * Change user password
   * Requires current password verification for security
   * @param userId - The ID of the user changing password
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set (will be hashed)
   * @returns True if password was changed successfully
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // Find user
    const user = await this.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify user has a password set
    if (!user.password) {
      throw new BadRequestException('User does not have a password set. Please use password reset flow.');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check that new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });

    // Log password change for audit
    this.auditService.logUserLogin(userId, user.email || ''); // Reusing login audit for password change
    
    console.log(`🔒 Password changed successfully for user ${userId}`);

    return true;
  }
}