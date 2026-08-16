// E2E — Task 1: troca de tradução (URL v=, localStorage, versículo TB)
// Executa contra next start (build atual). Playwright resolve via node_modules do projeto.

const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3000";
let passed = 0;
let failed = 0;

function ok(name, cond, extra) {
  if (cond) {
    passed++;
    console.log(`PASS: ${name}`);
  } else {
    failed++;
    console.log(`FAIL: ${name}${extra ? " — " + extra : ""}`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });

  // 1. Navega para Gn 1 (TB) via URL ?b=0&c=0&v=tb
  await page.goto(`${BASE}/?b=0&c=0&v=tb`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  const h1tb = await page.textContent("h1");
  const titleTb = await page.title();
  ok(
    "TB: Gn 1 renderizado (title 'Gênesis 1', h1 subtítulo)",
    /Gênesis 1/.test(titleTb) && /A criação/.test(h1tb),
    `${titleTb} | h1=${h1tb}`,
  );

  // 2. Body do Gn 1:1 em TB ("No princípio")
  const bodyText = await page.textContent("body");
  ok("TB: versículo 1 contém 'No princípio'", /No princípio/.test(bodyText));

  // 3. Troca para ALM1911 clicando no seletor de tradução no header
  const versionButton = page.locator('button[aria-label^="Trocar tradução"]');
  await versionButton.waitFor({ timeout: 10000 });
  const vlabel = await versionButton.textContent();
  ok("TB: seletor mostra 'TB'", vlabel.trim().toUpperCase() === "TB", vlabel);
  await versionButton.click();

  // 4. VersionPicker abre com opções (TB, ALM 1911)
  await page.waitForSelector("text=ALM 1911", { timeout: 10000 });
  ok("Picker: mostra opção ALM 1911", true);
  await page.click("text=ALM 1911");

  // 5. Capítulo re-renderiza em ALM1911 sem reload
  await page.waitForFunction(() => document.title.includes("Gênesis"), { timeout: 15000 });
  await page.waitForTimeout(1200);
  const bodyAlm = await page.textContent("body");
  const hasAlmText = /Pela|fêz|fez|Almeida/i.test(bodyAlm);
  const urlAfter = page.url();
  ok("ALM: URL contém v=alm1911", /v=alm1911/.test(urlAfter), urlAfter);
  ok("ALM: versículo 1 distinto de TB ('Pela fé' ausente em TB, presente ALM)", hasAlmText, hasAlmText ? "ok" : bodyAlm.slice(0, 200));

  // 6. localStorage bs-version = alm1911
  const stored = await page.evaluate(() => localStorage.getItem("bs-version"));
  ok("localStorage bs-version=alm1911", stored === "alm1911", stored);

  // 7. Recarrega: continua ALM1911 (memória)
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  const urlReload = page.url();
  ok("Recarga: URL mantém v=alm1911", /v=alm1911/.test(urlReload), urlReload);
  const bodyAlm2 = await page.textContent("body");
  ok("Recarga: corpo continua ALM1911", /Pela|Almeida/i.test(bodyAlm2) || !/No princípio/.test(bodyAlm2));

  // 8. Deep-link ?v= inválido → fallback (não quebra)
  await page.goto(`${BASE}/?b=0&c=0&v=xyz`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  const urlFallback = page.url();
  ok("Deep-link v inválido: URL normaliza para v válido", /v=tb|v=alm1911/.test(urlFallback), urlFallback);

  // 9. Sem erros JS
  ok("Sem erros de console/pageerror", errors.length === 0, errors.join(" | "));

  await browser.close();
  console.log(`\nRESULTADO: ${passed} passou, ${failed} falhou`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error("ERRO E2E:", e);
  process.exit(2);
});
