import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  API_PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Asesoría <no-reply@example.com>'),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional()
});

export const env = envSchema.parse(process.env);
