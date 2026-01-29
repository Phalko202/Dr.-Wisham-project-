const fs = require('fs');
const path = require('path');

const required = [
  'electron/main.js',
  'electron/preload.js',
  'electron/renderer/index.html',
  'src/automation/vinavi.js',
  'src/ai/draft.js',
  'config/vinavi.mapping.json'
];

let ok = true;
for (const rel of required) {
  const p = path.join(__dirname, '..', rel);
  if (!fs.existsSync(p)) {
    ok = false;
    console.error('Missing:', rel);
  }
}
if (!ok) process.exit(1);
console.log('Selfcheck OK');
