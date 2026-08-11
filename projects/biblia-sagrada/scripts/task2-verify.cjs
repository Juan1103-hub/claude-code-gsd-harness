// Task 2 verify: version-picker mostra 3 traduções
process.env.NODE_PATH = "C:\\Users\\VCM37\\AppData\\Roaming\\npm\\node_modules";
require("module").Module._initPaths();
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/?b=0&c=0&v=tb", { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  await page.click('button[aria-label^="Trocar tradução"]');
  await page.waitForTimeout(800);
  const blivreCount = await page.locator("text=BLIVRE").count();
  const almCount = await page.locator("text=ALM 1911").count();
  const tbCount = await page.locator("text=TB").count();
  console.log("TB:", tbCount > 0, "| ALM 1911:", almCount > 0, "| BLIVRE:", blivreCount > 0);
  const allThree = tbCount > 0 && almCount > 0 && blivreCount > 0;
  console.log(allThree ? "PASS: picker mostra 3 traduções" : "FAIL: picker incompleto");
  await browser.close();
  process.exit(allThree ? 0 : 1);
})().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(2);
});
