import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CandidateService } from '../candidate/candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { NotificationService } from '../notification/notification.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';
import { AUTH_CONSTANTS } from '../common/constants';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let invitationService: jest.Mocked<InvitationService>;
  let candidateService: jest.Mocked<CandidateService>;
  let prismaService: jest.Mocked<PrismaService>;
  let securityService: jest.Mocked<SecurityService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    userType: 'CANDIDATE' as const,
    phone: '+1234567890',
    isActive: true,
    companyId: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithCompany = {
    ...mockUser,
    companyId: 'company-123',
    company: {
      id: 'company-123',
      name: 'Test Company',
      subscription: 'PREMIUM' as const,
      address: {
        street: '123 Main St',
        city: 'Test City',
        country: 'Test Country',
      },
    },
  };

  beforeEach(async () => {
    const mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockInvitationService = {
      getCompanyIdByCode: jest.fn(),
      useInvitation: jest.fn(),
    };

    const mockCandidateService = {
      findProfileByUserId: jest.fn(),
      createBasicProfile: jest.fn(),
    };

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      candidateProfile: {
        create: jest.fn(),
      },
      invitation: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockSecurityService = {
      logSecurityEvent: jest.fn(),
      validatePassword: jest.fn(),
    };

    const mockNotificationService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
        {
          provide: CandidateService,
          useValue: mockCandidateService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    invitationService = module.get(InvitationService);
    candidateService = module.get(CandidateService);
    prismaService = module.get(PrismaService);
    securityService = module.get(SecurityService);
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithPassword = { ...mockUser, password: hashedPassword };

      userService.findByEmail.mockResolvedValue(userWithPassword);
      securityService.logSecurityEvent.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'password123', '127.0.0.1');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        userType: mockUser.userType,
        phone: mockUser.phone,
        isActive: mockUser.isActive,
        companyId: mockUser.companyId,
        avatar: mockUser.avatar,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'AUTH_SUCCESS',
        userId: mockUser.id,
        ip: '127.0.0.1',
        details: { email: mockUser.email, userType: mockUser.userType },
        timestamp: expect.any(Date),
        severity: 'LOW',
      });
    });

    it('should return null for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithPassword = { ...mockUser, password: hashedPassword };

      userService.findByEmail.mockResolvedValue(userWithPassword);
      securityService.logSecurityEvent.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'wrongpassword', '127.0.0.1');

      expect(result).toBeNull();
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'AUTH_FAILURE',
        ip: '127.0.0.1',
        details: { attemptedEmail: 'test@example.com', reason: 'invalid_password' },
        timestamp: expect.any(Date),
        severity: 'MEDIUM',
      });
    });

    it('should return null for non-existent user', async () => {
      userService.findByEmail.mockResolvedValue(null);
      securityService.logSecurityEvent.mockResolvedValue(undefined);

      const result = await service.validateUser('nonexistent@example.com', 'password123', '127.0.0.1');

      expect(result).toBeNull();
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'AUTH_FAILURE',
        ip: '127.0.0.1',
        details: { attemptedEmail: 'nonexistent@example.com', reason: 'user_not_found' },
        timestamp: expect.any(Date),
        severity: 'MEDIUM',
      });
    });

    it('should return null for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false, password: 'hashed-password' };
      userService.findByEmail.mockResolvedValue(inactiveUser);
      securityService.logSecurityEvent.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'password123', '127.0.0.1');

      expect(result).toBeNull();
    });

    it('should handle missing IP address', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithPassword = { ...mockUser, password: hashedPassword };

      userService.findByEmail.mockResolvedValue(userWithPassword);
      securityService.logSecurityEvent.mockResolvedValue(undefined);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(securityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'AUTH_SUCCESS',
        userId: mockUser.id,
        ip: 'unknown',
        details: { email: mockUser.email, userType: mockUser.userType },
        timestamp: expect.any(Date),
        severity: 'LOW',
      });
    });
  });

  describe('login', () => {
    it('should return access token, refresh token, and user data', async () => {
      const user = { id: 'user-123', email: 'test@example.com', userType: 'CANDIDATE' };
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      service.findById = jest.fn().mockResolvedValue(mockUserWithCompany);
      jwtService.sign.mockReturnValue(accessToken);
      service.generateRefreshToken = jest.fn().mockResolvedValue(refreshToken);

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: mockUserWithCompany,
      });
      expect(service.findById).toHaveBeenCalledWith(user.id);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: user.email, sub: user.id, userType: user.userType },
        { expiresIn: '2h' }
      );
      expect(service.generateRefreshToken).toHaveBeenCalledWith(user.id);
    });
  });

  describe('generateRefreshToken', () => {
    it('should create and return a refresh token', async () => {
      const userId = 'user-123';
      const mockToken = 'mock-refresh-token';
      const mockExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Mock randomBytes to return predictable value
      jest.spyOn({ randomBytes }, 'randomBytes').mockReturnValue({
        toString: jest.fn().mockReturnValue(mockToken),
      } as any);

      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        token: mockToken,
        userId,
        expiresAt: mockExpiresAt,
        isRevoked: false,
        createdAt: new Date(),
      });

      const result = await service.generateRefreshToken(userId);

      expect(result).toBe(mockToken);
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: mockToken,
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const accessToken = 'new-access-token';
      const tokenRecord = {
        token: refreshToken,
        user: mockUser,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Future date
      };

      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(tokenRecord);
      jwtService.sign.mockReturnValue(accessToken);

      const result = await service.refreshAccessToken(refreshToken);

      expect(result).toEqual({
        access_token: accessToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id, userType: mockUser.userType },
        { expiresIn: '2h' }
      );
    });

    it('should throw UnauthorizedException for non-existent refresh token', async () => {
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'invalid-token' },
        include: { user: true },
      });
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const tokenRecord = {
        token: 'revoked-token',
        user: mockUser,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(tokenRecord);

      await expect(service.refreshAccessToken('revoked-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const tokenRecord = {
        token: 'expired-token',
        user: mockUser,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past date
      };

      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(tokenRecord);

      await expect(service.refreshAccessToken('expired-token')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke the specified refresh token', async () => {
      const refreshToken = 'token-to-revoke';

      (prismaService.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await service.revokeRefreshToken(refreshToken);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all refresh tokens for a user', async () => {
      const userId = 'user-123';

      (prismaService.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      await service.revokeAllUserTokens(userId);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { isRevoked: true },
      });
    });
  });

  describe('findById', () => {
    it('should return user data with company information', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithCompany);
      candidateService.findProfileByUserId.mockResolvedValue(null);

      const result = await service.findById('user-123');

      expect(result).toEqual({
        ...mockUserWithCompany,
        password: undefined,
        hasActiveSubscription: true,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          company: {
            include: {
              address: true,
            },
          },
        },
      });
    });

    it('should include candidate profile for CANDIDATE user type', async () => {
      const candidateProfile = {
        id: 'profile-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+1234567890',
        skills: ['JavaScript', 'TypeScript'],
        preferredJobTypes: ['Full-time'],
        preferredIndustries: ['Technology'],
        preferredLocations: ['New York'],
        savedJobs: [],
        isProfilePublic: true,
        isOpenToWork: true,
        cvs: [],
        applications: [],
        workExperiences: [],
        educationHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithCompany);
      candidateService.findProfileByUserId.mockResolvedValue(candidateProfile);

      const result = await service.findById('user-123');

      expect(result.candidateProfile).toEqual(candidateProfile);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('non-existent-user')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should handle candidate profile fetch errors gracefully', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithCompany);
      candidateService.findProfileByUserId.mockRejectedValue(new Error('Database error'));

      const result = await service.findById('user-123');

      expect(result).toBeDefined();
      expect(result.candidateProfile).toBeUndefined();
    });
  });

  describe('checkUserSubscription', () => {
    it('should return subscription info for user with company', async () => {
      const userWithCompany = {
        ...mockUser,
        company: {
          subscription: 'PREMIUM' as const,
        },
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userWithCompany);

      const result = await service.checkUserSubscription('user-123');

      expect(result).toEqual({
        hasCompany: true,
        subscription: 'PREMIUM',
        hasActiveSubscription: true,
      });
    });

    it('should return no subscription for user without company', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.checkUserSubscription('user-123');

      expect(result).toEqual({
        hasCompany: false,
        subscription: null,
        hasActiveSubscription: false,
      });
    });

    it('should return no subscription for non-existent user', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.checkUserSubscription('user-123');

      expect(result).toEqual({
        hasCompany: false,
        subscription: null,
        hasActiveSubscription: false,
      });
    });
  });

  describe('refreshUserData', () => {
    it('should call findById to refresh user data', async () => {
      service.findById = jest.fn().mockResolvedValue(mockUserWithCompany);

      const result = await service.refreshUserData('user-123');

      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUserWithCompany);
    });
  });

  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      name: 'New User',
      userType: 'CANDIDATE',
      phone: '+1234567890',
      invitationCode: 'INVITE123',
    };

    beforeEach(() => {
      // Mock validation methods
      service['validateSignupRequest'] = jest.fn();
      service['checkUserExists'] = jest.fn();
      service['hashPassword'] = jest.fn().mockResolvedValue('hashed-password');
      service['processInvitationCode'] = jest.fn().mockResolvedValue('company-123');
      service['findById'] = jest.fn().mockResolvedValue(mockUserWithCompany);
      service['sendWelcomeNotification'] = jest.fn();
      service['generateTokens'] = jest.fn().mockResolvedValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: mockUserWithCompany,
      });

      // Mock transaction
      (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          candidateProfile: {
            create: jest.fn(),
          },
          invitation: {
            updateMany: jest.fn(),
          },
        });
      });
    });

    it('should successfully create a new user account', async () => {
      const result = await service.signup(createUserDto);

      expect(service['validateSignupRequest']).toHaveBeenCalledWith(createUserDto);
      expect(service['checkUserExists']).toHaveBeenCalledWith(createUserDto.email);
      expect(service['hashPassword']).toHaveBeenCalledWith(createUserDto.password);
      expect(service['processInvitationCode']).toHaveBeenCalledWith(createUserDto.invitationCode);
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(service['findById']).toHaveBeenCalledWith(mockUser.id);
      expect(service['sendWelcomeNotification']).toHaveBeenCalledWith(mockUser.id, createUserDto.userType, 'company-123');
      expect(service['generateTokens']).toHaveBeenCalledWith(mockUserWithCompany);
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: mockUserWithCompany,
      });
    });

    it('should handle signup without invitation code', async () => {
      const dtoWithoutInvitation = { ...createUserDto, invitationCode: undefined };
      service['processInvitationCode'] = jest.fn().mockResolvedValue(null);

      await service.signup(dtoWithoutInvitation);

      expect(service['processInvitationCode']).toHaveBeenCalledWith(undefined);
    });

    it('should handle transaction rollback on error', async () => {
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(service.signup(createUserDto)).rejects.toThrow('Transaction failed');
    });
  });

  describe('validateSignupRequest', () => {
    it('should validate user registration rules', async () => {
      // Access private method through service instance
      const validateMethod = (service as any).validateSignupRequest.bind(service);

      securityService.validatePassword.mockReturnValue({ valid: true, issues: [] });

      expect(() => validateMethod({
        email: 'test@example.com',
        password: 'SecurePass123!',
        userType: 'CANDIDATE',
        name: 'Test User',
      })).not.toThrow();
    });

    it('should throw BadRequestException for weak password', async () => {
      const validateMethod = (service as any).validateSignupRequest.bind(service);

      securityService.validatePassword.mockReturnValue({
        valid: false,
        issues: ['Password too short', 'Missing uppercase letter']
      });

      expect(() => validateMethod({
        email: 'test@example.com',
        password: 'weak',
        userType: 'CANDIDATE',
        name: 'Test User',
      })).toThrow(BadRequestException);
    });
  });

  describe('checkUserExists', () => {
    it('should throw BadRequestException if user already exists', async () => {
      const checkMethod = (service as any).checkUserExists.bind(service);

      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(checkMethod('existing@example.com')).rejects.toThrow(BadRequestException);
    });

    it('should not throw if user does not exist', async () => {
      const checkMethod = (service as any).checkUserExists.bind(service);

      userService.findByEmail.mockResolvedValue(null);

      await expect(checkMethod('new@example.com')).resolves.not.toThrow();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const hashMethod = (service as any).hashPassword.bind(service);
      const plainPassword = 'mypassword123';
      const hashedPassword = 'hashed-password-123';

      // Mock bcrypt.hash to return a predictable value
      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const result = await hashMethod(plainPassword);

      expect(bcryptHashSpy).toHaveBeenCalledWith(plainPassword, AUTH_CONSTANTS.BCRYPT_ROUNDS);
      expect(result).toBe(hashedPassword);

      bcryptHashSpy.mockRestore();
    });
  });

  describe('processInvitationCode', () => {
    it('should return company ID for valid invitation code', async () => {
      const processMethod = (service as any).processInvitationCode.bind(service);

      invitationService.getCompanyIdByCode.mockResolvedValue('company-123');

      const result = await processMethod('VALID123');

      expect(result).toBe('company-123');
      expect(invitationService.getCompanyIdByCode).toHaveBeenCalledWith('VALID123');
    });

    it('should return null for no invitation code', async () => {
      const processMethod = (service as any).processInvitationCode.bind(service);

      const result = await processMethod(undefined);

      expect(result).toBeNull();
      expect(invitationService.getCompanyIdByCode).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid invitation code', async () => {
      const processMethod = (service as any).processInvitationCode.bind(service);

      invitationService.getCompanyIdByCode.mockResolvedValue(null);

      await expect(processMethod('INVALID123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendWelcomeNotification', () => {
    it('should send welcome notification for CANDIDATE user', async () => {
      const sendMethod = (service as any).sendWelcomeNotification.bind(service);

      notificationService.create.mockResolvedValue({} as any);

      await sendMethod('user-123', 'CANDIDATE', 'company-123');

      expect(notificationService.create).toHaveBeenCalledWith({
        type: NotificationType.SUCCESS,
        category: NotificationCategory.SYSTEM,
        title: 'Welcome to Rolevate!',
        message: 'Welcome to Rolevate! Start browsing jobs and upload your CV to get started.',
        userId: 'user-123',
        companyId: 'company-123',
        metadata: {
          userType: 'CANDIDATE',
          registrationDate: expect.any(String),
        },
      });
    });

    it('should send welcome notification for COMPANY user', async () => {
      const sendMethod = (service as any).sendWelcomeNotification.bind(service);

      notificationService.create.mockResolvedValue({} as any);

      await sendMethod('user-123', 'COMPANY', null);

      expect(notificationService.create).toHaveBeenCalledWith({
        type: NotificationType.SUCCESS,
        category: NotificationCategory.SYSTEM,
        title: 'Welcome to Rolevate!',
        message: 'Welcome to Rolevate! You can now start posting jobs and managing applications.',
        userId: 'user-123',
        companyId: undefined,
        metadata: {
          userType: 'COMPANY',
          registrationDate: expect.any(String),
        },
      });
    });

    it('should handle notification creation errors gracefully', async () => {
      const sendMethod = (service as any).sendWelcomeNotification.bind(service);

      notificationService.create.mockRejectedValue(new Error('Notification failed'));

      // Should not throw
      await expect(sendMethod('user-123', 'CANDIDATE', null)).resolves.not.toThrow();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const generateMethod = (service as any).generateTokens.bind(service);
      const user = { id: 'user-123', email: 'test@example.com', userType: 'CANDIDATE' };
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      jwtService.sign.mockReturnValue(accessToken);
      service.generateRefreshToken = jest.fn().mockResolvedValue(refreshToken);

      const result = await generateMethod(user);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: user.email, sub: user.id, userType: user.userType },
        { expiresIn: '15m' }
      );
      expect(service.generateRefreshToken).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar and return updated user data', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '/avatars/user-123.jpg',
        userType: 'CANDIDATE',
        isActive: true,
        companyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateAvatar('user-123', '/avatars/user-123.jpg');

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatar: '/avatars/user-123.jpg' },
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
        },
      });
    });
  });
});