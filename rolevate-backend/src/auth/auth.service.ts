import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CandidateService } from '../candidate/candidate.service';
import { PrismaService } from '../prisma/prisma.service';
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
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
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
    console.log('=== refreshAccessToken called ===');
    console.log('Refresh token (truncated):', refreshToken.substring(0, 20) + '...');
    
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    console.log('Token record found:', !!tokenRecord);
    
    if (!tokenRecord) {
      console.log('No token record found in database');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    
    if (tokenRecord.isRevoked) {
      console.log('Token is revoked');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    
    if (tokenRecord.expiresAt < new Date()) {
      console.log('Token is expired. Expires at:', tokenRecord.expiresAt, 'Current time:', new Date());
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    console.log('Token is valid. User ID:', tokenRecord.user.id, 'Email:', tokenRecord.user.email);
    
    const user = tokenRecord.user;
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    console.log('New access token generated successfully');
    console.log('Payload:', payload);
    
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
    console.log('=== getUserById called ===');
    console.log('id parameter:', id);
    
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
      
      console.log('Database query result:', user);
      
      if (!user) {
        console.log('User not found in database');
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
            console.log('Candidate profile found and added to response:', candidateProfile);
          } else {
            console.log('No candidate profile found for user:', user.id);
          }
        } catch (error) {
          console.log('Error fetching candidate profile for user:', user.id, error);
          // Don't throw error, just continue without candidate profile
        }
      }
      
      console.log('Final response (password excluded):', response);
      return response;
    } catch (error) {
      console.error('Error in getUserById:', error);
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

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

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
