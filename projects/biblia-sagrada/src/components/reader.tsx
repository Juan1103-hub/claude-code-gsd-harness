"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, Sun, Moon, ChevronLeft, ChevronRight, Pencil, Check, Circle } from "lucide-react";
import { getChapter, getChapterSectionTitles, getDownloadedVersions, getIndex, getReadChapterKeys, getStudyRecords, readChapterKey, toggleChapterRead, type BibleIndex, type Chapter, type SectionTitle, type StudyRecord } from "@/lib/bible";
import {
  applyTheme,
  readFontScale,
  readTheme,
  readVersion,
  writeFontScale,
  writeVersion,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  SUPPORTED_VERSIONS,
  type Theme,
} from "@/lib/settings";
import BookPicker from "@/components/book-picker";
import VersionPicker from "@/components/version-picker";
import DownloadModal from "@/components/download-modal";
import VerseActions from "@/components/verse-actions";

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

/** Lazy init: URL ?v= é o estado navegável (D-02); fallback localStorage bs-version. */
function initialVersion(): string {
  if (typeof window === "undefined") return "tb";
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  if (v && (SUPPORTED_VERSIONS as readonly string[]).includes(v)) return v;
  return readVersion();
}

export default function Reader() {
  const [index, setIndex] = useState<BibleIndex | null>(null);
  const [pos, setPos] = useState<Position>({ bookId: 0, chapter: 0 });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [version, setVersion] = useState<string>(() => initialVersion());
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [fontScale, setFontScale] = useState(() => readFontScale());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [versionPickerOpen, setVersionPickerOpen] = useState(false);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [downloadTarget, setDownloadTarget] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [verseActionsOpen, setVerseActionsOpen] = useState(false);
  const [verseActionsVerse, setVerseActionsVerse] = useState<{ book: number; chapter: number; verse: number } | null>(null);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());
  const [sectionTitles, setSectionTitles] = useState<SectionTitle[]>([]);

  // Carrega o registro de traduções baixadas (IDB meta) no mount.
  useEffect(() => {
    getDownloadedVersions().then(setDownloaded).catch(() => {});
  }, []);

  // Carrega as chaves de capítulos lidos (IDB v4) no mount.
  useEffect(() => {
    getReadChapterKeys()
      .then((keys) => setReadKeys(new Set(keys)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    getIndex()
      .then((idx) => {
        if (cancelled) return;
        setIndex(idx);
        setPos(initialPosition(idx));
        // URL é o estado navegável — se ?v= veio no deep-link, ele vence (D-02).
        const params = new URLSearchParams(window.location.search);
        const v = params.get("v");
        if (v && (SUPPORTED_VERSIONS as readonly string[]).includes(v)) {
          setVersion(v);
        }
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
    getChapter(version, pos.bookId, pos.chapter)
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
        url.searchParams.set("v", version);
        // Pitfall 4: replaceState exige string, nunca objeto URL (DataCloneError).
        window.history.replaceState(null, "", url.toString());
        localStorage.setItem(LAST_POS_KEY, JSON.stringify({ bookId: result.book.id, chapter: result.chapter }));
        writeVersion(version);
        // Carrega registros de estudo (marcadores/anotações) do capítulo.
        getStudyRecords(version, result.book.id, result.chapter)
          .then(setStudyRecords)
          .catch(() => setStudyRecords([]));
        // Títulos de seção editoriais (NTLH) para este capítulo.
        getChapterSectionTitles(result.book.abbrev, result.chapter + 1)
          .then(setSectionTitles)
          .catch(() => setSectionTitles([]));
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [index, pos, version]);

  const prefetchAdjacent = useCallback(
    (current: Chapter) => {
      const { book, chapter: ch } = current;
      if (ch === 0 && book.id > 0) {
        getChapter(version, book.id - 1, 0).catch(() => {});
      }
      if (ch === book.chapters - 1 && book.id < 65) {
        getChapter(version, book.id + 1, 0).catch(() => {});
      }
    },
    [version],
  );

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

  const handleVersionChange = useCallback((code: string) => {
    // O efeito de capítulo re-renderiza com a nova versão; sem reload, sem scroll reset.
    setVersion(code);
  }, []);

  const handleDownloadDone = useCallback((code: string) => {
    setDownloaded((prev) => (prev.includes(code) ? prev : [...prev, code]));
    setDownloadTarget(null);
  }, []);

  const handleVerseClick = useCallback((book: number, chapter: number, verse: number) => {
    setVerseActionsVerse({ book, chapter, verse });
    setVerseActionsOpen(true);
  }, []);

  const handleStudyRecordsChanged = useCallback(() => {
    if (!chapter) return;
    getStudyRecords(version, chapter.book.id, chapter.chapter)
      .then(setStudyRecords)
      .catch(() => setStudyRecords([]));
  }, [chapter, version]);

  const handleToggleRead = useCallback(async () => {
    if (!chapter) return;
    const nowRead = await toggleChapterRead(chapter.book.id, chapter.chapter).catch(() => false);
    setReadKeys((prev) => {
      const next = new Set(prev);
      const key = readChapterKey(chapter.book.id, chapter.chapter);
      if (nowRead) next.add(key);
      else next.delete(key);
      return next;
    });
  }, [chapter]);

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
          versionLabel={chapter?.version.shortLabel ?? (index.versions.find((v) => v.code === version)?.shortLabel ?? version)}
          theme={theme}
          fontScale={fontScale}
          onOpenPicker={() => setPickerOpen(true)}
          onOpenVersionPicker={() => setVersionPickerOpen(true)}
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
          <ChapterView
            chapter={chapter}
            fontScale={fontScale}
            studyRecords={studyRecords}
            sectionTitles={sectionTitles}
            isRead={readKeys.has(readChapterKey(chapter.book.id, chapter.chapter))}
            onToggleRead={handleToggleRead}
            onVerseClick={handleVerseClick}
          />
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
        readKeys={readKeys}
        onSelect={goTo}
        onClose={() => setPickerOpen(false)}
      />
      <VersionPicker
        open={versionPickerOpen}
        versions={index.versions}
        current={version}
        downloaded={downloaded}
        onSelect={handleVersionChange}
        onManageDownload={(code) => {
          setVersionPickerOpen(false);
          setDownloadTarget(code);
        }}
        onClose={() => setVersionPickerOpen(false)}
      />
      <DownloadModal
        open={downloadTarget !== null}
        versionCode={downloadTarget}
        onClose={() => setDownloadTarget(null)}
        onDone={() => {
          if (downloadTarget) handleDownloadDone(downloadTarget);
        }}
      />
      <VerseActions
        open={verseActionsOpen}
        verse={verseActionsVerse}
        version={version}
        label={verseActionsVerse ? `${chapter?.book.abbrev ?? ""} ${verseActionsVerse.chapter + 1}:${verseActionsVerse.verse + 1}` : ""}
        verseText={verseActionsVerse && chapter ? chapter.verses[verseActionsVerse.verse] : undefined}
        initial={verseActionsVerse ? studyRecords.find((r) => r.ref.verse === verseActionsVerse.verse) ?? null : null}
        onClose={() => setVerseActionsOpen(false)}
        onChanged={() => {
          handleStudyRecordsChanged();
          setVerseActionsOpen(false);
        }}
      />
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-paper text-ink">{children}</div>;
}

function Header({
  title,
  versionLabel,
  theme,
  fontScale,
  onOpenPicker,
  onOpenVersionPicker,
  onToggleTheme,
  onFontDown,
  onFontUp,
}: {
  title: string;
  versionLabel: string;
  theme: Theme;
  fontScale: number;
  onOpenPicker: () => void;
  onOpenVersionPicker: () => void;
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
          <Menu size={20} />
        </button>
        <button
          type="button"
          onClick={onOpenPicker}
          className="min-h-11 flex-1 truncate px-2 text-center text-base font-semibold tracking-tight transition-colors hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-accent"
          title={title}
        >
          {title}
        </button>
        <button
          type="button"
          onClick={onOpenVersionPicker}
          className="flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Trocar tradução"
          title={`Trocar tradução (${versionLabel})`}
        >
          {versionLabel}
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
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
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

function ChapterView({
  chapter,
  fontScale,
  studyRecords,
  sectionTitles,
  isRead,
  onToggleRead,
  onVerseClick,
}: {
  chapter: Chapter;
  fontScale: number;
  studyRecords: StudyRecord[];
  sectionTitles: SectionTitle[];
  isRead: boolean;
  onToggleRead: () => void;
  onVerseClick: (book: number, chapter: number, verse: number) => void;
}) {
  // Título de seção que abre o capítulo (ex.: Is 61 → "A salvação de Israel").
  const openingTitle = sectionTitles.find((t) => t.v === 1)?.title;
  // Demais títulos, posicionados no versículo onde cada seção começa.
  const inlineTitles = sectionTitles.filter((t) => t.v !== 1);
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 sm:px-8">
      {openingTitle && (
        <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-accent sm:text-2xl">
          {openingTitle}
        </h1>
      )}
      <div
        className="space-y-4 font-serif leading-[1.75] text-ink"
        style={{ fontSize: `${(fontScale * 1.125).toFixed(2)}rem` }}
      >
        {chapter.verses.map((verse, i) => {
          const record = studyRecords.find((r) => r.ref.verse === i);
          const hasAnnotation = record?.text;
          const marked = Boolean(record?.color);
          const sectionTitle = inlineTitles.find((t) => t.v === i + 1);
          return (
            <div key={i} className="border-b border-line last:border-b-0">
              {sectionTitle && (
                <p className="mb-2 mt-4 font-serif text-sm font-semibold tracking-wide text-accent first:mt-0 sm:text-base">
                  {sectionTitle.title}
                </p>
              )}
              <button
                type="button"
                onClick={() => onVerseClick(chapter.book.id, chapter.chapter, i)}
                className="block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent"
                style={record?.color ? { backgroundColor: record.color, color: "var(--color-mark-ink)" } : undefined}
                aria-label={`Versículo ${i + 1} (${chapter.book.abbrev} ${chapter.chapter + 1}:${i + 1})`}
              >
                <span className="text-pretty">
                  <sup
                    className={`mr-2 select-none text-[0.6em] font-semibold ${marked ? "text-[inherit]" : "text-accent"}`}
                  >
                    {i + 1}
                  </sup>
                  {verse}
                  {hasAnnotation && (
                    <span
                      className={`ml-1 inline-flex text-xs ${marked ? "text-[inherit]" : "text-accent"}`}
                      aria-label="Tem anotação"
                    >
                      <Pencil size={12} />
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 border-t border-line pt-4 text-center">
        <button
          type="button"
          onClick={onToggleRead}
          aria-pressed={isRead}
          aria-label={isRead ? "Marcar capítulo como não lido" : "Marcar capítulo como lido"}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
            isRead
              ? "border-accent/50 bg-accent/10 text-accent"
              : "border-line text-ink-soft hover:bg-paper-muted hover:text-ink"
          }`}
        >
          {isRead ? <Check size={16} /> : <Circle size={16} />}
          {isRead ? "Lido" : "Marcar como lido"}
        </button>
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
          <ChevronLeft size={16} />
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-12 items-center justify-center gap-1 rounded-full text-sm font-medium text-ink transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-35"
        >
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
