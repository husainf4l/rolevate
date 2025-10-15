import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { LoginResponseDto } from './login-response.dto';
import { AuditService } from '../audit.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validatePassword(email, password);
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    const access_token = this.jwtService.sign(payload);

    if (user.email) {
      this.auditService.logLoginAttempt(user.email, true);
    }

    // Fetch user with company relation
    const fullUser = await this.userService.findOne(user.id);

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
}