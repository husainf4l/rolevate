import { Controller, Get, Req, Res, UseGuards, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

export class GoogleLoginDto {
  token: string;
  userType?: 'CANDIDATE' | 'BUSINESS';
}

export class RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType?: 'CANDIDATE' | 'BUSINESS';
}

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res) {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.authService.register(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
        body.userType || 'CANDIDATE'
      );

      const { access_token, user: userData } = await this.authService.login(user);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      return res.json({
        success: true,
        message: 'Registration successful',
        user: userData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async loginWithEmail(@Body() body: LoginDto, @Res() res) {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.authService.validateEmailPassword(body.email, body.password);
      const { access_token, user: userData } = await this.authService.login(user);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      return res.json({
        success: true,
        message: 'Login successful',
        user: userData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('google/login')
  async googleLogin(@Body() body: GoogleLoginDto, @Res() res) {
    try {
      if (!body.token) {
        throw new BadRequestException('Google token is required');
      }

      const user = await this.authService.verifyGoogleToken(body.token);
      
      // Update userType if provided
      if (body.userType && body.userType !== user.userType) {
        // You can add logic here to update userType if needed
      }
      
      const { access_token, user: userData } = await this.authService.login(user);
      
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour
      });

      return res.json({
        success: true,
        user: userData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // This will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { access_token } = await this.authService.login(req.user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });
    res.redirect('http://localhost:3000'); // Redirect to frontend
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('logout')
  logout(@Res() res) {
    res.clearCookie('access_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}