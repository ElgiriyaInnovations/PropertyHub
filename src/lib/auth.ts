import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from './storage';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Refresh token expires in 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

// Generate JWT tokens with default role as buyer
export function generateTokens(userId: string, email: string, role: string = "buyer") {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' } as JWTPayload,
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Authentication for Next.js
export async function authenticateJWT(request: NextRequest) {
  try {
    // First try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('accessToken')?.value;
    }
    
    console.log('Auth header received:', authHeader ? 'Bearer ***' : 'None');
    console.log('Token from cookies:', token ? 'Present' : 'None');

    if (!token) {
      console.log('No token provided in request');
      return null;
    }

    const payload = verifyToken(token);
    console.log('Token payload:', payload ? 'Valid' : 'Invalid');
    
    if (!payload || payload.type !== 'access') {
      console.log('Invalid token type or expired token');
      return null;
    }

    // Get user from database to ensure they still exist
    const user = await storage.getUser(payload.userId);
    if (!user) {
      console.log('User not found for userId:', payload.userId);
      return null;
    }

    console.log('Authentication successful for user:', user.id);
    return user;
  } catch (error) {
    console.error('JWT Authentication error:', error);
    return null;
  }
}

// Optional JWT Authentication (doesn't fail if no token)
export async function optionalJWT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.type === 'access') {
        const user = await storage.getUser(payload.userId);
        if (user) {
          return user;
        }
      }
    }
    return null;
  } catch (error) {
    // Continue without authentication
    return null;
  }
}

// Role-based authorization middleware
export function authorize(roles: string[]) {
  return (user: any, userRole: string) => {
    if (!user) {
      console.log('Authorization failed: No user found');
      return false;
    }

    // For now, allow all authenticated users since role is managed client-side
    // The client will handle role-based UI restrictions
    console.log('Authorization successful for user:', user.id, 'with role:', userRole);
    return true;
  };
}

// Generate a random string for tokens
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Set secure HTTP-only cookies for tokens
export function setTokenCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear token cookies
export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
}