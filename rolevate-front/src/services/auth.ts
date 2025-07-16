// Logout: calls Next.js API route to clear cookies

// src/services/auth.ts

import { API_CONFIG } from '@/lib/config';

const BASE_API = API_CONFIG.API_BASE_URL;

export type UserType = 'COMPANY' | 'CANDIDATE';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  userType: UserType;
  phone: string;
  invitationCode?: string;
}


export async function signup(data: CreateUserDto) {
  const res = await fetch(`${BASE_API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

// Helper function to handle user redirection
function redirectUserByType(user: any, router: any) {
  switch (user.userType) {
    case "CANDIDATE":
      router.replace("/userdashboard");
      break;
    case "COMPANY":
      // Check if company user has a company or companyId
      if (!user.company && !user.companyId) {
        router.replace("/dashboard/setup-company");
      } else {
        router.replace("/dashboard");
      }
      break;
    default:
      router.replace("/");
  }
}

// Login function - returns user object and sets tokens
export async function login({ email, password }: { email: string; password: string }) {
  console.log('Making login request to:', `${BASE_API}/auth/login`);
  
  const res = await fetch(`${BASE_API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include", // This ensures cookies are sent and received
  });

  console.log('Login response status:', res.status);
  console.log('Login response headers:', Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Login failed");
  }

  const data = await res.json();
  console.log('Login successful, user data:', data.user);
  console.log('Document cookies after login:', document.cookie);
  return data.user;
}

// Professional signin function - handles login and redirect
export async function signin({ email, password, router }: { email: string; password: string; router: any }) {
  const user = await login({ email, password });
  redirectUserByType(user, router);
  return user;
}

// Check authentication by making a protected API call
export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_API}/auth/me`, {
      method: "GET",
      credentials: "include", // Send HTTP-only cookies
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Get current authenticated user
export async function getCurrentUser() {
  try {
    const res = await fetch(`${BASE_API}/auth/me`, {
      method: "GET",
      credentials: "include", // Send HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.log('Auth check failed:', error);
    return null;
  }
}

// Get user profile
export async function getProfile() {
  try {
    const res = await fetch(`${BASE_API}/auth/profile`, {
      method: "GET",
      credentials: "include", // Send HTTP-only cookies
    });
    
    if (!res.ok) {
      throw new Error('Failed to get profile');
    }
    
    return await res.json();
  } catch (error) {
    console.log('Profile fetch failed:', error);
    throw error;
  }
}

export async function logout() {
  const res = await fetch(`${BASE_API}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Logout failed");
  }
  return res.json();
}