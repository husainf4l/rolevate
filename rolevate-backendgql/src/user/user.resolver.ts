import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UserDto } from './user.dto';
import { UserService } from './user.service';
import { CreateUserInput } from './create-user.input';
import { ChangePasswordInput } from './change-password.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserDto])
  @UseGuards(JwtAuthGuard)
  async users(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    return users.map(user => ({
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        description: user.company.description,
        website: user.company.website,
        logo: user.company.logo,
        industry: user.company.industry,
        size: user.company.size,
        founded: user.company.founded,
        location: user.company.location,
        addressId: user.company.addressId,
        createdAt: user.company.createdAt,
        updatedAt: user.company.updatedAt,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  @Query(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any): Promise<UserDto> {
    const userId = context.req.user.id;
    const user = await this.userService.findOne(userId);
    if (!user) throw new Error('User not found');
    
    return {
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        description: user.company.description,
        website: user.company.website,
        logo: user.company.logo,
        industry: user.company.industry,
        size: user.company.size,
        founded: user.company.founded,
        location: user.company.location,
        email: user.company.email,
        phone: user.company.phone,
        addressId: user.company.addressId,
        createdAt: user.company.createdAt,
        updatedAt: user.company.updatedAt,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

    @Query(() => UserDto, { nullable: true })
  @UseGuards(ApiKeyGuard)
  async user(@Args('id') id: string): Promise<UserDto | null> {
    const user = await this.userService.findOne(id);
    if (!user) return null;
    return {
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        description: user.company.description,
        website: user.company.website,
        logo: user.company.logo,
        industry: user.company.industry,
        size: user.company.size,
        founded: user.company.founded,
        location: user.company.location,
        addressId: user.company.addressId,
        createdAt: user.company.createdAt,
        updatedAt: user.company.updatedAt,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Mutation(() => UserDto)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserDto> {
    const user = await this.userService.create(input.userType, input.email, input.password, input.name, input.phone);
    return {
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        description: user.company.description,
        website: user.company.website,
        logo: user.company.logo,
        industry: user.company.industry,
        size: user.company.size,
        founded: user.company.founded,
        location: user.company.location,
        addressId: user.company.addressId,
        createdAt: user.company.createdAt,
        updatedAt: user.company.updatedAt,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Change user password
   * Requires authentication and current password verification
   */
  @Mutation(() => Boolean, {
    description: 'Change the current user\'s password. Requires current password verification.'
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
      input.newPassword
    );
  }
}