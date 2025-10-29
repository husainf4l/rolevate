import { SetMetadata } from '@nestjs/common';
import { UserType } from '../user/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which user types are allowed to access a resolver or endpoint
 * @param roles - Array of UserType values
 * @example @Roles(UserType.ADMIN, UserType.BUSINESS)
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
