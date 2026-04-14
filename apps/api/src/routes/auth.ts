import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const authRouter = Router();

const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign({ sub: userId, jti }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

authRouter.post('/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { name, email, password } = result.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      givingBudget: { create: { month: currentMonth, remaining: 200 } },
    },
    select: { id: true, name: true, email: true },
  });

  const jti = randomUUID();
  await redis.set(`refresh:${jti}`, user.id, 'EX', REFRESH_TTL_SEC);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, jti);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user, accessToken });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const jti = randomUUID();
  await redis.set(`refresh:${jti}`, user.id, 'EX', REFRESH_TTL_SEC);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, jti);
  setRefreshCookie(res, refreshToken);

  res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      sub: string;
      jti: string;
    };

    const storedUserId = await redis.get(`refresh:${payload.jti}`);
    if (!storedUserId || storedUserId !== payload.sub) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Rotate: delete old jti, issue new pair
    await redis.del(`refresh:${payload.jti}`);
    const newJti = randomUUID();
    await redis.set(`refresh:${newJti}`, payload.sub, 'EX', REFRESH_TTL_SEC);

    const accessToken = signAccessToken(payload.sub);
    const newRefreshToken = signRefreshToken(payload.sub, newJti);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { jti: string };
      await redis.del(`refresh:${payload.jti}`);
    } catch {
      // token invalid — still clear cookie
    }
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ ok: true });
});
