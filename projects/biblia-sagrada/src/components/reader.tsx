"use client";

import { useCallback, useEffect, useState } from "react";
import { getChapter, getIndex, type BibleIndex, type Chapter } from "@/lib/bible";
import { applyTheme, readFontScale, readTheme, writeFontScale, FONT_SCALE_MAX, FONT_SCALE_MIN, FONT_SCALE_STEP, type Theme } from "@/lib/settings";
import BookPicker from "@/components/book-picker";

const VERSION = "tb";
const LAST_POS_KEY = "bs-last-pos";

interface Position {
  bookId: number;
  chapter: number;
}

function initialPosition(index: BibleIndex): Position {
  if (typeof window === "undefined") return { bookId: 0, chapter: 0 };
  const params = new URLSearchParams(window.location.search);
  const b = Number.parseInt(params.get("b") ?? "", 10);
  const c = Number.parseInt(params.get("c") ?? "", 10);
  if (Number.isInteger(b) && Number.isInteger(c)) {
    const book = index.books.find((x) => x.id === b);
    if (book && c >= 0 && c < book.chapters) return { bookId: b, chapter: c };
  }
  const stored = localStorage.getItem(LAST_POS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Position;
      const book = index.books.find((x) => x.id === parsed.bookId);
      if (book && parsed.chapter >= 0 && parsed.chapter < book.chapters) return parsed;
    } catch {
      /* posição inválida — usar padrão */
    }
  }
  return { bookId: 0, chapter: 0 };
}

export default function Reader() {
  const [index, setIndex] = useState<BibleIndex | null>(null);
  const [pos, setPos] = useState<Position>({ bookId: 0, chapter: 0 });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [fontScale, setFontScale] = useState(() => readFontScale());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getIndex()
      .then((idx) => {
        if (cancelled) return;
        setIndex(idx);
        setPos(initialPosition(idx));
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!index) return;
    let cancelled = false;
    getChapter(VERSION, pos.bookId, pos.chapter)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setStatus("error");
          return;
        }
        setChapter(result);
        setStatus("ready");
        document.title = `${result.book.name} ${result.chapter + 1} — Bíblia Sagrada`;
        const url = new URL(window.location.href);
        url.searchParams.set("b", String(result.book.id));
        url.searchParams.set("c", String(result.chapter));
        window.history.replaceState(null, "", url.toString());
        localStorage.setItem(LAST_POS_KEY, JSON.stringify({ bookId: result.book.id, chapter: result.chapter }));
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [index, pos]);

  const prefetchAdjacent = useCallback((current: Chapter) => {
    const { book, chapter: ch } = current;
    if (ch === 0 && book.id > 0) {
      getChapter(VERSION, book.id - 1, 0).catch(() => {});
    }
    if (ch === book.chapters - 1 && book.id < 65) {
      getChapter(VERSION, book.id + 1, 0).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (status === "ready" && chapter) prefetchAdjacent(chapter);
  }, [status, chapter, prefetchAdjacent]);

  const goTo = useCallback(
    (bookId: number, chapterNumber: number) => {
      setStatus("loading");
      setPos({ bookId, chapter: chapterNumber });
      window.scrollTo({ top: 0 });
    },
    [],
  );

  const goPrev = useCallback(() => {
    if (!index) return;
    if (pos.chapter > 0) {
      goTo(pos.bookId, pos.chapter - 1);
    } else if (pos.bookId > 0) {
      const prevBook = index.books[pos.bookId - 1];
      goTo(pos.bookId - 1, prevBook.chapters - 1);
    }
  }, [index, pos, goTo]);

  const goNext = useCallback(() => {
    if (!index) return;
    const book = index.books[pos.bookId];
    if (pos.chapter < book.chapters - 1) {
      goTo(pos.bookId, pos.chapter + 1);
    } else if (pos.bookId < index.books.length - 1) {
      goTo(pos.bookId + 1, 0);
    }
  }, [index, pos, goTo]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const bumpFont = useCallback(
    (delta: number) => {
      setFontScale((prev) => {
        const next = Math.round(Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, prev + delta)) * 10) / 10;
        writeFontScale(next);
        return next;
      });
    },
    [],
  );

  if (!index) {
    return (
      <Shell>
        <main className="flex flex-1 items-center justify-center px-6">
          <p className="font-serif text-lg text-ink-soft" role="status">
            Carregando…
          </p>
        </main>
      </Shell>
    );
  }

  return (
    <>
      <Shell>
        <Header
          title={chapter ? `${chapter.book.name} ${chapter.chapter + 1}` : "Bíblia Sagrada"}
          theme={theme}
          fontScale={fontScale}
          onOpenPicker={() => setPickerOpen(true)}
          onToggleTheme={toggleTheme}
          onFontDown={() => bumpFont(-FONT_SCALE_STEP)}
          onFontUp={() => bumpFont(FONT_SCALE_STEP)}
        />
        {offline && (
          <div className="border-b border-line bg-paper-muted px-4 py-1.5 text-center text-xs text-ink-soft">
            Você está offline — o conteúdo já baixado permanece disponível.
          </div>
        )}
        {status === "loading" && (
          <main className="flex flex-1 items-center justify-center px-6" aria-busy="true">
            <p className="font-serif text-lg text-ink-soft" role="status">
              Carregando {index.books[pos.bookId]?.name} {pos.chapter + 1}…
            </p>
          </main>
        )}
        {status === "error" && (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-lg text-ink">Não foi possível carregar este capítulo.</p>
            <p className="text-sm text-ink-soft">
              Verifique sua conexão. Se estiver offline, o capítulo precisa ter sido aberto antes.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setPos((p) => ({ ...p }));
              }}
              className="flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Tentar novamente
            </button>
          </main>
        )}
        {status === "ready" && chapter && (
          <ChapterView chapter={chapter} fontScale={fontScale} />
        )}
        <Footer
          hasPrev={pos.bookId > 0 || pos.chapter > 0}
          hasNext={pos.bookId < index.books.length - 1 || pos.chapter < index.books[pos.bookId].chapters - 1}
          onPrev={goPrev}
          onNext={goNext}
        />
      </Shell>
      <BookPicker
        open={pickerOpen}
        index={index}
        current={pos}
        onSelect={goTo}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-paper text-ink">{children}</div>;
}

function Header({
  title,
  theme,
  fontScale,
  onOpenPicker,
  onToggleTheme,
  onFontDown,
  onFontUp,
}: {
  title: string;
  theme: Theme;
  fontScale: number;
  onOpenPicker: () => void;
  onToggleTheme: () => void;
  onFontDown: () => void;
  onFontUp: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-3">
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Escolher livro e capítulo"
        >
          ☰
        </button>
        <button
          type="button"
          onClick={onOpenPicker}
          className="min-h-11 flex-1 truncate px-2 text-center text-base font-semibold tracking-tight transition-colors hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-accent"
          title={title}
        >
          {title}
        </button>
        <div className="flex items-center">
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
          <IconButton label={`Diminuir fonte (${fontScale.toFixed(1).replace(".", ",")})`} onClick={onFontDown}>
            A−
          </IconButton>
          <IconButton label={`Aumentar fonte (${fontScale.toFixed(1).replace(".", ",")})`} onClick={onFontUp}>
            A+
          </IconButton>
          <IconButton
            label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo noturno"}
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "☾" : "☀"}
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 min-w-11 items-center justify-center rounded-full text-sm text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
}

function ChapterView({ chapter, fontScale }: { chapter: Chapter; fontScale: number }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 sm:px-8">
      <h1 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {chapter.book.name} {chapter.chapter + 1}
      </h1>
      <div
        className="space-y-4 font-serif leading-[1.75] text-ink"
        style={{ fontSize: `${(fontScale * 1.125).toFixed(2)}rem` }}
      >
        {chapter.verses.map((verse, i) => (
          <p key={i} className="text-pretty">
            <sup className="mr-2 select-none text-[0.6em] font-semibold text-accent">{i + 1}</sup>
            {verse}
          </p>
        ))}
      </div>
    </main>
  );
}

function Footer({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur"
      aria-label="Navegação de capítulos"
    >
      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 px-3 py-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex h-12 items-center justify-center gap-1 rounded-full text-sm font-medium text-ink transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-35"
        >
          ‹ Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-12 items-center justify-center gap-1 rounded-full text-sm font-medium text-ink transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-35"
        >
          Próximo ›
        </button>
      </div>
    </nav>
  );
}
