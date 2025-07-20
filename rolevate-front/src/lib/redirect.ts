// Redirect utility for handling login redirects
// This utility helps manage where users should be redirected after signing in

const REDIRECT_KEY = 'rolevate_redirect_url';

export class RedirectManager {
  /**
   * Store the current URL as the redirect destination
   * @param url - The URL to redirect to after login (defaults to current URL)
   */
  static setRedirectUrl(url?: string): void {
    const redirectUrl = url || window.location.href;
    
    // Only store valid URLs that belong to our app
    if (this.isValidRedirectUrl(redirectUrl)) {
      localStorage.setItem(REDIRECT_KEY, redirectUrl);
    }
  }

  /**
   * Get the stored redirect URL
   * @returns The stored redirect URL or null if none exists
   */
  static getRedirectUrl(): string | null {
    if (typeof window === 'undefined') return null;
    
    const url = localStorage.getItem(REDIRECT_KEY);
    return url && this.isValidRedirectUrl(url) ? url : null;
  }

  /**
   * Clear the stored redirect URL
   */
  static clearRedirectUrl(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REDIRECT_KEY);
  }

  /**
   * Get redirect URL from URL parameters
   * @param searchParams - URL search parameters
   * @returns The redirect URL from parameters or null
   */
  static getRedirectFromParams(searchParams: URLSearchParams): string | null {
    const redirect = searchParams.get('redirect');
    return redirect && this.isValidRedirectUrl(redirect) ? redirect : null;
  }

  /**
   * Create a login URL with redirect parameter
   * @param redirectUrl - The URL to redirect to after login
   * @returns Login URL with redirect parameter
   */
  static createLoginUrl(redirectUrl?: string): string {
    const baseLoginUrl = '/login';
    const url = redirectUrl || window.location.href;
    
    if (this.isValidRedirectUrl(url)) {
      const encodedUrl = encodeURIComponent(url);
      return `${baseLoginUrl}?redirect=${encodedUrl}`;
    }
    
    return baseLoginUrl;
  }

  /**
   * Determine the appropriate redirect URL after successful login
   * @param user - The authenticated user object
   * @param customRedirect - Custom redirect URL (from params or storage)
   * @returns The URL to redirect to
   */
  static getPostLoginRedirect(user: any, customRedirect?: string): string {
    // If there's a custom redirect and it's valid, use it
    if (customRedirect && this.isValidRedirectUrl(customRedirect)) {
      return customRedirect;
    }

    // Check localStorage for stored redirect
    const storedRedirect = this.getRedirectUrl();
    if (storedRedirect) {
      return storedRedirect;
    }

    // Default redirects based on user type
    switch (user.userType) {
      case "CANDIDATE":
        return "/userdashboard";
      case "COMPANY":
        // Check if company user has a company or companyId
        if (!user.company && !user.companyId) {
          return "/dashboard/setup-company";
        } else {
          return "/dashboard";
        }
      default:
        return "/";
    }
  }

  /**
   * Check if a URL is valid for redirection
   * @param url - The URL to validate
   * @returns True if the URL is valid for redirection
   */
  private static isValidRedirectUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      
      // Only allow same-origin URLs
      if (parsed.origin !== window.location.origin) {
        return false;
      }

      // Block redirect to login/signup pages to prevent infinite loops
      const blockedPaths = ['/login', '/signup', '/auth'];
      if (blockedPaths.some(path => parsed.pathname.startsWith(path))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle redirect after successful authentication
   * @param router - Next.js router instance
   * @param user - The authenticated user object
   * @param customRedirect - Custom redirect URL
   */
  static handlePostLoginRedirect(router: any, user: any, customRedirect?: string): void {
    const redirectUrl = this.getPostLoginRedirect(user, customRedirect);
    
    // Clear stored redirect after using it
    this.clearRedirectUrl();
    
    // Use replace to prevent back button issues
    router.replace(redirectUrl);
  }
}

/**
 * Hook for managing redirect state in React components
 */
export function useRedirect() {
  const setRedirect = (url?: string) => RedirectManager.setRedirectUrl(url);
  const getRedirect = () => RedirectManager.getRedirectUrl();
  const clearRedirect = () => RedirectManager.clearRedirectUrl();
  const createLoginUrl = (redirectUrl?: string) => RedirectManager.createLoginUrl(redirectUrl);

  return {
    setRedirect,
    getRedirect,
    clearRedirect,
    createLoginUrl,
  };
}
