import { z } from 'zod';
export const email = z.string().trim().toLowerCase().email().max(254);
export const password = z.string().min(12).max(72).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes');
export const name = z.string().trim().min(2).max(100);
export const url = z.string().url().max(2000).refine(v => ['http:', 'https:'].includes(new URL(v).protocol), 'Use an HTTP or HTTPS URL');
export const locale = z.enum(['en', 'fa-AF', 'ps-AF']);
export const register = z.object({ name, email, password, locale: locale.optional() }).strict();
export const translation = z.object({
  locale: z.enum(['fa-AF','ps-AF']), title: z.string().trim().min(3).max(200),
  organization: z.string().trim().min(2).max(200), location: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(20000),
  requirements: z.array(z.string().trim().min(1).max(500)).min(1).max(50),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
}).strict();
export const login = z.object({ email, password: z.string().min(1).max(72) }).strict();
export const opportunity = z.object({
  title: z.string().trim().min(3).max(200),
  organization: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1).max(80),
  type: z.enum(['Remote', 'On-site', 'Hybrid']),
  location: z.string().trim().min(2).max(200),
  deadline: z.iso.date(),
  applyLink: url,
  description: z.string().trim().min(10).max(20000),
  requirements: z.array(z.string().trim().min(1).max(500)).min(1).max(50),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('PUBLISHED'),
  translations: z.array(translation).max(2).refine(items => new Set(items.map(item => item.locale)).size === items.length).optional(),
}).strict();
export const pagination = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
export const search = pagination.extend({
  search: z.string().trim().max(200).optional(),
  category: z.string().max(80).optional(),
  type: z.enum(['Remote', 'On-site', 'Hybrid']).optional(),
  location: z.string().max(200).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  expired: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'oldest', 'deadline', 'title']).default('newest'),
});
export const application = z.object({ opportunityId: z.string().min(1).max(100), coverLetter: z.string().trim().min(20).max(10000), resumeUrl: url.optional() }).strict();
export const applicationStatus = z.enum(['SUBMITTED', 'REVIEWING', 'INTERVIEW', 'ACCEPTED', 'REJECTED']);
export const contact = z.object({ name, email, message: z.string().trim().min(10).max(10000) }).strict();
