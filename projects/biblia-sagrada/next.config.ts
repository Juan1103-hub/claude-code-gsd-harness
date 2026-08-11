import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [...collectPublicFiles(), { url: "/~offline", revision: "1" }],
});

/**
 * Lista todos os arquivos de `public/` (exceto o service worker) com URL
 * sempre em forward-slash e revision = hash md5 do conteúdo.
 *
 * O glob interno do @serwist/next gera URLs com barras invertidas no Windows
 * para arquivos aninhados de `public/` (ex.: `/data\tb\Gn.json`), o que quebra
 * o precache. Ao fornecer `additionalPrecacheEntries`, o scan interno é
 * substituído por esta lista normalizada.
 */
function collectPublicFiles(): { url: string; revision: string }[] {
  const publicDir = path.join(process.cwd(), "public");
  const entries: { url: string; revision: string }[] = [];

  const walk = (dir: string, rel: string) => {
    for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (dirent.name.startsWith("sw")) continue;
      const full = path.join(dir, dirent.name);
      const childRel = path.posix.join(rel, dirent.name);
      if (dirent.isDirectory()) {
        walk(full, childRel);
      } else if (dirent.isFile()) {
        const hash = crypto.createHash("md5").update(fs.readFileSync(full)).digest("hex");
        entries.push({ url: `/${childRel}`, revision: hash });
      }
    }
  };

  walk(publicDir, "");
  return entries;
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
