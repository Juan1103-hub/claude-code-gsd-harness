import { readFileSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');

// Mostra o trecho entre o h2 do capítulo e o fim dos versículos
const h2 = html.indexOf('Gênesis');
console.log('=== trecho após o título do capítulo (primeiros 3000 chars) ===');
const start = html.indexOf('<div class="p-6 md:p-8">');
console.log(html.slice(start, start + 3000));
