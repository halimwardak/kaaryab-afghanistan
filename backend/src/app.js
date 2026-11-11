import { messageFor, supportedLocales } from '../../locales/catalog.mjs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { db } from './config/db.js';
import { env, origin } from './config/env.js';
import { optionalAuth } from './middleware/auth.js';
import { HttpError } from './utils/http.js';
import { contact } from './validators/index.js';
import { authRoutes } from './routes/auth.js';
import { opportunityRoutes, categoryRoutes } from './routes/opportunities.js';
import { savedRoutes, applicationRoutes } from './routes/account.js';
import { adminRoutes } from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);
  app.use((req, res, next) => {
    const language = req.get('X-KaarYab-Language');
    req.locale = supportedLocales.includes(language) ? language : 'en';
    res.set('Content-Language', req.locale);
    const json = res.json.bind(res);
    res.json = body => {
      if (body && typeof body === 'object') {
        if (body.error) body.error = messageFor(req.locale, body.error);
        if (body.message) body.message = messageFor(req.locale, body.message);
        if (body.details && req.locale !== 'en') body.details = body.details.map(item => ({...item,message:messageFor(req.locale,'This field is invalid.')}));
      }
      return json(body);
    };
    next();
  });
  app.use(helmet());
  app.use(cors({ origin: (value, done) => done(null, !value || value === origin), credentials: true }));
  app.use('/api', rateLimit({ windowMs: 15 * 60000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Try again later.' } }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // Mandatory custom header + exact Origin validation protects cookie-authenticated writes.
      if (req.get('X-KaarYab-Request') !== '1' || (req.get('origin') && req.get('origin') !== origin)) throw new HttpError(403, 'Request origin is not allowed.');
      if (req.body && !req.is('application/json')) throw new HttpError(415, 'Use application/json.');
    }
    next();
  });
  app.get('/api/health', async (req, res) => { await db.$queryRaw`SELECT 1`; res.json({ status: 'ok' }); });
  app.use('/api', optionalAuth);
  const authLimit = rateLimit({ windowMs: 15 * 60000, limit: 30, skip: req => req.method === 'GET', standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many authentication attempts. Try again in 15 minutes.' } });
  app.use('/api/auth', authLimit, authRoutes);
  app.use('/api/opportunities', opportunityRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/saved', savedRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/admin', adminRoutes);
  app.post('/api/contact', rateLimit({ windowMs: 60 * 60000, limit: 5, message: { error: 'Too many messages. Try again in an hour.' } }), async (req, res) => {
    await db.contactMessage.create({ data: contact.parse(req.body) });
    res.status(201).json({ message: 'Your message has been received.' });
  });
  app.use((req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof ZodError) return res.status(400).json({ error: 'Please check the submitted fields.', details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error.code === 'P2002') return res.status(409).json({ error: 'This record already exists (email, category, or application).' });
    if (error.code === 'P2025') return res.status(404).json({ error: 'Record not found.' });
    if (error.code === 'P2003') return res.status(409).json({ error: 'This record is referenced by other records and cannot be removed.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' });
    console.error('Request failed:', error.name, error.code || 'internal');
    res.status(500).json({ error: 'The server could not complete the request. Please try again.' });
  });
  return app;
}
