export type Theme = "light" | "dark";

export const VERSION_KEY = "bs-version";
export const SUPPORTED_VERSIONS = ["tb", "alm1911", "blivre", "ntlh", "acf"] as const;
export type VersionCode = (typeof SUPPORTED_VERSIONS)[number];

const THEME_KEY = "bs-theme";
const FONT_SCALE_KEY = "bs-font-scale";

export const FONT_SCALE_MIN = 0.8;
export const FONT_SCALE_MAX = 1.6;
export const FONT_SCALE_STEP = 0.1;

export function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function readFontScale(): number {
  if (typeof window === "undefined") return 1;
  const stored = Number.parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? "");
  if (!Number.isFinite(stored)) return 1;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, stored));
}

export function writeFontScale(scale: number): void {
  localStorage.setItem(FONT_SCALE_KEY, String(scale));
}

export function readVersion(): string {
  if (typeof window === "undefined") return "tb";
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored && (SUPPORTED_VERSIONS as readonly string[]).includes(stored)) return stored;
  return "tb";
}

export function writeVersion(code: string): void {
  localStorage.setItem(VERSION_KEY, code);
}
