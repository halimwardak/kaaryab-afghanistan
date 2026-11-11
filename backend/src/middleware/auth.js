import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { HttpError, publicUser } from '../utils/http.js';

export const cookieName = env.NODE_ENV === 'production' ? '__Host-kaaryab_session' : 'kaaryab_session';
export const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };
export async function optionalAuth(req, res, next) {
  const token = req.cookies[cookieName];
  if (token) {
    let claims;
    try { claims = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'kaaryab-api', audience: 'kaaryab-web' }); }
    catch { res.clearCookie(cookieName, cookieOptions); }
    if (claims) {
      const session = await db.session.findUnique({ where: { id: claims.jti }, include: { user: { select: publicUser } } });
      if (session && session.userId === claims.sub && session.expiresAt > new Date() && session.user.active) {
        req.user = session.user;
        req.sessionId = session.id;
      }
    }
  }
  next();
}
export function authenticated(req, res, next) {
  if (!req.user) throw new HttpError(401, 'Please sign in to continue.');
  next();
}
export function admin(req, res, next) {
  if (req.user?.role !== 'ADMIN') throw new HttpError(403, 'Administrator access required.');
  next();
}
export async function createSession(userId, res) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const session = await db.session.create({ data: { userId, expiresAt } });
  const token = jwt.sign({}, env.JWT_SECRET, { algorithm: 'HS256', subject: userId, jwtid: session.id, expiresIn: '8h', issuer: 'kaaryab-api', audience: 'kaaryab-web' });
  res.cookie(cookieName, token, { ...cookieOptions, expires: expiresAt });
}
