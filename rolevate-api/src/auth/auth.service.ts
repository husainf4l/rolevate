import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(email: string, password: string, firstName?: string, lastName?: string, userType: 'CANDIDATE' | 'BUSINESS' = 'CANDIDATE') {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
      },
    });

    return user;
  }

  async validateEmailPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUser(profile: any) {
    const { id, emails, name } = profile;
    const email = emails[0].value;
    const firstName = name.givenName;
    const lastName = name.familyName;

    let user = await this.prisma.user.findUnique({ where: { googleId: id } });
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        // Update with googleId
        user = await this.prisma.user.update({
          where: { email },
          data: { googleId: id, firstName, lastName },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            googleId: id,
          },
        });
      }
    }
    return user;
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token');
      }

      const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

      if (!email) {
        throw new Error('Email not found in token');
      }

      // Find or create user
      let user = await this.prisma.user.findUnique({ where: { googleId } });
      if (!user) {
        user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
          // Update with googleId
          user = await this.prisma.user.update({
            where: { email },
            data: { googleId, firstName, lastName },
          });
        } else {
          // Create new user
          user = await this.prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              googleId,
            },
          });
        }
      }

      return user;
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
    };
  }
}