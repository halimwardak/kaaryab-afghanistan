import { db } from '../config/db.js';
export async function opportunityStatistics(where = {}) {
  const [total, jobs, scholarships, internships, remote, expiring] = await db.$transaction([
    db.opportunity.count({ where }),
    db.opportunity.count({ where: { ...where, category: { name: 'Job' } } }),
    db.opportunity.count({ where: { ...where, category: { name: 'Scholarship' } } }),
    db.opportunity.count({ where: { ...where, category: { name: 'Internship' } } }),
    db.opportunity.count({ where: { ...where, type: 'Remote' } }),
    db.opportunity.findMany({ where: { ...where, deadline: { gte: new Date(new Date().toISOString().slice(0, 10)), lte: new Date(Date.now() + 7 * 86400000) } }, orderBy: { deadline: 'asc' }, take: 10, include: { category: true } }),
  ]);
  return { total, jobs, scholarships, internships, remote, expiring: expiring.map(row => ({ ...row, category: row.category.name, deadline: row.deadline.toISOString().slice(0, 10) })) };
}
