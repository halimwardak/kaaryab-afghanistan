const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const strings = new Set();
for (const folder of ['app', 'components', 'context']) {
  function walk(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir,entry.name);
    if(entry.isDirectory()) walk(file);
    else if(/\.[jt]sx?$/.test(file)) {
      const ast = parser.parse(fs.readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']});
      traverse(ast,{
        JSXText(p) { const value=p.node.value.replace(/\s+/g,' ').trim(); if(/[a-z]/i.test(value)) strings.add(value); },
        StringLiteral(p) {
          const value=p.node.value;
          if(p.parent.type==='JSXAttribute' && !['placeholder','title','alt','aria-label'].includes(p.parent.name.name)) return;
          if(!/[A-Z]|\s/.test(value) || /^(https?:|\/|\.\.?\/|@|bg-|text-|w-|p-|max-|flex|grid|inline|space-|px-|block|border|relative|absolute|hidden|h-|mt-|md:|font-)/.test(value)) return;
          if(value.length>1 && !/className|^\^/.test(value)) strings.add(value);
        }
      });
    }
  }} walk(folder);
}
fs.mkdirSync('locales',{recursive:true});
fs.writeFileSync('locales/inventory.json',JSON.stringify([...strings].sort(),null,2));
console.log([...strings].sort().join('\n'));
