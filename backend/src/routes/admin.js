import { Router } from 'express';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { db } from '../config/db.js';
import { authenticated, admin } from '../middleware/auth.js';
import { opportunity, pagination, applicationStatus } from '../validators/index.js';
import { HttpError, opportunityDTO, pageResult, publicUser } from '../utils/http.js';
import { listOpportunities, opportunityData } from '../services/opportunities.js';
import { opportunityStatistics } from '../services/statistics.js';

export const adminRoutes = Router();
adminRoutes.use(authenticated, admin);
adminRoutes.get('/opportunities', async (req, res) => res.json(await listOpportunities(req.query, true)));
adminRoutes.get('/opportunities/:id', async (req, res) => {
  const row = await db.opportunity.findUnique({ where: { id: req.params.id }, include: { category: true, translations: true } });
  if (!row) throw new HttpError(404, 'Opportunity not found.');
  res.json({ data: opportunityDTO(row) });
});
adminRoutes.post('/opportunities', async (req, res) => {
  const data = await opportunityData(opportunity.parse(req.body));
  const row = await db.opportunity.create({ data: { ...data, createdById: req.user.id }, include: { category: true, translations: true } });
  res.status(201).json({ data: opportunityDTO(row) });
});
adminRoutes.put('/opportunities/:id', async (req, res) => {
  const data = await opportunityData(opportunity.parse(req.body), true);
  const row = await db.opportunity.update({ where: { id: req.params.id }, data, include: { category: true, translations: true } });
  res.json({ data: opportunityDTO(row) });
});
adminRoutes.patch('/opportunities/:id/status', async (req, res) => {
  const data = z.object({ status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']) }).strict().parse(req.body);
  const row = await db.opportunity.update({ where: { id: req.params.id }, data, include: { category: true, translations: true } });
  res.json({ data: opportunityDTO(row) });
});
adminRoutes.delete('/opportunities/:id', async (req, res) => {
  if (await db.application.count({ where: { opportunityId: req.params.id } })) throw new HttpError(409, 'This opportunity has applications. Close it instead to preserve their history.');
  await db.opportunity.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
const categoryInput = z.object({ name: z.string().trim().min(2).max(80), nameFa: z.string().trim().min(2).max(80).optional(), namePs: z.string().trim().min(2).max(80).optional() }).strict();
adminRoutes.post('/categories', async (req, res) => res.status(201).json({ data: await db.category.create({ data: categoryInput.parse(req.body) }) }));
adminRoutes.patch('/categories/:id', async (req, res) => res.json({ data: await db.category.update({ where: { id: req.params.id }, data: categoryInput.parse(req.body) }) }));
adminRoutes.delete('/categories/:id', async (req, res) => {
  await db.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
adminRoutes.get('/users', async (req, res) => {
  const { page, limit } = pagination.parse(req.query);
  const [data, total] = await db.$transaction([db.user.findMany({ select: publicUser, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), db.user.count()]);
  res.json(pageResult(data, total, page, limit));
});
adminRoutes.patch('/users/:id', async (req, res) => {
  const data = z.object({ role: z.enum(['USER', 'ADMIN']).optional(), active: z.boolean().optional() }).strict().refine(v => Object.keys(v).length > 0).parse(req.body);
  if (req.params.id === req.user.id) throw new HttpError(409, 'You cannot change your own administrative access.');
  const user = await db.$transaction(async tx => {
    const user = await tx.user.update({ where: { id: req.params.id }, data, select: publicUser });
    await tx.session.deleteMany({ where: { userId: user.id } });
    return user;
  });
  res.json({ data: user });
});
adminRoutes.get('/applications', async (req, res) => {
  const { page, limit } = pagination.parse(req.query);
  const status = req.query.status ? applicationStatus.parse(req.query.status) : undefined;
  const where = status ? { status } : {};
  const [data, total] = await db.$transaction([
    db.application.findMany({ where, include: { user: { select: publicUser }, opportunity: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.application.count({ where }),
  ]);
  res.json(pageResult(data, total, page, limit));
});
adminRoutes.patch('/applications/:id', async (req, res) => {
  const data = z.object({ status: applicationStatus }).strict().parse(req.body);
  res.json({ data: await db.application.update({ where: { id: req.params.id }, data }) });
});
adminRoutes.get('/messages', async (req, res) => {
  const { page, limit } = pagination.parse(req.query);
  const [data, total] = await db.$transaction([db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), db.contactMessage.count()]);
  res.json(pageResult(data, total, page, limit));
});
adminRoutes.patch('/messages/:id', async (req, res) => {
  const data = z.object({ read: z.boolean() }).strict().parse(req.body);
  res.json({ data: await db.contactMessage.update({ where: { id: req.params.id }, data }) });
});
adminRoutes.get('/stats', async (req, res) => {
  const [opportunities, published, users, applications, unreadMessages, byCategory, byStatus] = await db.$transaction([
    db.opportunity.count(), db.opportunity.count({ where: { status: 'PUBLISHED' } }), db.user.count(), db.application.count(),
    db.contactMessage.count({ where: { read: false } }), db.opportunity.groupBy({ by: ['categoryId'], _count: true }), db.application.groupBy({ by: ['status'], _count: true }),
  ]);
  res.json({ data: { opportunities, published, users, applications, unreadMessages, byCategory, byStatus, ...await opportunityStatistics() } });
});
// Explicit, additive import: never overwrite a record, including original sample IDs.
adminRoutes.post('/import', async (req, res) => {
  const { items } = z.object({ items: z.array(z.unknown()).max(500) }).strict().parse(req.body);
  const report = [];
  for (const [index, raw] of items.entries()) {
    const { id: legacyId, ...fields } = raw && typeof raw === 'object' ? raw : {};
    const parsed = opportunity.safeParse(fields);
    if (!parsed.success) { report.push({ index, legacyId, error: 'Invalid listing. Export the backup and correct its fields before retrying.' }); continue; }
    const input = parsed.data;
    const existing = typeof legacyId === 'string' ? await db.opportunity.findUnique({ where: { id: legacyId }, include: { category: true, translations: true } }) : null;
    if (existing) {
      const dto = opportunityDTO(existing);
      if (Object.keys(input).every(key => JSON.stringify(input[key]) === JSON.stringify(dto[key]))) {
        report.push({ index, legacyId, id: existing.id, result: 'existing' }); continue;
      }
    }
    const id = `legacy-${createHash('sha256').update(JSON.stringify(input)).digest('hex')}`;
    try {
      const data = await opportunityData(input);
      await db.opportunity.upsert({ where: { id }, create: { ...data, id, createdById: req.user.id }, update: {} });
      report.push({ index, legacyId, id, result: 'imported' });
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;
      report.push({ index, legacyId, error: error.message });
    }
  }
  res.json({ data: report });
});
