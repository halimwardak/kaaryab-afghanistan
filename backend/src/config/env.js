import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});
export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production' && (!env.FRONTEND_URL.startsWith('https://') || env.JWT_SECRET.includes('replace-with'))) {
  throw new Error('Production requires HTTPS and a private random JWT_SECRET.');
}
export const origin = new URL(env.FRONTEND_URL).origin;
