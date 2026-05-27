import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({
      where: { email: input.email }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(input.password, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    return next(error);
  }
});
