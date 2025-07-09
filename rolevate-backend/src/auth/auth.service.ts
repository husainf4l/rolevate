import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
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
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

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
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const { password, ...result } = user;
    
    // Add subscription status check
    const response = {
      ...result,
      hasActiveSubscription: user.company ? user.company.subscription !== 'FREE' : false,
    };
    
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
