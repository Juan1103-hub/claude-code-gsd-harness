// Extrai o payload JSON do HTML do bibliajfa (Next.js __next_f.push)
// Uso: node scripts/extract-jfa-payload.mjs <arquivo-html> [arquivo-saida]
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');

// Junta todos os chunks self.__next_f.push([1,"..."])
let full = '';
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m;
while ((m = re.exec(html)) !== null) {
  full += m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

const outPath = process.argv[3];
if (outPath) writeFileSync(outPath, full);
console.log(JSON.stringify({ payloadChars: full.length }));
