const fs=require('node:fs'),path=require('node:path');
const parser=require('@babel/parser'),traverse=require('@babel/traverse').default;
(async()=>{
const {resources}=await import('../locales/catalog.mjs'); const keys=resources.en.translation;
for(const folder of ['app','components']) {
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}
 if(!/\.(jsx|js)$/.test(file)||file.endsWith('layout.js')||/LanguageSwitcher|Announcement/.test(file))continue;
 let code=fs.readFileSync(file,'utf8');
 const ast=parser.parse(code,{sourceType:'module',plugins:['jsx']});const edits=[];const funcs=new Set();
 const mark=p=>{const f=p.findParent(x=>x.isFunctionDeclaration());if(f&&/^[A-Z]/.test(f.node.id?.name))funcs.add(f.node.body.start+1);};
 traverse(ast,{
 JSXText(p){const key=p.node.value.replace(/\s+/g,' ').trim();if(!keys[key])return;edits.push([p.node.start,p.node.end,`{t(${JSON.stringify(key)})}`]);mark(p);},
 StringLiteral(p){if(!keys[p.node.value])return;const a=p.findParent(x=>x.isJSXAttribute());const container=p.findParent(x=>x.isJSXExpressionContainer());if(a&&!['placeholder','title','alt','aria-label'].includes(a.node.name.name))return;
 if(!a&&!container)return;
 if(p.parent.type==='CallExpression')return;
 if(!a && !['JSXExpressionContainer','ConditionalExpression','LogicalExpression'].includes(p.parent.type))return;
 const text=`t(${JSON.stringify(p.node.value)})`;edits.push([p.node.start,p.node.end,a&&p.parent===a.node?`{${text}}`:text]);mark(p);}
 });
 if(edits.length){for(const start of funcs)if(!code.slice(start,start+100).includes('useTranslation()'))edits.push([start,start,'\n  const { t } = useTranslation();']);
 for(const [start,end,text]of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,start)+text+code.slice(end);
 if(!code.includes('"use client"')&&!code.includes("'use client'"))code='"use client";\n'+code;
 const first=code.indexOf('\n');if(!code.includes("import { useTranslation }"))code=code.slice(0,first+1)+"import { useTranslation } from 'react-i18next';\n"+code.slice(first+1);
 fs.writeFileSync(file,code);
 }
}}walk(folder);
}
})();
