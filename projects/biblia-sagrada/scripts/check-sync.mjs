/**
 * Verifica se a infraestrutura Supabase está pronta para o sync (Fase 3):
 * 1. Auth anônimo habilitado (Authentication > Sign In / Providers > Anonymous)
 * 2. Tabelas study_records + plan_progress criadas (SQL Editor)
 *
 * Uso: node scripts/check-sync.mjs
 * Lê NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY do .env.local.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env.local");

function readEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/i);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

async function main() {
  const env = readEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("=== Check infra Supabase (sync Fase 3) ===\n");
  if (!url || !anon) {
    console.log("❌ .env.local ausente ou incompleto. Crie com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    process.exit(1);
  }
  console.log(`URL: ${url}`);

  // 1) Auth anônimo
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: "{}",
    });
    const body = await res.text();
    if (body.includes("anonymous_provider_disabled")) {
      console.log("❌ [1/2] Auth anônimo DESABILITADO.");
      console.log("   → Dashboard > Authentication > Sign In / Providers > Anonymous > Enable");
    } else if (res.ok || body.includes("access_token") || body.includes("session")) {
      console.log("✅ [1/2] Auth anônimo habilitado.");
    } else {
      console.log(`❓ [1/2] Resposta inesperada (${res.status}):`, body.slice(0, 120));
    }
  } catch (e) {
    console.log("❌ [1/2] Falha de rede ao testar auth:", e.message);
  }

  // 2) Tabelas (cada uma com uma coluna que existe de fato)
  for (const [table, col] of [
    ["study_records", "id"],
    ["plan_progress", "plan_id"],
  ]) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=${col}&limit=1`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      });
      if (res.status === 200) {
        console.log(`✅ [2/2] Tabela ${table} existe.`);
      } else if (res.status === 404) {
        console.log(`❌ [2/2] Tabela ${table} NÃO existe.`);
        console.log("   → Dashboard > SQL Editor > colar supabase/migrations/0001_sync_tables.sql > Run");
      } else if (res.status === 401 || res.status === 403) {
        console.log(`❓ [2/2] Tabela ${table}: acesso negado (${res.status}) — pode existir mas sem RLS correto.`);
      } else {
        console.log(`❓ [2/2] Tabela ${table}: HTTP ${res.status}.`);
      }
    } catch (e) {
      console.log(`❌ [2/2] Falha de rede ao testar ${table}:`, e.message);
    }
  }

  console.log("\nRode este script novamente após configurar o dashboard.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
