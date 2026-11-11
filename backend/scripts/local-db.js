import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { ensureUtf8, quoteIdentifier, runCommand } from './utf8-database.js';
import EmbeddedPostgres from 'embedded-postgres';
import dotenv from 'dotenv';

// Development helper only: a real PostgreSQL server, isolated to this project.
const envFile = resolve('.env');
if (!existsSync(envFile)) {
  const password = randomBytes(24).toString('hex');
  writeFileSync(envFile, `NODE_ENV=development\nHOST=127.0.0.1\nPORT=4000\nDATABASE_URL=postgresql://kaaryab:${password}@127.0.0.1:55432/kaaryab\nJWT_SECRET=${randomBytes(48).toString('hex')}\nFRONTEND_URL=http://localhost:3000\nTRUST_PROXY=0\n`, { flag: 'wx', mode: 0o600 });
}
const config = dotenv.parse(readFileSync(envFile));
const url = new URL(config.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.port !== '55432' || !/^\/kaaryab(?:_utf8_\d+)?$/.test(url.pathname)) throw new Error('db:local only manages project-local databases on 127.0.0.1:55432. Use your configured PostgreSQL server instead.');
const databaseDir = resolve('.postgres');
// The bundled stop() force-kills Windows processes and can miss their exit event.
// pg_ctl performs a graceful, bounded shutdown of this exact persistent cluster.
class LocalPostgres extends EmbeddedPostgres {
  async stop() {
    if (!this.process) return;
    if (this.process.exitCode !== null || this.process.signalCode !== null) { this.process = undefined; return; }
    const {default:getBinaries} = await import(new URL('./binary.js', import.meta.resolve('embedded-postgres')));
    const {pg_ctl} = await getBinaries();
    await runCommand(pg_ctl, ['stop','-D',databaseDir,'-m','fast','-w','-t','15']);
    this.process = undefined;
  }
}
const postgres = new LocalPostgres({ databaseDir, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), port: 55432, persistent: true, authMethod: 'scram-sha-256', initdbFlags: ['--encoding=UTF8', '--locale=C'], postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: message => console.error(String(message)) });
let keepAlive;
let stopping;
const shutdown = () => stopping ||= (async () => { clearInterval(keepAlive); await postgres.stop(); })();
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { shutdown().catch(error => { console.error(error.message); process.exitCode = 1; }); });
process.on('message', message => {
  if (message === 'shutdown') shutdown().then(() => { if (process.connected) process.disconnect(); });
});
process.on('disconnect', () => { shutdown().catch(error => { console.error(error.message); process.exitCode = 1; }); });
try {
if (!existsSync(resolve(databaseDir, 'PG_VERSION'))) await postgres.initialise();
await postgres.start();
const client = postgres.getPgClient('postgres', '127.0.0.1');
try {
  await client.connect();
  const database = decodeURIComponent(url.pathname.slice(1));
  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
  if (!existing.rowCount) await client.query(`CREATE DATABASE ${quoteIdentifier(database)} TEMPLATE template0 ENCODING 'UTF8' LOCALE_PROVIDER libc LC_COLLATE 'C' LC_CTYPE 'C'`);
} finally { await client.end(); }
await ensureUtf8(postgres, config, envFile);
const run = args => runCommand(process.execPath, args, { ...process.env, ...config });
await run(['node_modules/prisma/build/index.js', 'generate']);
await run(['node_modules/prisma/build/index.js', 'migrate', 'deploy']);
await run(['prisma/seed.js']);
if (process.argv.includes('--check')) {
  await shutdown();
  console.log('Local database setup and graceful shutdown verified.');
} else {
  console.log(process.send ? 'Local PostgreSQL is ready on 127.0.0.1:55432.' : 'Local PostgreSQL is ready on 127.0.0.1:55432. Keep this terminal running; start the API in another terminal.');
  keepAlive = setInterval(() => {}, 60000);
  process.send?.({ type: 'ready' });
}
} catch (error) {
  console.error(`Database setup failed: ${error.message}`);
  process.exitCode = 1;
  await shutdown();
  if (process.connected) process.disconnect();
}
