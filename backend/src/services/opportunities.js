import { db } from '../config/db.js';
import { HttpError, opportunityDTO, pageResult } from '../utils/http.js';
import { search } from '../validators/index.js';

export async function listOpportunities(query, isAdmin = false, locale = 'en') {
  const q = search.parse(query);
  const where = {
    ...(!isAdmin ? { status: 'PUBLISHED' } : q.status ? { status: q.status } : {}),
    ...(q.category ? { category: { OR: ['name','nameFa','namePs'].map(field => ({[field]: q.category})) } } : {}),
    ...(q.type ? { type: q.type } : {}),
    ...(q.location ? { AND: [{ OR: [{ location: { contains: q.location, mode: 'insensitive' } }, {translations:{some:{location:{contains:q.location,mode:'insensitive'}}}}] }] } : {}),
    ...(q.expired ? { deadline: { [q.expired === 'true' ? 'lt' : 'gte']: new Date(new Date().toISOString().slice(0, 10)) } } : {}),
    ...(q.search ? { OR: [...['title', 'organization', 'description'].map(field => ({ [field]: { contains: q.search, mode: 'insensitive' } })), {translations:{some:{OR:['title','organization','description'].map(field=>({[field]:{contains:q.search,mode:'insensitive'}}))}}}] } : {}),
  };
  const orders = { newest: { createdAt: 'desc' }, oldest: { createdAt: 'asc' }, deadline: { deadline: 'asc' }, title: { title: 'asc' } };
  const [rows, total] = await db.$transaction([
    db.opportunity.findMany({ where, include: { category: true, translations: true }, orderBy: [orders[q.sort], { id: 'asc' }], skip: (q.page - 1) * q.limit, take: q.limit }),
    db.opportunity.count({ where }),
  ]);
  return pageResult(rows.map(row => opportunityDTO(row,locale)), total, q.page, q.limit);
}
export async function opportunityData(input, update = false) {
  const { category: name, deadline, translations, ...data } = input;
  const category = await db.category.findUnique({ where: { name } });
  if (!category) throw new HttpError(400, 'Select an existing category.');
  return { ...data, ...(translations ? {translations:{...(update?{deleteMany:{}}:{}),create:translations}}:{}), categoryId: category.id, deadline: new Date(`${deadline}T00:00:00Z`) };
}
export async function publishedOpportunity(id) {
  const row = await db.opportunity.findFirst({ where: { id, status: 'PUBLISHED' }, include: { category: true, translations: true } });
  if (!row) throw new HttpError(404, 'Opportunity not found.');
  return row;
}
