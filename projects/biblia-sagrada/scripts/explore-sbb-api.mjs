// Explora a API da SBB (api.ibep-prod.com) para extrair títulos de seção da NTLH
// Uso: node scripts/explore-sbb-api.mjs
const BASE = 'https://api.ibep-prod.com';
const BIBLE_ID = 'acef2bc597c450a1-01';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function get(path, extraHeaders = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'User-Agent': UA, Accept: 'application/json', ...extraHeaders },
  });
  const text = await res.text();
  console.log(`${res.status} GET ${path} (${text.length}B)`);
  return { status: res.status, text, headers: res.headers };
}

// 1. metadata (público?)
const meta = await get(`/bibles/${BIBLE_ID}/metadata`);
console.log('metadata:', meta.text.slice(0, 400));

// 2. capítulo com estudo (precisa auth?)
const ch = await get(`/bibles/${BIBLE_ID}/chapters/ISA.61/with-study-content`);
console.log('chapter:', ch.text.slice(0, 400));
