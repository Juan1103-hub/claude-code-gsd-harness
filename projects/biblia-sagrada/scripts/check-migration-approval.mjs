// Check retido: migrations que tocam a superfície compartilhada do Supabase
// (objetos usados por outro app — vendas/PDV) precisam de um marcador explícito
// de aprovação no cabeçalho E de um registro na ledger docs/DECISIONS.md
// (seção do gate + menção do arquivo), antes de aplicar.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "supabase", "migrations");
const DECISIONS_FILE = path.resolve(__dirname, "..", "docs", "DECISIONS.md");

// Superfície compartilhada — heurística conservadora (falsa negativa possível
// em `alter table users` sem prefixo/quoted identifiers; falsa positiva se um
// comentário apenas citar a palavra "compartilh"). Direção conservadora: a
// falha pede confirmação humana, nunca ignora o arquivo.
const SHARED_SURFACE = /public\.users|handle_new_user|compartilh/i;
const APPROVAL_MARKER = /^--\s*APPROVAL:/m;
const GATE_HEADING = /Gate de aprovação para migrations de superfície compartilhada/i;

let failed = 0;

const decisions = existsSync(DECISIONS_FILE) ? readFileSync(DECISIONS_FILE, "utf8") : "";
const ledgerReady = GATE_HEADING.test(decisions);

for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
  const content = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  const touchesShared = SHARED_SURFACE.test(content);
  const hasApproval = APPROVAL_MARKER.test(content);
  const hasLedger = decisions.includes(file);
  if (touchesShared) {
    if (!hasApproval || !ledgerReady || !hasLedger) {
      failed++;
      console.log(
        `FAIL: ${file} toca superfície compartilhada — marcador APPROVAL ${hasApproval ? "presente" : "ausente"}, ledger ${ledgerReady && hasLedger ? "presente" : "ausente/incompleta"}`,
      );
    } else {
      console.log(`PASS: ${file} (compartilhada — aprovação + ledger OK)`);
    }
  } else {
    console.log(`PASS: ${file}`);
  }
}

console.log(`\nRESULTADO: migrations ${failed === 0 ? "OK" : `${failed} sem aprovação`}`);
process.exit(failed > 0 ? 1 : 0);
