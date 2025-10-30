import { SetMetadata } from '@nestjs/common';

export const CHECK_OWNERSHIP_KEY = 'checkOwnership';

export interface OwnershipCheckOptions {
  /**
   * The type of resource to check ownership for
   */
  resourceType: 'application' | 'application-note' | 'job' | 'candidate-profile';
  
  /**
   * The parameter name in the request that contains the resource ID
   * Default: 'id'
   */
  resourceIdParam?: string;
  
  /**
   * Whether to allow read-only access for business users
   * Default: false
   */
  allowBusinessRead?: boolean;
  
  /**
   * Whether this is a modification operation (update/delete)
   * Default: false
   */
  isModification?: boolean;
}

/**
 * Decorator to check resource ownership before allowing access
 * Use this on resolvers or controllers to enforce authorization
 * 
 * @example
 * @CheckOwnership({ resourceType: 'application', resourceIdParam: 'id' })
 * async updateApplication(@Args('id') id: string, @Args('input') input: UpdateApplicationInput) {
 *   // Will only execute if user owns the application
 * }
 */
export const CheckOwnership = (options: OwnershipCheckOptions) => 
  SetMetadata(CHECK_OWNERSHIP_KEY, options);
