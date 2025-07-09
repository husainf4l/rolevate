// src/services/auth.ts

const BASE_API = "http://localhost:4005/api";

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
