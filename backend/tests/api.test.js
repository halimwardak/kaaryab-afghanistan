import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import EmbeddedPostgres from 'embedded-postgres';
import request from 'supertest';
import bcrypt from 'bcrypt';

let postgres, db, app, user, admin, stranger, opportunityId, applicationId, userId;
const secret = randomBytes(32).toString('hex');
const password = 'Strong-test-password-123';
const fixture = { title: 'Software Developer', organization: 'KaarYab Test', category: 'Job', type: 'Remote', location: 'Kabul', deadline: '2099-12-31', applyLink: 'https://example.com/apply', description: 'A real opportunity for integration testing.', requirements: ['React experience'], tags: ['React'], status: 'PUBLISHED' };
const write = (agent, method, path, body) => agent[method](`/api${path}`).set('X-KaarYab-Request', '1').set('Origin', 'http://localhost:3000').send(body);

before(async () => {
  const dbPassword = randomBytes(24).toString('hex');
  const port = Number(process.env.TEST_PG_PORT || 55433);
  process.env.NODE_ENV = 'test'; process.env.JWT_SECRET = secret; process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.DATABASE_URL = `postgresql://kaaryab:${dbPassword}@127.0.0.1:${port}/kaaryab_test`;
  delete process.env.SMTP_HOST; delete process.env.MAIL_FROM;
  postgres = new EmbeddedPostgres({ databaseDir: mkdtempSync(join(tmpdir(), 'kaaryab-test-')), user: 'kaaryab', password: dbPassword, port, persistent: false, authMethod: 'scram-sha-256', initdbFlags: ['--encoding=UTF8', '--locale=C'], postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
  await postgres.initialise(); await postgres.start(); await postgres.createDatabase('kaaryab_test');
  const migrate = spawnSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { env: process.env, encoding: 'utf8' });
  assert.equal(migrate.status, 0, migrate.stderr || migrate.stdout);
  ({ db } = await import('../src/config/db.js'));
  const { createApp } = await import('../src/app.js'); app = createApp();
  await db.category.create({ data: { name: 'Job' } });
  await db.user.create({ data: { name: 'Admin', email: 'admin@example.test', passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' } });
  user = request.agent(app); admin = request.agent(app); stranger = request.agent(app);
}, { timeout: 120000 });

after(async () => {
  console.log('Test cleanup: disconnecting Prisma.');
  if (db) await db.$disconnect();
  console.log('Test cleanup: stopping PostgreSQL.');
  if (postgres) await postgres.stop();
  console.log('Test cleanup complete.');
}, { timeout: 30000 });

test('health, registration, hashed passwords, and safe cookie session', async () => {
  await request(app).get('/api/health').expect(200);
  const result = await write(user, 'post', '/auth/register', { name: 'Test User', email: 'USER@example.test', password }).expect(201);
  userId = result.body.user.id;
  assert.equal(result.body.user.role, 'USER'); assert.equal(result.body.user.email, 'user@example.test');
  assert.equal(result.body.user.passwordHash, undefined);
  assert.match(result.headers['set-cookie'][0], /HttpOnly/); assert.match(result.headers['set-cookie'][0], /SameSite=Lax/);
  const stored = await db.user.findUnique({ where: { id: userId } }); assert.notEqual(stored.passwordHash, password); assert.ok(await bcrypt.compare(password, stored.passwordHash));
  assert.equal((await user.get('/api/auth/me')).body.user.id, userId);
});

test('PostgreSQL stores and reads Dari and Pashto without encoding loss', async () => {
  const encoding = await db.$queryRaw`SHOW server_encoding`;
  assert.equal(encoding[0].server_encoding, 'UTF8');
  const category = await db.category.create({data:{name:'Unicode regression',nameFa:'فرصت‌های آموزشی',namePs:'د زده کړو فرصتونه'}});
  try {
    const stored = await db.category.findUnique({where:{id:category.id}});
    assert.equal(stored.nameFa,'فرصت‌های آموزشی');
    assert.equal(stored.namePs,'د زده کړو فرصتونه');
    const response = await request(app).get('/api/categories').set('X-KaarYab-Language','ps-AF').expect(200);
    assert.equal(response.body.data.find(row=>row.id===category.id).namePs,stored.namePs);
  } finally { await db.category.delete({where:{id:category.id}}); }
});
test('validation, duplicate emails, wrong login, CSRF and user/admin boundaries', async () => {
  await write(stranger, 'post', '/auth/register', { name: 'Bad', email: 'bad@example.test', password: 'short' }).expect(400);
  await write(stranger, 'post', '/auth/register', { name: 'Bad', email: 'bad@example.test', password, role: 'ADMIN' }).expect(400);
  await write(stranger, 'post', '/auth/register', { name: 'Duplicate', email: 'user@example.test', password }).expect(409);
  await write(stranger, 'post', '/auth/login', { email: 'user@example.test', password: 'incorrect' }).expect(401);
  await request(app).post('/api/auth/logout').expect(403);
  await user.post('/api/auth/logout').set('X-KaarYab-Request', '1').set('Origin', 'https://evil.example').expect(403);
  await request(app).get('/api/admin/users').expect(401);
  for (const path of ['/admin/users', '/admin/applications', '/admin/stats', '/admin/messages', '/admin/opportunities']) await user.get(`/api${path}`).expect(403);
  await write(user, 'post', '/admin/opportunities', fixture).expect(403);
  await write(user, 'patch', '/auth/profile', { role: 'ADMIN' }).expect(400);
});
test('admin creates, reads, searches, filters, paginates, updates and publishes opportunities', async () => {
  await write(admin, 'post', '/auth/login', { email: 'admin@example.test', password }).expect(200);
  const result = await write(admin, 'post', '/admin/opportunities', fixture).expect(201); opportunityId = result.body.data.id;
  await request(app).get(`/api/opportunities/${opportunityId}`).expect(200);
  const search = await request(app).get('/api/opportunities?search=software&category=Job&type=Remote&location=kabul&limit=1&sort=deadline&expired=false').expect(200);
  assert.equal(search.body.pagination.total, 1); assert.equal(search.body.data[0].category, 'Job');
  assert.equal((await request(app).get('/api/opportunities?search=notfound')).body.data.length, 0);
  await request(app).get('/api/opportunities?page=-1').expect(400);
  await write(admin, 'post', '/admin/opportunities', { ...fixture, applyLink: 'javascript:alert(1)' }).expect(400);
  await write(admin, 'post', '/admin/opportunities', { ...fixture, deadline: '2099-02-30' }).expect(400);
  await write(admin, 'put', `/admin/opportunities/${opportunityId}`, { ...fixture, title: 'Updated Developer' }).expect(200);
  await write(admin, 'patch', `/admin/opportunities/${opportunityId}/status`, { status: 'DRAFT' }).expect(200);
  await request(app).get(`/api/opportunities/${opportunityId}`).expect(404);
  assert.equal((await request(app).get('/api/opportunities?status=DRAFT')).body.data.length, 0);
  await write(admin, 'patch', `/admin/opportunities/${opportunityId}/status`, { status: 'PUBLISHED' }).expect(200);
});
test('bookmarks are private, idempotent, importable and removable', async () => {
  await write(user, 'put', `/saved/${opportunityId}`).expect(200);
  await write(user, 'put', `/saved/${opportunityId}`).expect(200);
  assert.equal((await user.get('/api/saved')).body.data.length, 1);
  await request(app).get('/api/saved').expect(401);
  assert.equal((await admin.get('/api/saved')).body.data.length, 0);
  const imported = await write(user, 'post', '/saved/import', { ids: [opportunityId, 'missing'] }).expect(200);
  assert.deepEqual(imported.body.unmatched, ['missing']);
  await write(user, 'delete', `/saved/${opportunityId}`).expect(204);
  assert.equal((await user.get('/api/saved')).body.data.length, 0);
});
test('applications enforce ownership, duplicates, deadlines, status and retained history', async () => {
  const body = { opportunityId, coverLetter: 'I would like to apply for this position.' };
  const result = await write(user, 'post', '/applications', body).expect(201); applicationId = result.body.data.id;
  await write(user, 'post', '/applications', body).expect(409);
  assert.equal((await user.get('/api/applications')).body.data[0].id, applicationId);
  assert.equal((await admin.get('/api/applications')).body.data.length, 0);
  await write(user, 'patch', `/admin/applications/${applicationId}`, { status: 'ACCEPTED' }).expect(403);
  await write(admin, 'patch', `/admin/applications/${applicationId}`, { status: 'REVIEWING' }).expect(200);
  assert.equal((await user.get('/api/applications')).body.data[0].status, 'REVIEWING');
  await write(admin, 'delete', `/admin/opportunities/${opportunityId}`).expect(409);
  const expired = await write(admin, 'post', '/admin/opportunities', { ...fixture, deadline: '2000-01-01' }).expect(201);
  await write(user, 'post', '/applications', { ...body, opportunityId: expired.body.data.id }).expect(409);
  await write(admin, 'delete', `/admin/opportunities/${expired.body.data.id}`).expect(204);
});
test('categories, messages, stats, safe additive legacy import and constraints', async () => {
  const category = await write(admin, 'post', '/admin/categories', { name: 'Training' }).expect(201);
  await write(admin, 'patch', `/admin/categories/${category.body.data.id}`, { name: 'Training program' }).expect(200);
  await write(admin, 'delete', `/admin/categories/${category.body.data.id}`).expect(204);
  const job = await db.category.findUnique({ where: { name: 'Job' } });
  await write(admin, 'delete', `/admin/categories/${job.id}`).expect(409);
  await write(stranger, 'post', '/contact', { name: 'Visitor', email: 'visitor@example.test', message: 'Please send more information.' }).expect(201);
  const messages = await admin.get('/api/admin/messages').expect(200);
  await write(admin, 'patch', `/admin/messages/${messages.body.data[0].id}`, { read: true }).expect(200);
  assert.equal((await admin.get('/api/admin/stats')).body.data.applications, 1);
  const input = { items: [{ ...fixture, id: opportunityId }, { title: 'Invalid' }] };
  const imported = await write(admin, 'post', '/admin/import', input).expect(200);
  assert.ok(imported.body.data[1].error); assert.notEqual(imported.body.data[0].id, opportunityId);
  const again = await write(admin, 'post', '/admin/import', input).expect(200);
  assert.equal(again.body.data[0].id, imported.body.data[0].id);
  assert.equal((await request(app).get(`/api/opportunities/${opportunityId}`)).body.data.title, 'Updated Developer');
  await write(user, 'post', '/admin/import', input).expect(403);
});
test('profile changes, password changes and logout revoke existing JWT sessions', async () => {
  await write(user, 'patch', '/auth/profile', { name: 'Updated Name' }).expect(200);
  assert.equal((await user.get('/api/auth/me')).body.user.name, 'Updated Name');
  const second = request.agent(app);
  const login = await write(second, 'post', '/auth/login', { email: 'user@example.test', password }).expect(200);
  const stolenCookie = login.headers['set-cookie'][0].split(';')[0];
  await write(user, 'post', '/auth/change-password', { currentPassword: 'bad', password: `${password}-new` }).expect(400);
  await write(user, 'post', '/auth/change-password', { currentPassword: password, password: `${password}-new` }).expect(200);
  await request(app).get('/api/saved').set('Cookie', stolenCookie).expect(401);
  await write(user, 'post', '/auth/login', { email: 'user@example.test', password }).expect(401);
  const newLogin = await write(user, 'post', '/auth/login', { email: 'user@example.test', password: `${password}-new` }).expect(200);
  const cookie = newLogin.headers['set-cookie'][0].split(';')[0];
  await write(user, 'post', '/auth/logout').expect(200);
  await request(app).get('/api/saved').set('Cookie', cookie).expect(401);
});
test('reset tokens are hashed, expire, work once and revoke sessions; no SMTP leaks', async () => {
  const missing = await write(stranger, 'post', '/auth/forgot-password', { email: 'nobody@example.test' }).expect(200);
  const existing = await write(stranger, 'post', '/auth/forgot-password', { email: 'user@example.test' }).expect(200);
  assert.deepEqual(existing.body, missing.body); assert.equal(await db.passwordReset.count(), 0);
  const token = randomBytes(32).toString('hex');
  await db.passwordReset.create({ data: { userId, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 60000) } });
  await write(stranger, 'post', '/auth/reset-password', { token: '0'.repeat(64), password }).expect(400);
  await write(stranger, 'post', '/auth/reset-password', { token, password }).expect(200);
  await write(stranger, 'post', '/auth/reset-password', { token, password }).expect(400);
  await write(user, 'post', '/auth/login', { email: 'user@example.test', password }).expect(200);
  const expired = randomBytes(32).toString('hex');
  await db.passwordReset.create({ data: { userId, tokenHash: createHash('sha256').update(expired).digest('hex'), expiresAt: new Date(0) } });
  await write(stranger, 'post', '/auth/reset-password', { token: expired, password }).expect(400);
});
test('admin user management revokes access; self-demotion is blocked', async () => {
  const me = (await admin.get('/api/auth/me')).body.user;
  await write(admin, 'patch', `/admin/users/${me.id}`, { role: 'USER' }).expect(409);
  await write(admin, 'patch', `/admin/users/${userId}`, { active: false }).expect(200);
  await user.get('/api/saved').expect(401);
  await write(user, 'post', '/auth/login', { email: 'user@example.test', password }).expect(401);
  await write(admin, 'patch', `/admin/users/${userId}`, { active: true }).expect(200);
});
test('invalid JSON, unknown routes and authentication rate limits are safe', async () => {
  await request(app).post('/api/contact').set('X-KaarYab-Request', '1').set('Content-Type', 'application/json').send('{').expect(400);
  await request(app).get('/api/missing').expect(404);
  let rateLimited = false;
  for (let i = 0; i < 35; i++) { const res = await write(stranger, 'post', '/auth/login', {}); if (res.status === 429) { rateLimited = true; break; } }
  assert.ok(rateLimited);
});
