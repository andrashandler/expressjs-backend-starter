import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { loginSchema, refreshTokenSchema } from '../validators/schemas';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest, JWTPayload } from '../types/index.js';

const router = Router();

const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
});

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/auth/refresh',
});

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(body.password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    throw error;
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

    const decodedUser = jwt.verify(token, REFRESH_SECRET) as JWTPayload;

    const payload: JWTPayload = {
      userId: decodedUser.userId,
      email: decodedUser.email,
      username: decodedUser.username,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/auth/refresh' });

  return res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, req.user!.userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    throw error;
  }
});
export default router;
