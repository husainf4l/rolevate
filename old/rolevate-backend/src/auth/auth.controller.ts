import { Controller, Post, Body, UnauthorizedException, Res, Req, Get, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { AwsS3Service } from '../services/aws-s3.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly awsS3Service: AwsS3Service
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password, returns JWT tokens via HTTP-only cookies' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', minLength: 6, example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user-123' },
            email: { type: 'string', example: 'user@example.com' },
            userType: { type: 'string', enum: ['CANDIDATE', 'COMPANY'], example: 'CANDIDATE' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const result = await this.authService.login(user);

    // Set HTTP-only cookies
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful', user: result.user };
  }

  @Post('signup')
  @ApiOperation({ summary: 'User registration', description: 'Create a new user account and return JWT tokens via HTTP-only cookies' })
  @ApiResponse({
    status: 201,
    description: 'Signup successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Signup successful' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user-123' },
            email: { type: 'string', example: 'user@example.com' },
            userType: { type: 'string', enum: ['CANDIDATE', 'COMPANY'], example: 'CANDIDATE' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(createUserDto);

    // Set HTTP-only cookies
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Signup successful', user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout', description: 'Clear authentication cookies and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Generate new access token using refresh token from HTTP-only cookie' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token not found or invalid' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('=== /refresh endpoint called ===');
    console.log('Cookies:', req.cookies);

    const refreshToken = req.cookies?.refresh_token;
    console.log('Refresh token found:', !!refreshToken);
    console.log('Refresh token (truncated):', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');

    if (!refreshToken) {
      console.log('No refresh token found in cookies');
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      console.log('Calling authService.refreshAccessToken...');
      const result = await this.authService.refreshAccessToken(refreshToken);
      console.log('Refresh successful, new access token generated');

      // Set new access token
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });

      console.log('New access token cookie set');
      return { message: 'Token refreshed successfully' };
    } catch (error) {
      console.error('Error in /refresh endpoint:', error);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    console.log('=== /me endpoint called ===');
    console.log('req.user:', req.user);

    const user = req.user as any;
    console.log('user object:', user);
    console.log('user.userId:', user?.userId);

    try {
      const result = await this.authService.findById(user.userId);
      console.log('getUserById result:', result);
      return result;
    } catch (error) {
      console.error('Error in /me endpoint:', error);
      throw error;
    }
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.checkUserSubscription(user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.findById(user.userId);
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  async revokeAllTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    await this.authService.revokeAllUserTokens(user.userId);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'All tokens revoked successfully' };
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    fileFilter: (req, file, cb) => {
      // Accept only image files
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log('=== Avatar Upload Request ===');
    console.log('File received:', !!file);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = req.user as any;
    console.log('User ID:', user.userId);

    try {
      // Upload to S3 (default behavior now)
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const s3Url = await this.awsS3Service.uploadFile(
        file.buffer,
        fileName,
        `avatars/${user.userId}`
      );

      console.log('Avatar uploaded to S3:', s3Url);

      // Update user with S3 avatar URL
      const updatedUser = await this.authService.updateAvatar(user.userId, s3Url);

      return {
        message: 'Avatar uploaded successfully',
        avatarPath: s3Url, // Keep backward compatibility
        avatarUrl: s3Url,
        user: updatedUser
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new BadRequestException(`Failed to upload avatar: ${error.message}`);
    }
  }

  @Post('upload-avatar-s3')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    fileFilter: (req, file, cb) => {
      // Accept only image files
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatarToS3(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log('=== Avatar S3 Upload Request ===');
    console.log('File received:', !!file);
    console.log('File details:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = req.user as any;
    console.log('User ID:', user.userId);

    try {
      // Upload to S3 with proper folder structure
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const s3Url = await this.awsS3Service.uploadFile(
        file.buffer,
        fileName,
        `avatars/${user.userId}`
      );

      console.log('Avatar uploaded to S3:', s3Url);

      // Update user with S3 avatar URL
      const updatedUser = await this.authService.updateAvatar(user.userId, s3Url);

      return {
        message: 'Avatar uploaded to S3 successfully',
        avatarUrl: s3Url,
        user: updatedUser
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new BadRequestException(`Failed to upload avatar to S3: ${error.message}`);
    }
  }
}
