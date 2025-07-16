import { Controller, Post, Body, UnauthorizedException, Res, Req, Get, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
      maxAge: 15 * 60 * 1000, // 15 minutes
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
      maxAge: 15 * 60 * 1000, // 15 minutes
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
        maxAge: 15 * 60 * 1000, // 15 minutes
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
      const result = await this.authService.getUserById(user.userId);
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
    return this.authService.getUserById(user.userId);
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
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = join(process.cwd(), 'uploads', 'avatars');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const fileName = `avatar_${uuidv4()}${fileExtension}`;
        cb(null, fileName);
      },
    }),
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
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = req.user as any;
    
    // Update user with avatar path
    const avatarPath = `avatars/${file.filename}`;
    const updatedUser = await this.authService.updateAvatar(user.userId, avatarPath);

    return {
      message: 'Avatar uploaded successfully',
      avatarPath,
      user: updatedUser
    };
  }
}
