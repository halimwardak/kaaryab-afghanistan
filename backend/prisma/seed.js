import {messageFor} from '../../locales/catalog.mjs';
import { db } from '../src/config/db.js';
import { opportunities } from '../../data/opportunities.js';
const names = ['Job', 'Internship', 'Scholarship', 'Online course', 'Remote work', 'Training program', 'Volunteer work'];
try {
  for (const name of names) await db.category.upsert({ where: { name }, create: { name, nameFa:messageFor('fa-AF',name), namePs:messageFor('ps-AF',name) }, update: {} });
  for (const name of names) {
    await db.category.updateMany({where:{name,nameFa:null},data:{nameFa:messageFor('fa-AF',name)}});
    await db.category.updateMany({where:{name,namePs:null},data:{namePs:messageFor('ps-AF',name)}});
  }
  if (process.env.SEED_DEMO === 'true') {
    for (const op of opportunities) {
      const { category, deadline, ...data } = op;
      const categoryRow = await db.category.findUnique({ where: { name: category } });
      await db.opportunity.upsert({ where: { id: op.id }, create: { ...data, categoryId: categoryRow.id, deadline: new Date(`${deadline}T00:00:00Z`), status: 'PUBLISHED' }, update: {} });
    }
  }
  console.log('Categories seeded. Sample opportunities are imported only when SEED_DEMO=true. Existing records were not overwritten.');
} finally { await db.$disconnect(); }
