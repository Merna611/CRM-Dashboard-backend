import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface Context {
  user: AuthUser | null;
  prisma: PrismaClient;
}

export function getUser(token: string | undefined): AuthUser | null {
  if (!token) return null;
  try {
    const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
    return jwt.verify(clean, process.env.JWT_SECRET!) as AuthUser;
  } catch {
    return null;
  }
}

export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) throw new Error('Authentication required');
  return user;
}
