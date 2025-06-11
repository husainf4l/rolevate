import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: { id: string; email: string; username: string }) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.usersService.findOne(id);
  }
}
