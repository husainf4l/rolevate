import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InvitationService } from '../company/invitation.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly invitationService: InvitationService,
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
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    return {
      access_token: this.jwtService.sign(payload),
    };
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

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }
}
