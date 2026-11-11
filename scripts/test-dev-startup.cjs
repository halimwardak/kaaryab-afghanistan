// Integration smoke test: run only when ports 3000 and 4000 are free.
const {fork} = require('node:child_process');
const assert = require('node:assert/strict');
const {resolve} = require('node:path');
const root=resolve(__dirname,'..');
const child=fork(resolve(__dirname,'dev.cjs'),[],{cwd:root,stdio:['ignore','inherit','inherit','ipc']});
const exited=new Promise(done=>child.once('exit',done));
async function main(){
  let timer;
  try {
    await new Promise((done,reject)=>{
      timer=setTimeout(()=>reject(new Error('Startup timeout')),180000);
      child.on('message',message=>{if(message.type==='ready')done();});
      child.once('exit',code=>reject(new Error(`Launcher exited before readiness: ${code}`)));
    });
    clearTimeout(timer);
    for(const path of ['/api/health','/api/auth/me','/api/opportunities?limit=1','/api/opportunities/stats','/account']){
      const response=await fetch(`http://localhost:3000${path}`,{signal:AbortSignal.timeout(30000)});
      assert.equal(response.status,200,path);
      console.log(`PASS ${path}`);
    }
    child.send('shutdown');
    const code=await exited;
    assert.equal(code,0,'Clean shutdown');
    for(const port of [3000,4000])await assert.rejects(fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(2000)}));
    console.log('PASS single-command startup, proxied API, account page and shutdown.');
  } finally {
    clearTimeout(timer);
    if(child.connected)child.send('shutdown');
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
