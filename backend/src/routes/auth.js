import { Router } from 'express';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticated, createSession, cookieName, cookieOptions } from '../middleware/auth.js';
import { HttpError, publicUser } from '../utils/http.js';
import * as v from '../validators/index.js';
import { mailConfigured, sendReset } from '../services/mail.js';

export const authRoutes = Router();
const dummyHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
const hashToken = token => createHash('sha256').update(token).digest('hex');

authRoutes.post('/register', async (req, res) => {
  const input = v.register.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await db.user.create({ data: { name: input.name, email: input.email, passwordHash, locale: input.locale || req.locale }, select: publicUser });
  if (req.sessionId) await db.session.deleteMany({ where: { id: req.sessionId } });
  await createSession(user.id, res);
  res.status(201).json({ user });
});
authRoutes.post('/login', async (req, res) => {
  const input = v.login.parse(req.body);
  const user = await db.user.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(input.password, user?.passwordHash || dummyHash);
  if (!valid || !user?.active) throw new HttpError(401, 'Invalid email or password.');
  if (req.sessionId) await db.session.deleteMany({ where: { id: req.sessionId } });
  await createSession(user.id, res);
  res.json({ user: await db.user.findUnique({ where: { id: user.id }, select: publicUser }) });
});
authRoutes.post('/logout', async (req, res) => {
  if (req.sessionId) await db.session.deleteMany({ where: { id: req.sessionId } });
  res.clearCookie(cookieName, cookieOptions).json({ message: 'Signed out.' });
});
authRoutes.get('/me', (req, res) => res.json({ user: req.user || null }));
authRoutes.patch('/language', authenticated, async (req, res) => {
  const data = z.object({locale: v.locale}).strict().parse(req.body);
  res.json({ user: await db.user.update({where:{id:req.user.id},data,select:publicUser}) });
});
authRoutes.patch('/profile', authenticated, async (req, res) => {
  const input = z.object({ name: v.name }).strict().parse(req.body);
  res.json({ user: await db.user.update({ where: { id: req.user.id }, data: input, select: publicUser }) });
});
authRoutes.post('/change-password', authenticated, async (req, res) => {
  const input = z.object({ currentPassword: z.string().min(1).max(72), password: v.password }).strict().parse(req.body);
  const user = await db.user.findUnique({ where: { id: req.user.id } });
  if (!await bcrypt.compare(input.currentPassword, user.passwordHash)) throw new HttpError(400, 'Current password is incorrect.');
  const passwordHash = await bcrypt.hash(input.password, 12);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.session.deleteMany({ where: { userId: user.id } }),
    db.passwordReset.deleteMany({ where: { userId: user.id } }),
  ]);
  res.clearCookie(cookieName, cookieOptions).json({ message: 'Password changed. Sign in again.' });
});
authRoutes.post('/forgot-password', async (req, res) => {
  const { email } = z.object({ email: v.email }).strict().parse(req.body);
  const user = await db.user.findUnique({ where: { email } });
  if (user?.active && mailConfigured()) {
    const token = randomBytes(32).toString('hex');
    const reset = await db.passwordReset.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60000) } });
    try { await sendReset(email, token, user.locale); }
    catch {
      await db.passwordReset.deleteMany({ where: { id: reset.id } });
      console.error('Password reset email delivery failed. Check SMTP configuration.');
    }
  }
  res.json({ message: 'If an active account exists and email delivery is configured, a reset link will be sent.' });
});
authRoutes.post('/reset-password', async (req, res) => {
  const input = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: v.password }).strict().parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  await db.$transaction(async tx => {
    const reset = await tx.passwordReset.findUnique({ where: { tokenHash: hashToken(input.token) }, include: { user: true } });
    if (!reset || reset.expiresAt <= new Date() || !reset.user.active) throw new HttpError(400, 'Reset link is invalid or expired.');
    const consumed = await tx.passwordReset.deleteMany({ where: { id: reset.id, expiresAt: { gt: new Date() } } });
    if (!consumed.count) throw new HttpError(400, 'Reset link is invalid or expired.');
    await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
    await tx.passwordReset.deleteMany({ where: { userId: reset.userId } });
    await tx.session.deleteMany({ where: { userId: reset.userId } });
  });
  res.clearCookie(cookieName, cookieOptions).json({ message: 'Password reset. Sign in with your new password.' });
});
