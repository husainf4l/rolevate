import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CandidateService } from '../candidate/candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../common/constants';
import { ValidationUtils } from '../common/validation-utils';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly invitationService: InvitationService,
    private readonly candidateService: CandidateService,
    private readonly prisma: PrismaService,
    private readonly securityService: SecurityService,
    private readonly notificationService: NotificationService,
  ) { }

  async validateUser(email: string, pass: string, ip?: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && user.isActive && user.password && await bcrypt.compare(pass, user.password)) {
      // Log successful authentication
      await this.securityService.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: user.id,
        ip: ip || 'unknown',
        details: { email: user.email, userType: user.userType },
        timestamp: new Date(),
        severity: 'LOW',
      });

      const { password: _password, ...result } = user;
      return result;
    }

    // Log failed authentication
    await this.securityService.logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip: ip || 'unknown',
      details: { attemptedEmail: email, reason: user ? 'invalid_password' : 'user_not_found' },
      timestamp: new Date(),
      severity: 'MEDIUM',
    });

    return null;
  }

  async login(user: any) {
    // Get user with company information
    const userData = await this.findById(user.id);

    const payload = { email: userData.email, sub: userData.id, userType: userData.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '2h' });
    const refreshToken = await this.generateRefreshToken(userData.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
    };
  }

  async generateRefreshToken(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    // Removed detailed logging for security

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Security: Reduced logging

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Token is valid, proceeding

    const user = tokenRecord.user;
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '2h' });

    // Access token generated successfully

    return {
      access_token: accessToken,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Retrieves a user by their ID with company information
   *
   * Fetches complete user data including associated company details.
   * Used for authentication responses and user profile retrieval.
   *
   * @param id - User ID to retrieve
   * @returns Promise resolving to user data with company information
   * @throws NotFoundException if user is not found
   */
  async findById(id: string) {
    // Getting user by ID

    const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              address: true,
            },
          },
        },
      });

      // User found in database

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password: _password, ...result } = user;

      // Add subscription status check
      const response: any = {
        ...result,
        hasActiveSubscription: user.company ? user.company.subscription !== 'FREE' : false,
      };

      // If user is a candidate, include candidate profile with CV link
      if (user.userType === 'CANDIDATE') {
        try {
          const candidateProfile = await this.candidateService.findProfileByUserId(user.id);
          if (candidateProfile) {
            response.candidateProfile = candidateProfile;
            // Candidate profile added to response
          } else {
            // No candidate profile found
          }
        } catch {
          // Error fetching candidate profile - continuing without it
        }
      }

      // Returning user data (password excluded)
      return response;
  }

  async checkUserSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            subscription: true,
          },
        },
      },
    });

    if (!user || !user.company) {
      return {
        hasCompany: false,
        subscription: null,
        hasActiveSubscription: false,
      };
    }

    return {
      hasCompany: true,
      subscription: user.company.subscription,
      hasActiveSubscription: user.company.subscription !== 'FREE',
    };
  }

  async refreshUserData(userId: string) {
    // This method can be called after a user joins a company
    // to return updated user data with company information
    return this.findById(userId);
  }

  /**
   * Handles user registration with comprehensive validation and transactional database operations
   *
   * This method orchestrates the complete user signup process including:
   * - Input validation and security checks
   * - Password hashing and user creation
   * - Invitation code processing (optional)
   * - User profile creation based on user type
   * - Welcome notification sending
   * - JWT token generation for authentication
   *
   * All database operations are wrapped in a transaction to ensure data consistency.
   * If any step fails, all changes are rolled back.
   *
   * @param createUserDto - User registration data including email, password, user type, and optional invitation code
   * @returns Promise resolving to authentication tokens and user data
   * @throws BadRequestException for validation errors (existing email, invalid invitation, weak password)
   * @throws UnauthorizedException for security violations (admin creation attempts)
   * @throws InternalServerErrorException for unexpected database or system errors
   *
   * @example
   * ```typescript
   * const result = await authService.signup({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!',
   *   userType: 'CANDIDATE',
   *   invitationCode: 'ABC123'
   * });
   * // Returns: { access_token: '...', refresh_token: '...', user: {...} }
   * ```
   */
  async signup(createUserDto: CreateUserDto) {
    this.validateSignupRequest(createUserDto);
    await this.checkUserExists(createUserDto.email);
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const companyId = await this.processInvitationCode(createUserDto.invitationCode);

    // Wrap database operations in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await this.createUserTransactional(createUserDto, hashedPassword, companyId, tx);
      await this.createUserProfileTransactional(createUserDto, user.id, tx);
      await this.markInvitationUsedTransactional(createUserDto.invitationCode, tx);
      return user;
    });

    const userData = await this.findById(result.id);
    await this.sendWelcomeNotification(result.id, createUserDto.userType, companyId);
    return await this.generateTokens(userData);
  }

  /**
   * Validates signup request data and enforces security constraints
   *
   * Performs security validation to prevent unauthorized account creation,
   * specifically blocking attempts to create admin users through the public signup endpoint.
   *
   * @param createUserDto - User registration data to validate
   * @throws UnauthorizedException if attempting to create an admin user
   * @private
   */
  private validateSignupRequest(createUserDto: CreateUserDto): void {
    // Use centralized validation utilities
    ValidationUtils.validateUserRegistrationRules(createUserDto);

    // Validate password strength
    const passwordValidation = this.securityService.validatePassword(createUserDto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password requirements not met: ${passwordValidation.issues.join(', ')}`);
    }
  }

  /**
   * Checks if a user with the given email already exists
   *
   * Queries the database to ensure email uniqueness before creating a new user account.
   * This prevents duplicate accounts and maintains data integrity.
   *
   * @param email - Email address to check for uniqueness
   * @throws BadRequestException if a user with this email already exists
   * @private
   */
  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
  }

  /**
   * Hashes a plain text password using bcrypt
   *
   * Applies secure password hashing with a predefined number of salt rounds
   * to protect user credentials from rainbow table and brute force attacks.
   *
   * @param password - Plain text password to hash
   * @returns Promise resolving to the hashed password string
   * @private
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_ROUNDS);
  }

  /**
   * Processes and validates an invitation code for company association
   *
   * If an invitation code is provided, validates its existence and returns
   * the associated company ID. If no code is provided, returns null.
   *
   * @param invitationCode - Optional invitation code to process
   * @returns Promise resolving to company ID if valid code provided, null otherwise
   * @throws BadRequestException if invitation code is invalid or expired
   * @private
   */
  private async processInvitationCode(invitationCode?: string): Promise<string | null> {
    if (!invitationCode) {
      return null;
    }

    const companyId = await this.invitationService.getCompanyIdByCode(invitationCode);
    if (!companyId) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_INVITATION_CODE);
    }

    return companyId;
  }

  private async createUser(createUserDto: CreateUserDto, hashedPassword: string, companyId: string | null) {
    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      userType: createUserDto.userType,
      phone: createUserDto.phone,
      companyId: companyId || undefined,
    };

    return await this.userService.create(userData);
  }

  private async createUserProfile(createUserDto: CreateUserDto, userId: string): Promise<void> {
    if (createUserDto.userType !== 'CANDIDATE') {
      return;
    }

    try {
      await this.candidateService.createBasicProfile({
        firstName: createUserDto.name || '',
        lastName: '',
        email: createUserDto.email,
        phone: createUserDto.phone,
        // cvUrl, currentLocation, isOpenToWork are left undefined
      }, userId);
    } catch (e) {
      // Ignore if already exists, throw otherwise
      if (!String(e.message).includes('already exists')) throw e;
    }
  }

  private async markInvitationUsed(invitationCode?: string): Promise<void> {
    if (invitationCode) {
      await this.invitationService.useInvitation(invitationCode);
    }
  }

  private async sendWelcomeNotification(userId: string, userType: string, companyId: string | null): Promise<void> {
    try {
      let welcomeMessage = '';
      if (userType === 'CANDIDATE') {
        welcomeMessage = 'Welcome to Rolevate! Start browsing jobs and upload your CV to get started.';
      } else if (userType === 'COMPANY') {
        welcomeMessage = 'Welcome to Rolevate! You can now start posting jobs and managing applications.';
      } else {
        welcomeMessage = 'Welcome to Rolevate! Your account has been created successfully.';
      }

      await this.notificationService.create({
        type: NotificationType.SUCCESS,
        category: NotificationCategory.SYSTEM,
        title: 'Welcome to Rolevate!',
        message: welcomeMessage,
        userId: userId,
        companyId: companyId || undefined,
        metadata: {
          userType: userType,
          registrationDate: new Date().toISOString(),
        },
      });
    } catch (_error) {
      console.error('Failed to create welcome notification:', _error);
    }
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: AUTH_CONSTANTS.JWT_ACCESS_TOKEN_EXPIRATION });
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
    };
  }

  /**
   * Creates a new user record within a database transaction
   *
   * This method is designed to be called within a Prisma transaction context
   * to ensure atomicity with other related database operations during signup.
   *
   * @param createUserDto - User registration data
   * @param hashedPassword - Pre-hashed password for security
   * @param companyId - Optional company ID for company association
   * @param tx - Prisma transaction client for atomic operations
   * @returns Promise resolving to the created user record
   * @private
   */
  private async createUserTransactional(createUserDto: CreateUserDto, hashedPassword: string, companyId: string | null, tx: any) {
    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      userType: createUserDto.userType,
      phone: createUserDto.phone,
      companyId: companyId || undefined,
    };

    return await tx.user.create({
      data: userData,
    });
  }

  /**
   * Creates a user profile within a database transaction
   *
   * Conditionally creates a candidate profile if the user type is CANDIDATE.
   * This operation is transactional to maintain data consistency with user creation.
   *
   * @param createUserDto - User registration data containing user type
   * @param userId - ID of the user for whom to create the profile
   * @param tx - Prisma transaction client for atomic operations
   * @private
   */
  private async createUserProfileTransactional(createUserDto: CreateUserDto, userId: string, tx: any): Promise<void> {
    if (createUserDto.userType !== 'CANDIDATE') {
      return;
    }

    try {
      await tx.candidateProfile.create({
        data: {
          firstName: createUserDto.name || '',
          lastName: '',
          email: createUserDto.email,
          phone: createUserDto.phone,
          userId: userId,
          // cvUrl, currentLocation, isOpenToWork are left undefined
        },
      });
    } catch (e) {
      // Ignore if already exists, throw otherwise
      if (!String(e.message).includes('already exists')) throw e;
    }
  }

  /**
   * Marks an invitation code as used within a database transaction
   *
   * Updates the invitation record to prevent reuse and maintain invitation integrity.
   * Only executed if an invitation code was provided during signup.
   *
   * @param invitationCode - Optional invitation code to mark as used
   * @param tx - Prisma transaction client for atomic operations
   * @private
   */
  private async markInvitationUsedTransactional(invitationCode: string | undefined, tx: any): Promise<void> {
    if (invitationCode) {
      await tx.invitation.updateMany({
        where: { code: invitationCode },
        data: { used: true, usedAt: new Date() },
      });
    }
  }

  async updateAvatar(userId: string, avatarPath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }
}
