import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CandidateService } from '../candidate/candidate.service';
import { SecurityService } from '../security/security.service';
import { NotificationService } from '../notification/notification.service';
import { BadRequestException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  getUserById: jest.fn().mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    userType: UserType.CANDIDATE,
    isActive: false,
    hasActiveSubscription: false,
  }),
};

const mockInvitationService = {
  validateInvitation: jest.fn(),
};

const mockCandidateService = {
  createProfile: jest.fn(),
  createBasicProfile: jest.fn(),
};

const mockSecurityService = {
  logSecurityEvent: jest.fn(),
  validatePassword: jest.fn().mockReturnValue({ valid: true }),
};

const mockNotificationService = {
  create: jest.fn(),
};

// Set up default mocks
mockedBcrypt.compare.mockResolvedValue(true as never);
mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

describe('AuthService', () => {
  let service: AuthService;
  let _prisma: PrismaService;
  let _jwt: JwtService;

  beforeEach(async () => {
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
    _prisma = module.get<PrismaService>(PrismaService);
    _jwt = module.get<JwtService>(JwtService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        userType: UserType.CANDIDATE,
        isActive: true,
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        userType: UserType.CANDIDATE,
        isActive: true,
      });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        userType: UserType.CANDIDATE,
        isActive: true,
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        userType: UserType.CANDIDATE,
        isActive: false,
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        userType: UserType.CANDIDATE,
      };

      const mockRefreshToken = {
        id: 'token-1',
        token: 'refresh-token-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        userType: UserType.CANDIDATE,
        isActive: false,
        password: 'hashedPassword',
        company: null,
      } as any);

      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-123');

      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      // Mock the private generateRefreshToken method
      jest.spyOn(service as any, 'generateRefreshToken').mockResolvedValue('76f6e386e511a9c279014ccfb8064b986bb096b356522a8a84e66c1db09d75ba');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: 'access-token-123',
        refresh_token: '76f6e386e511a9c279014ccfb8064b986bb096b356522a8a84e66c1db09d75ba',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          userType: UserType.CANDIDATE,
          isActive: false,
          hasActiveSubscription: false,
          company: null,
        },
      });

      // Test passes if no exception is thrown and result matches expectation
    });
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        userType: UserType.CANDIDATE,
      };

      const mockUser = {
        id: 'user-1',
        email: 'newuser@example.com',
        userType: UserType.CANDIDATE,
        isActive: true,
      };

      mockUserService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockUserService.create.mockResolvedValue(mockUser);
      mockCandidateService.createBasicProfile.mockResolvedValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'newuser@example.com',
        userType: UserType.CANDIDATE,
        isActive: true,
        password: 'hashedPassword',
        company: null,
      } as any);

      const result = await service.signup(createUserDto);

      expect(result).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        user: {
          id: 'user-1',
          email: 'newuser@example.com',
          userType: UserType.CANDIDATE,
          isActive: true,
          hasActiveSubscription: false,
          company: null,
        },
      });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        userType: UserType.CANDIDATE,
      };

      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com',
        userType: UserType.CANDIDATE,
      };

      mockUserService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.signup(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });
});