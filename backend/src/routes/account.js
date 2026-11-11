import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { authenticated } from '../middleware/auth.js';
import { application, pagination } from '../validators/index.js';
import { HttpError, opportunityDTO, pageResult } from '../utils/http.js';
import { publishedOpportunity } from '../services/opportunities.js';

export const savedRoutes = Router();
savedRoutes.use(authenticated);
savedRoutes.get('/', async (req, res) => {
  const rows = await db.savedOpportunity.findMany({ where: { userId: req.user.id, opportunity: { status: 'PUBLISHED' } }, include: { opportunity: { include: { category: true, translations: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ data: rows.map(row => opportunityDTO(row.opportunity, req.locale)) });
});
savedRoutes.put('/:id', async (req, res) => {
  await publishedOpportunity(req.params.id);
  const key = { userId: req.user.id, opportunityId: req.params.id };
  await db.savedOpportunity.upsert({ where: { userId_opportunityId: key }, create: key, update: {} });
  res.json({ message: 'Opportunity saved.' });
});
savedRoutes.delete('/:id', async (req, res) => {
  await db.savedOpportunity.deleteMany({ where: { userId: req.user.id, opportunityId: req.params.id } });
  res.status(204).end();
});
savedRoutes.post('/import', async (req, res) => {
  const { ids } = z.object({ ids: z.array(z.string().min(1).max(100)).max(1000) }).strict().parse(req.body);
  const found = await db.opportunity.findMany({ where: { id: { in: ids }, status: 'PUBLISHED' }, select: { id: true } });
  await db.savedOpportunity.createMany({ data: found.map(op => ({ userId: req.user.id, opportunityId: op.id })), skipDuplicates: true });
  const matched = new Set(found.map(op => op.id));
  res.json({ imported: found.length, unmatched: ids.filter(id => !matched.has(id)) });
});

export const applicationRoutes = Router();
applicationRoutes.use(authenticated);
applicationRoutes.get('/', async (req, res) => {
  const { page, limit } = pagination.parse(req.query);
  const where = { userId: req.user.id };
  const [rows, total] = await db.$transaction([
    db.application.findMany({ where, include: { opportunity: { include: { category: true, translations: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.application.count({ where }),
  ]);
  res.json(pageResult(rows.map(row => ({ ...row, opportunity: opportunityDTO(row.opportunity, req.locale) })), total, page, limit));
});
applicationRoutes.post('/', async (req, res) => {
  const input = application.parse(req.body);
  const op = await publishedOpportunity(input.opportunityId);
  if (op.deadline.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) throw new HttpError(409, 'The application deadline has passed.');
  const data = await db.application.create({ data: { ...input, userId: req.user.id } });
  res.status(201).json({ data });
});
