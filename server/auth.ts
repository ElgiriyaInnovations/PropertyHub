import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import rateLimit from 'express-rate-limit';

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

// Rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust proxy headers in Replit environment
});

// Generate JWT tokens
export function generateTokens(userId: string, email: string, role: string) {
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

// JWT Authentication middleware
export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader ? 'Bearer ***' : 'None');
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'Access token required' });
    }

    const payload = verifyToken(token);
    console.log('Token payload:', payload ? 'Valid' : 'Invalid');
    
    if (!payload || payload.type !== 'access') {
      console.log('Invalid token type or expired token');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user from database to ensure they still exist
    const user = await storage.getUser(payload.userId);
    if (!user) {
      console.log('User not found for userId:', payload.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Authentication successful for user:', user.id);
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('JWT Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Optional JWT Authentication (doesn't fail if no token)
export async function optionalJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.type === 'access') {
        const user = await storage.getUser(payload.userId);
        if (user) {
          (req as any).user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Role-based authorization middleware
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    console.log('Authorization check:', {
      userExists: !!user,
      userRole: user?.role,
      requiredRoles: roles,
      hasAccess: user?.role ? roles.includes(user.role) : false
    });
    
    if (!user) {
      console.log('Authorization failed: No user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(user.role)) {
      console.log('Authorization failed: Role not allowed');
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}, your role: ${user.role}` 
      });
    }

    console.log('Authorization successful');
    next();
  };
}

// Generate a random string for tokens
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Set secure HTTP-only cookies for tokens
export function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Clear token cookies
export function clearTokenCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}