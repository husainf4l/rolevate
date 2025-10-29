import { User, LoginInput, SignupInput, AuthResponse, AuthError } from '@/types/auth';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

class AuthService {
  private currentUser: User | null = null;

  // GraphQL Mutations
  private LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        access_token
        user {
          id
          email
          userType
          name
          company {
            id
            name
          }
        }
      }
    }
  `;

  private SIGNUP_MUTATION = gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        email
        userType
        name
      }
    }
  `;

  private GET_CURRENT_USER_QUERY = gql`
    query GetCurrentUser {
      me {
        id
        email
        name
        userType
        phone
        avatar
        company {
          id
          name
          description
          industry
          website
          email
          phone
        }
        companyId
        createdAt
        updatedAt
      }
    }
  `;

  private CHANGE_PASSWORD_MUTATION = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
      changePassword(input: $input)
    }
  `;

  private LOGOUT_MUTATION = gql`
    mutation Logout {
      logout
    }
  `;

  private UPLOAD_AVATAR_TO_S3_MUTATION = gql`
    mutation UploadFileToS3(
      $base64File: String!
      $filename: String!
      $mimetype: String!
    ) {
      uploadFileToS3(
        base64File: $base64File
        filename: $filename
        mimetype: $mimetype
      ) {
        url
        key
        bucket
      }
    }
  `;

  private UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        email
        name
        userType
        phone
        avatar
        createdAt
        updatedAt
      }
    }
  `;

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const { data } = await apolloClient.mutate<{ login: AuthResponse }>({
        mutation: this.LOGIN_MUTATION,
        variables: { input }
      });

      const { access_token, user } = data!.login;

      // Store token in localStorage (Apollo will pick it up automatically)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
      }
      this.setUser(user);

      return data!.login;
    } catch (error: any) {
      // Parse and provide more specific error messages
      const errorMessage = this.parseAuthError(error, 'login');
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new user
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      const { data } = await apolloClient.mutate<{ createUser: User }>({
        mutation: this.SIGNUP_MUTATION,
        variables: { input }
      });

      return data!.createUser;
    } catch (error: any) {
      // Parse and provide more specific error messages
      const errorMessage = this.parseAuthError(error, 'signup');
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    // Call logout mutation on server (fire and forget)
    apolloClient.mutate({
      mutation: this.LOGOUT_MUTATION
    }).catch(() => {
      // Ignore errors, as token might be expired
    });

    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.clearUser();
    
    // Clear Apollo cache
    apolloClient.clearStore();
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * Redirect user based on their type and company status
   */
  redirectAfterLogin(user: User): void {
    if (user.userType === 'BUSINESS') {
      if (!user.company) {
        window.location.href = '/dashboard/setup-company';
      } else {
        window.location.href = '/dashboard';
      }
    } else if (user.userType === 'CANDIDATE') {
      window.location.href = '/userdashboard';
    } else {
      window.location.href = '/';
    }
  }

  /**
   * Get current authenticated user from backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.hasValidToken();
      if (!token) {
        return null;
      }

      const { data } = await apolloClient.query<{ me: User }>({
        query: this.GET_CURRENT_USER_QUERY,
        fetchPolicy: 'network-only' // Always fetch fresh data
      });
      
      if (data?.me) {
        this.setUser(data.me);
        return data.me;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      // If error is authentication related, clear stored data
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('Unauthenticated')) {
        this.logout();
      }
      return null;
    }
  }

  /**
   * Get user from localStorage (synchronous)
   */
  getUserFromStorage(): User | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          this.logout();
        }
      }
    }
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserFromStorage() !== null && this.hasValidToken();
  }

  /**
   * Check if user has valid token
   */
  private hasValidToken(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') !== null;
    }
    return false;
  }

  /**
   * Set current user and store in localStorage
   */
  private setUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Clear current user from memory and localStorage
   */
  private clearUser(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ changePassword: boolean }>({
        mutation: this.CHANGE_PASSWORD_MUTATION,
        variables: {
          input: {
            currentPassword,
            newPassword
          }
        }
      });

      return data?.changePassword || false;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Error(error?.message || 'Failed to change password');
    }
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Upload avatar to S3 and update user profile
   * @param file - The image file to upload (JPEG, PNG, etc.)
   * @returns The URL of the uploaded avatar
   */
  async updateAvatar(file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Convert file to base64
      const base64File = await this.fileToBase64(file);

      // Upload to S3 via GraphQL
      const { data: uploadData } = await apolloClient.mutate<{
        uploadFileToS3: { url: string; key: string; bucket: string };
      }>({
        mutation: this.UPLOAD_AVATAR_TO_S3_MUTATION,
        variables: {
          base64File,
          filename: file.name,
          mimetype: file.type
        }
      });

      if (!uploadData?.uploadFileToS3?.url) {
        throw new Error('Failed to upload avatar to S3');
      }

      const avatarUrl = uploadData.uploadFileToS3.url;

      // Get current user ID
      const currentUser = this.getUserFromStorage();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Update user with new avatar URL
      const { data: updateData } = await apolloClient.mutate<{ updateUser: User }>({
        mutation: this.UPDATE_USER_MUTATION,
        variables: {
          id: currentUser.id,
          input: {
            avatar: avatarUrl
          }
        },
        refetchQueries: ['GetCurrentUser']
      });

      if (!updateData?.updateUser) {
        throw new Error('Failed to update user avatar');
      }

      // Update the local user cache
      this.setUser(updateData.updateUser);

      return avatarUrl;
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      throw new Error(error?.message || 'Failed to update avatar');
    }
  }

  /**
   * Remove user avatar
   */
  async removeAvatar(): Promise<boolean> {
    try {
      // Get current user ID
      const currentUser = this.getUserFromStorage();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { data } = await apolloClient.mutate<{ updateUser: User }>({
        mutation: this.UPDATE_USER_MUTATION,
        variables: {
          id: currentUser.id,
          input: {
            avatar: null
          }
        },
        refetchQueries: ['GetCurrentUser']
      });

      if (!data?.updateUser) {
        throw new Error('Failed to remove avatar');
      }

      // Update the local user cache
      this.setUser(data.updateUser);

      return true;
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      throw new Error(error?.message || 'Failed to remove avatar');
    }
  }

  /**
   * Parse authentication errors and provide user-friendly messages
   */
  private parseAuthError(error: any, operation: 'login' | 'signup'): string {
    const message = error?.message || '';

    // Common error patterns
    if (message.includes('Invalid credentials') || message.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    if (message.includes('User not found') || message.includes('user_not_found')) {
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    }

    if (message.includes('Email already exists') || message.includes('duplicate') || message.includes('UQ_')) {
      return 'An account with this email already exists. Please try logging in instead.';
    }

    if (message.includes('Password') && (message.includes('weak') || message.includes('strength'))) {
      return 'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.';
    }

    if (message.includes('password') && message.includes('incorrect')) {
      return 'Incorrect password. Please check your password and try again.';
    }

    if (message.includes('Email not verified') || message.includes('email_not_verified')) {
      return 'Please verify your email address before signing in.';
    }

    if (message.includes('Account locked') || message.includes('account_locked')) {
      return 'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.';
    }

    if (message.includes('Account suspended') || message.includes('account_suspended')) {
      return 'Your account has been suspended. Please contact support for assistance.';
    }

    // Network and server errors
    if (message.includes('Network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (message.includes('timeout') || message.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (message.includes('500') || message.includes('Internal server error')) {
      return 'Server error. Please try again later or contact support if the problem persists.';
    }

    // Default messages based on operation
    if (operation === 'login') {
      return 'Unable to sign in. Please check your email and password.';
    } else {
      return 'Unable to create account. Please check your information and try again.';
    }
  }
}

export const authService = new AuthService();

// Export convenience functions
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserFromStorage = () => authService.getUserFromStorage();
export const changePassword = (currentPassword: string, newPassword: string) =>
  authService.changePassword(currentPassword, newPassword);
export const updateAvatar = (file: File) => authService.updateAvatar(file);
export const removeAvatar = () => authService.removeAvatar();