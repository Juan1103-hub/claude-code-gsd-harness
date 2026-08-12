// Extrai e mostra a estrutura do payload de capítulo do bibliajfa
// Uso: node scripts/parse-jfa-chapter.mjs <payload.txt>
import { readFileSync } from 'node:fs';

const full = readFileSync(process.argv[2], 'utf8');

// Procura o array de versículos (initialVerses ou verses) — mostra o trecho ao redor de bookName
const idx = full.indexOf('"initialVerses"');
console.log('initialVerses idx:', idx);
if (idx > -1) {
  // Tenta achar o JSON do capítulo inteiro
  // Procura por "verses" também
  for (const kw of ['initialVerses', '"verses"', 'totalVerses', 'nextChapter']) {
    const i = full.indexOf(kw);
    console.log(`\n${kw}: idx=${i}`);
    if (i > -1) console.log(full.slice(Math.max(0, i - 100), i + 300));
  }
}
