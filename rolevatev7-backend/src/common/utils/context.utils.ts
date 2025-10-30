/**
 * Utility functions for working with GraphQL context
 */

/**
 * Extracts the request object from GraphQL context
 * Handles both context.request and context.req for Fastify compatibility
 */
export function getRequestFromContext(context: any) {
  return context.request || context.req;
}

/**
 * Extracts the authenticated user from GraphQL context
 * Throws an error if user is not authenticated
 */
export function getUserFromContext(context: any) {
  const request = getRequestFromContext(context);
  const user = request?.user;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return user;
}

/**
 * Extracts the user ID from GraphQL context
 * Throws an error if user is not authenticated
 */
export function getUserIdFromContext(context: any): string {
  const user = getUserFromContext(context);
  
  if (!user.id) {
    throw new Error('User ID not found');
  }
  
  return user.id;
}
