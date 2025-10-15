import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { RegisterInput, LoginInput } from './dto/auth.input';
import { AuthResponse, RegisterResponse } from './dto/auth.response';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('input', { type: () => RegisterInput }, new ValidationPipe()) input: RegisterInput,
  ): Promise<RegisterResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input', { type: () => LoginInput }, new ValidationPipe()) input: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Query(() => String)
  async hello(): Promise<string> {
    return 'Hello from Auth Service!';
  }
}

@Resolver(() => User)
export class UserResolver {
  constructor(private authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => String }) id: string): Promise<User | null> {
    try {
      return await this.authService.findById(id);
    } catch (error) {
      return null;
    }
  }
}