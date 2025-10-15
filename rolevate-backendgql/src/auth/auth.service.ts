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

    return {
      access_token,
      user: {
        id: user.id,
        userType: user.userType,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        companyId: user.companyId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}