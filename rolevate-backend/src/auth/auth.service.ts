import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CandidateService } from '../candidate/candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
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
  ) {}

  async validateUser(email: string, pass: string, ip?: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      // Log successful authentication
      await this.securityService.logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: user.id,
        ip: ip || 'unknown',
        details: { email: user.email, userType: user.userType },
        timestamp: new Date(),
        severity: 'LOW',
      });
      
      const { password, ...result } = user;
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
    const userWithCompany = await this.getUserById(user.id);
    
    const payload = { email: userWithCompany.email, sub: userWithCompany.id, userType: userWithCompany.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(userWithCompany.id);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userWithCompany,
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
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

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

  async getUserById(id: string) {
    // Getting user by ID
    
    try {
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
      
      const { password, ...result } = user;
      
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
        } catch (error) {
          // Error fetching candidate profile - continuing without it
        }
      }
      
      // Returning user data (password excluded)
      return response;
    } catch (error) {
      throw error;
    }
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
    return this.getUserById(userId);
  }

  async signup(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.securityService.validatePassword(createUserDto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password requirements not met: ${passwordValidation.issues.join(', ')}`);
    }

    // Hash password with higher salt rounds for security
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Handle invitation code if provided
    let companyId: string | null = null;
    if (createUserDto.invitationCode) {
      companyId = await this.invitationService.getCompanyIdByCode(createUserDto.invitationCode);
      if (!companyId) {
        throw new BadRequestException('Invalid or expired invitation code');
      }
    }

    // Create user
    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      userType: createUserDto.userType,
      phone: createUserDto.phone,
      companyId: companyId || undefined,
    };

    const user = await this.userService.create(userData);

    // If userType is CANDIDATE, create a candidate profile automatically (if not present)
    if (createUserDto.userType === 'CANDIDATE') {
      try {
        await this.candidateService.createBasicProfile({
          firstName: createUserDto.name || '',
          lastName: '',
          email: createUserDto.email,
          phone: createUserDto.phone,
          // cvUrl, currentLocation, isOpenToWork are left undefined
        }, user.id);
      } catch (e) {
        // Ignore if already exists, throw otherwise
        if (!String(e.message).includes('already exists')) throw e;
      }
    }

    // Mark invitation as used if provided
    if (createUserDto.invitationCode) {
      await this.invitationService.useInvitation(createUserDto.invitationCode);
    }

    // Get user with company information
    const userWithCompany = await this.getUserById(user.id);
    
    // Generate tokens
    const payload = { email: userWithCompany.email, sub: userWithCompany.id, userType: userWithCompany.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(userWithCompany.id);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userWithCompany,
    };
  }
}
