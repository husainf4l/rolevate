import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './login.input';
import { LoginResponseDto } from './login-response.dto';
import { ChangePasswordInput } from './change-password.input';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';
import { AuditService } from '../audit.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') input: LoginInput): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(input.email, input.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const token = await this.authService.login(user);
    return token;
  }

  @Mutation(() => Boolean, {
    description: 'Change user password (requires authentication)',
  })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.userService.changePassword(
      userId,
      input.currentPassword,
      input.newPassword,
    );
  }

  @Mutation(() => Boolean, { description: 'Logout user' })
  @UseGuards(JwtAuthGuard)
  async logout(@Context() context: any): Promise<boolean> {
    const user = context.req.user;
    this.auditService.logUserLogout(user.sub, user.email);
    return true;
  }
}