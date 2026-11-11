import { createApp } from './app.js';
import { db } from './config/db.js';
import { env } from './config/env.js';
await db.$connect();
const server = createApp().listen(env.PORT, env.HOST, () => console.log(`KaarYab API listening on http://${env.HOST}:${env.PORT}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(async () => { await db.$disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
});
