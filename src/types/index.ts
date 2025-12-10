import { Request } from 'express';

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
