// Inspeciona o SQLite do app Bíblia Sagrada NTLH (APK baixado pelo usuário)
// Uso: node scripts/inspect-ntlh-db.mjs <caminho-do-sqlite> [--deep]
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Uso: node scripts/inspect-ntlh-db.mjs <caminho-do-sqlite>');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('tabelas:', tables.map((t) => t.name).join(', '));

for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info('${t.name}')`).all().map((c) => c.name);
  const count = db.prepare(`SELECT COUNT(*) c FROM ${t.name}`).get().c;
  console.log(`${t.name} (${count} rows): ${cols.join(', ')}`);
}

// Metadata completa
console.log('\n=== metadata ===');
for (const row of db.prepare('SELECT * FROM metadata').all()) {
  console.log(JSON.stringify(row).slice(0, 200));
}

// Amostra de uma passagem conhecida (Is 61) se houver dados
try {
  const isa = db.prepare("SELECT id FROM book WHERE name LIKE '%Isaías%'").get();
  if (isa) {
    const ch61 = db
      .prepare('SELECT chapter, verse, text FROM verse WHERE book_id = ? AND chapter = 61 ORDER BY verse LIMIT 3')
      .all(isa.id);
    console.log('\n=== Is 61 (primeiros versos) ===');
    for (const v of ch61) console.log(`${v.chapter}:${v.verse} ${String(v.text).slice(0, 90)}`);
  }
} catch (e) {
  console.log('erro na amostra:', e.message);
}

// Procura texto de título de seção no meio dos versículos (padrão: texto em caixa alta ou entre travessões)
console.log('\n=== procura possíveis títulos (caixa alta) em Is 40-66 ===');
try {
  const rows = db
    .prepare(
      "SELECT v.chapter, v.verse, v.text FROM verse v JOIN book b ON b.id = v.book_id WHERE b.name LIKE '%Isaías%' AND v.chapter BETWEEN 40 AND 66 AND v.text = upper(v.text) AND length(v.text) > 10 LIMIT 20"
    )
    .all();
  for (const v of rows) console.log(`Is ${v.chapter}:${v.verse} ${String(v.text).slice(0, 100)}`);
} catch (e) {
  console.log('erro:', e.message);
}

db.close();
