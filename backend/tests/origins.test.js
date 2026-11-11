import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { buildTrustedOrigins } from '../src/config/origins.js';

test('configuration accepts exact origins and rejects unsafe entries', () => {
  assert.deepEqual([...buildTrustedOrigins('https://site.example/', ' https://preview.example:443 ', true)], ['https://site.example', 'https://preview.example']);
  for (const value of ['*', 'null', 'https://*.vercel.app', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?q=1', 'https://example.com#hash', 'ftp://example.com', 'http://example.com']) {
    assert.throws(() => buildTrustedOrigins('https://site.example', value, true));
  }
  assert.ok(buildTrustedOrigins('http://localhost:3000').has('http://localhost:3000'));
});

test('CORS and Login/Register writes share the exact allowlist', async () => {
  process.env.NODE_ENV = 'production';
  process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused';
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  process.env.FRONTEND_URL = 'https://site.example';
  process.env.TRUSTED_ORIGINS = 'https://preview.example,https://alias.example';
  const { default: app } = await import('../src/app.js');
  for (const origin of ['https://site.example', 'https://preview.example', 'https://alias.example']) {
    const preflight = await request(app).options('/api/auth/login').set('Origin', origin).set('Access-Control-Request-Method', 'POST');
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers['access-control-allow-origin'], origin);
    assert.equal(preflight.headers['access-control-allow-credentials'], 'true');
    for (const action of ['login', 'register']) {
      // Validation rejects empty input before any database operation.
      const response = await request(app).post(`/api/auth/${action}`).set('Origin', origin).set('X-KaarYab-Request', '1').send({});
      assert.equal(response.status, 400);
    }
  }
  for (const origin of ['https://evil.example', 'https://site.example.evil.test', 'http://site.example', 'null', 'https://unreviewed.vercel.app']) {
    const response = await request(app).post('/api/auth/login').set('Origin', origin).set('Host', 'site.example').set('X-Forwarded-Host', 'site.example').set('X-KaarYab-Request', '1').send({});
    assert.equal(response.status, 403);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  }
  assert.equal((await request(app).post('/api/auth/login').set('Origin', 'https://site.example').send({})).status, 403);
  assert.equal((await request(app).post('/api/auth/login').set('X-KaarYab-Request', '1').send({})).status, 400);
});
