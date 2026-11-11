const {spawn,fork} = require('node:child_process');
const {existsSync,readFileSync} = require('node:fs');
const {resolve} = require('node:path');
const {createRequire} = require('node:module');
const net = require('node:net');
const root = resolve(__dirname,'..');
const backend = resolve(root,'backend');
const requireBackend = createRequire(resolve(backend,'package.json'));
const children = [];
let databaseProcess;
let closing = false;
let failure;
const pause = ms => new Promise(done=>setTimeout(done,ms));
const portOpen = (port,host='127.0.0.1') => new Promise(done=>{
  const socket=net.createConnection({host,port});
  const finish=value=>{socket.destroy();done(value);};
  socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(1500,()=>finish(false));
});
function start(label,file,args,cwd,env) {
  console.log(`[dev] Starting ${label}...`);
  const child=spawn(process.execPath,[file,...args],{cwd,env,stdio:'inherit',windowsHide:true});
  children.push(child);
  child.once('error',error=>{failure=error; shutdown(1);});
  child.once('exit',(code,signal)=>{if(!closing){failure=new Error(`${label} stopped (${signal||code}).`);shutdown(1);}});
  return child;
}
async function waitReady(url) {
  for(let attempt=0;attempt<120;attempt++) {
    if(closing||failure) throw failure||new Error('Startup cancelled.');
    try { const response=await fetch(url,{signal:AbortSignal.timeout(1500)});if(response.ok)return; }catch{}
    await pause(500);
  }
  throw new Error(`Service did not become ready: ${url}`);
}
async function stopChild(child) {
  if(!child.pid||child.exitCode!==null||child.signalCode!==null)return;
  if(process.platform==='win32') {
    await new Promise(done=>{const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.once('error',done);killer.once('exit',done);});
  } else {
    child.kill('SIGTERM');
    for(let i=0;i<50&&child.exitCode===null&&child.signalCode===null;i++)await pause(100);
    if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
  }
}
async function shutdown(code=0) {
  if(closing)return;
  closing=true;
  if(failure)console.error(`[dev] ${failure.message}`);
  console.log('[dev] Stopping services started by this command...');
  for(const child of [...children].reverse())await stopChild(child);
  if(databaseProcess?.connected) {
    databaseProcess.send('shutdown');
    await Promise.race([new Promise(done=>databaseProcess.once('exit',done)),pause(20000)]);
    if(databaseProcess.exitCode===null&&databaseProcess.signalCode===null) {
      console.error('[dev] Database shutdown did not finish. Its files have been retained.');
      process.exitCode=1;
      databaseProcess.unref();databaseProcess.channel?.unref();
    }
  }
  process.exitCode=process.exitCode||code;
}
process.on('SIGINT',()=>shutdown());process.on('SIGTERM',()=>shutdown());
process.on('message',message=>{if(message==='shutdown')shutdown().then(()=>{if(process.connected)process.disconnect();});});
async function main() {
  if(!existsSync(resolve(backend,'node_modules/prisma/build/index.js')))throw new Error('Run npm --prefix backend install once, then npm run dev again.');
  const dotenv=requireBackend('dotenv');
  const envFile=resolve(backend,'.env');
  let config=existsSync(envFile)?dotenv.parse(readFileSync(envFile)):{};
  const frontendPort=Number(process.env.KAARYAB_DEV_PORT||3000);
  const apiPort=Number(process.env.KAARYAB_API_PORT||config.PORT||4000);
  if(![frontendPort,apiPort].every(port=>Number.isInteger(port)&&port>0&&port<65536)||frontendPort===apiPort)throw new Error('Choose two different valid frontend and backend ports.');
  for(const port of [frontendPort,apiPort])if(await portOpen(port))throw new Error(`Port ${port} is already in use. Stop the old frontend/backend terminal with Ctrl+C, then run npm run dev again.`);
  const url=config.DATABASE_URL?new URL(config.DATABASE_URL):null;
  const local=!url||(url.hostname==='127.0.0.1'&&url.port==='55432'&&/^\/kaaryab(?:_utf8_\d+)?$/.test(url.pathname));
  if(local && !(await portOpen(55432))) {
    console.log('[dev] Preparing local PostgreSQL (first startup can take a minute)...');
    databaseProcess=fork(resolve(backend,'scripts/local-db.js'),[],{cwd:backend,stdio:['inherit','inherit','inherit','ipc'],windowsHide:true});
    await new Promise((done,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Database setup timed out. Review the database output above.')),180000);
      databaseProcess.on('message',message=>{if(message?.type==='ready'){clearTimeout(timer);done();}});
      databaseProcess.once('error',error=>{clearTimeout(timer);reject(error);});
      databaseProcess.once('exit',code=>{clearTimeout(timer);if(!closing){failure=new Error(`Database stopped (${code}).`);reject(failure);shutdown(1);}});
    });
    config=dotenv.parse(readFileSync(envFile));
  } else {
    if(!url)throw new Error('Port 55432 is occupied but backend/.env is missing. Stop the existing database process first.');
    const {Client}=requireBackend('pg');
    const client=new Client({connectionString:config.DATABASE_URL,connectionTimeoutMillis:5000});
    try{await client.connect();const result=await client.query('SHOW server_encoding');if(result.rows[0].server_encoding!=='UTF8')throw new Error('Run npm --prefix backend run db:local to upgrade the local database to UTF-8 first.');}finally{await client.end();}
    console.log('[dev] Using the configured running database; it will remain running when this command stops.');
    for(const args of [['node_modules/prisma/build/index.js','generate'],['node_modules/prisma/build/index.js','migrate','deploy'],['prisma/seed.js']]) {
      await new Promise((done,reject)=>{const child=spawn(process.execPath,args,{cwd:backend,env:{...process.env,...config},stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',code=>code===0?done():reject(new Error(`Database preparation failed: ${args.join(' ')}`)));});
    }
  }
  if(closing)return;
  const apiEnv={...process.env,...config,HOST:'127.0.0.1',PORT:String(apiPort),FRONTEND_URL:`http://localhost:${frontendPort}`,NODE_ENV:'development'};
  start('backend','--watch',['src/server.js'],backend,apiEnv);
  await waitReady(`http://127.0.0.1:${apiPort}/api/health`);
  start('frontend',resolve(root,'node_modules/next/dist/bin/next'),['dev','--port',String(frontendPort)],root,{...process.env,BACKEND_URL:`http://127.0.0.1:${apiPort}`,NEXT_PUBLIC_API_URL:'/api'});
  await waitReady(`http://127.0.0.1:${frontendPort}/api/health`);
  console.log(`\n[dev] KaarYab is ready: http://localhost:${frontendPort}\n[dev] Keep this one terminal open. Press Ctrl+C to stop.\n`);
  process.send?.({type:'ready',frontendPort,apiPort});
}
main().catch(error=>{failure=error;shutdown(1);});
