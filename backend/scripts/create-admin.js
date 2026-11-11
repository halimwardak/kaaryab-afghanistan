import bcrypt from 'bcrypt';
import { db } from '../src/config/db.js';
import { register } from '../src/validators/index.js';
try {
  const data = register.parse({ name: process.env.ADMIN_NAME || 'Administrator', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  if (await db.user.findUnique({ where: { email: data.email } })) throw new Error('Account already exists. Use an existing administrator to change its role; this command never overwrites credentials.');
  await db.user.create({ data: { name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12), role: 'ADMIN' } });
  console.log('Administrator created. Remove ADMIN_PASSWORD from your environment.');
} finally { await db.$disconnect(); }
