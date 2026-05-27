import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthPayload = {
  adminId: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.admin = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
