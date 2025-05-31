import { Body, Controller, Post, UnauthorizedException, UseGuards, Req, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const loginResult = await this.authService.login(user);
    
    // Set secure HttpOnly cookie
    res.cookie('token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict',     // Prevent CSRF
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (same as JWT expiry)
      path: '/',
    });

    // Return user info without the token
    return { 
      message: 'Login successful',
      user: loginResult.user 
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2fa(@Req() req) {
    // req.user is set by JwtStrategy
    return this.authService.generateTwoFactorSecret(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2fa(@Req() req, @Body('code') code: string) {
    const isValid = await this.authService.verifyTwoFactorCode(req.user.id, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    // Optionally, you can set a flag in the session or JWT to indicate 2FA is complete
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the HttpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logout successful' };
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }
}
