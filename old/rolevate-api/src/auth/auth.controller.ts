import { Controller, Get, Req, Res, UseGuards, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from frontend' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User type',
    enum: ['CANDIDATE', 'BUSINESS'],
    required: false
  })
  @IsOptional()
  @IsEnum(['CANDIDATE', 'BUSINESS'])
  userType?: 'CANDIDATE' | 'BUSINESS';
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User type',
    enum: ['CANDIDATE', 'BUSINESS'],
    default: 'CANDIDATE',
    required: false
  })
  @IsOptional()
  @IsEnum(['CANDIDATE', 'BUSINESS'])
  userType?: 'CANDIDATE' | 'BUSINESS';
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
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
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
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
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async googleLogin(@Body() body: GoogleLoginDto, @Res() res) {
    try {
      if (!body.token) {
        throw new BadRequestException('Google token is required');
      }

      const user = await this.authService.verifyGoogleToken(body.token);

      // TODO: Add logic to update userType if needed

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
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth(@Req() req) {
    // This will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth cookie' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res() res) {
    res.clearCookie('access_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}