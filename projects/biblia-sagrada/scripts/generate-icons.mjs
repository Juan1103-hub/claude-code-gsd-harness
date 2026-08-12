/**
 * Gera a capa/ícones do app (PWA) em public/icons/ com sharp.
 *
 * Design (alinhado ao design system em app/globals.css):
 *   - Fundo: papel escuro do tema (#211d17 --ink) com gradiente sutil
 *   - Símbolo: cruz dourada (#c9a961 --accent dark) com contorno suave
 *   - Legível em 192px; maskable com safe zone de 80% para Android adaptive
 *
 * Uso:
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "icons");

const PAPER = "#211d17";
const PAPER_DEEP = "#171410";
const ACCENT = "#c9a961";
const ACCENT_SOFT = "#e0c689";

/** SVG da cruz (comum a todas as variantes). viewBox 0 0 512 512. */
function crossSvg({ centered = false } = {}) {
  // centered=false (ícones "any"): símbolo levemente maior no centro.
  // centered=true (maskable): tudo dentro da safe zone central (80%).
  const scale = centered ? 0.8 : 0.92;
  const cx = 256;
  const cy = centered ? 256 : 248;
  const w = 150 * scale; // largura do braço horizontal
  const h = 360 * scale; // altura total
  const bar = 92 * scale; // espessura do braço horizontal
  const stem = 78 * scale; // espessura do mastro vertical
  const yTop = cy - h / 2;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${PAPER}"/>
          <stop offset="1" stop-color="${PAPER_DEEP}"/>
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${ACCENT_SOFT}"/>
          <stop offset="1" stop-color="${ACCENT}"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <!-- halo sutil atrás da cruz -->
      <circle cx="${cx}" cy="${cy}" r="${220 * scale}" fill="${ACCENT}" opacity="0.08"/>
      <!-- mastro vertical -->
      <rect x="${cx - stem / 2}" y="${yTop}" width="${stem}" height="${h}" rx="${stem / 2}" fill="url(#gold)"/>
      <!-- braço horizontal -->
      <rect x="${cx - w / 2}" y="${cy - bar / 2 - h * 0.28}" width="${w}" height="${bar}" rx="${bar / 2}" fill="url(#gold)"/>
    </svg>
  `;
}

async function writeIcon(name, size, svg) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, name));
  console.log(`OK ${name} (${size}x${size})`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// Ícones "any" (tela inicial Android/Windows, favicon) — símbolo no centro.
await writeIcon("icon-512x512.png", 512, crossSvg());
await writeIcon("icon-192x192.png", 192, crossSvg());
await writeIcon("apple-touch-icon.png", 180, crossSvg({ centered: true }));
// Maskable (adaptive icons Android) — safe zone 80% central.
await writeIcon("maskable-512x512.png", 512, crossSvg({ centered: true }));
await writeIcon("maskable-192x192.png", 192, crossSvg({ centered: true }));

console.log("Ícones gerados em public/icons/");
