import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types/index.js';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get the token from HttpOnly cookie (not header!)
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

    // Verify if the secret is defined
    if (!ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET not configured');
    }

    // Verify the token
    const decoded = jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
