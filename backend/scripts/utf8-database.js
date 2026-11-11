import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

export const quoteIdentifier = value => '"' + value.replaceAll('"', '""') + '"';
export function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env, windowsHide: true });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${command.split(/[\\/]/).pop()} ${args[0] || ''} failed (${signal || code}). See the error above.`)));
  });
}

// Copy an old Windows-encoded database; never drop or overwrite its data.
export async function ensureUtf8(postgres, config, envFile) {
  const url = new URL(config.DATABASE_URL);
  const database = decodeURIComponent(url.pathname.slice(1));
  const source = postgres.getPgClient(database, '127.0.0.1');
  const control = postgres.getPgClient('postgres', '127.0.0.1');
  let target;
  try {
    await source.connect();
    const encoding = (await source.query('SHOW server_encoding')).rows[0].server_encoding;
    if (encoding === 'UTF8') return;
    await control.connect();
    const active = await control.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = $1 AND pid <> $2', [database, source.processID]);
    if (active.rows[0].count) throw new Error('Stop the backend and other database clients, then run db:local again to copy the database to UTF-8 safely.');
    const tables = (await source.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")).rows.map(row => row.tablename);
    // Block concurrent data changes while taking and validating the copy.
    await source.query('BEGIN');
    for (const table of tables) await source.query(`LOCK TABLE public.${quoteIdentifier(table)} IN SHARE MODE`);
    const order = ['_prisma_migrations','User','Category','Opportunity','Session','PasswordReset','OpportunityTranslation','SavedOpportunity','Application','ContactMessage'];
    if (tables.some(table => !order.includes(table))) throw new Error('Additional tables found. Use a full PostgreSQL dump/restore to convert this database; no data was changed.');
    const snapshot = {};
    for (const table of tables) snapshot[table] = (await source.query(`SELECT row_to_json(t)::text AS row FROM public.${quoteIdentifier(table)} t`)).rows.map(row => JSON.parse(row.row));
    const migrations = snapshot._prisma_migrations || [];
    if (!migrations.length || migrations.some(row => !row.finished_at || row.rolled_back_at)) throw new Error('Database has incomplete migrations. Resolve these before converting its encoding.');
    const migrationSQL = migrations.sort((a,b)=>a.migration_name.localeCompare(b.migration_name)).map(row => {
      if (!/^[a-zA-Z0-9_]+$/.test(row.migration_name)) throw new Error('Invalid migration name.');
      const sql = readFileSync(resolve('prisma/migrations',row.migration_name,'migration.sql'),'utf8');
      if (createHash('sha256').update(sql).digest('hex') !== row.checksum) throw new Error(`Migration ${row.migration_name} differs from the database history. No configuration was changed.`);
      return sql;
    });
    const name = `kaaryab_utf8_${Date.now()}`;
    const backupDir = resolve('.backups');
    mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    const dump = join(backupDir, `${name}.json`);
    console.log(`Copying ${database} (${encoding}) to ${name} (UTF8). The original database will be retained.`);
    writeFileSync(dump, JSON.stringify({sourceDatabase:database,encoding,migrationSQL,tables:snapshot},null,2), {flag:'wx',mode:0o600});
    await control.query(`CREATE DATABASE ${quoteIdentifier(name)} TEMPLATE template0 ENCODING 'UTF8' LOCALE_PROVIDER libc LC_COLLATE 'C' LC_CTYPE 'C'`);
    target = postgres.getPgClient(name, '127.0.0.1');
    await target.connect();
    await target.query('BEGIN');
    for (const sql of migrationSQL) await target.query(sql);
    await target.query('CREATE TABLE "_prisma_migrations" (id VARCHAR(36) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, finished_at TIMESTAMPTZ, migration_name VARCHAR(255) NOT NULL, logs TEXT, rolled_back_at TIMESTAMPTZ, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), applied_steps_count INTEGER NOT NULL DEFAULT 0)');
    for (const table of order.filter(table=>tables.includes(table))) {
      await target.query(`INSERT INTO public.${quoteIdentifier(table)} SELECT * FROM json_populate_recordset(NULL::public.${quoteIdentifier(table)}, $1::json)`,[JSON.stringify(snapshot[table])]);
    }
    await target.query('COMMIT');
    for (const table of tables) {
      const sql = `SELECT count(*)::text AS count FROM public.${quoteIdentifier(table)}`;
      const before = (await source.query(sql)).rows[0].count;
      const after = (await target.query(sql)).rows[0].count;
      if (before !== after) throw new Error(`Copy verification failed for ${table}. Original database and configuration were retained.`);
      const copied = (await target.query(`SELECT row_to_json(t)::text AS row FROM public.${quoteIdentifier(table)} t`)).rows.map(row=>JSON.parse(row.row));
      const canonical = rows => JSON.stringify(rows.map(row=>JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).sort());
      if (canonical(snapshot[table]) !== canonical(copied)) throw new Error(`Content verification failed for ${table}. Original database and configuration were retained.`);
      console.log(`Verified ${table}: ${after} rows.`);
    }
    const probe = 'فارسی دری — پښتو';
    if ((await target.query('SELECT $1::text AS text', [probe])).rows[0].text !== probe) throw new Error('Unicode verification failed.');
    const original = readFileSync(envFile, 'utf8');
    writeFileSync(join(backupDir, `${name}.env.backup`), original, { flag: 'wx', mode: 0o600 });
    url.pathname = `/${name}`;
    const replacement = `DATABASE_URL=${url.toString()}`;
    const next = original.replace(/^\s*DATABASE_URL\s*=.*$/m, replacement);
    if (next === original) throw new Error('Could not update DATABASE_URL. Original database was retained.');
    writeFileSync(`${envFile}.tmp`, next, { mode: 0o600 });
    renameSync(`${envFile}.tmp`, envFile);
    config.DATABASE_URL = url.toString();
    console.log('UTF-8 copy verified. backend/.env now selects the copy. Backup and previous configuration are in backend/.backups.');
  } finally {
    await source.query('ROLLBACK').catch(() => {});
    await source.end();
    await target?.end();
    await control.end();
  }
}
