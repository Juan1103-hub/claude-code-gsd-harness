"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, Sun, Moon, ChevronLeft, ChevronRight, Pencil, Check, Circle, Copy, CheckCheck, Square, SquareCheck } from "lucide-react";
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
      /* posiÃ§Ã£o invÃ¡lida â€” usar padrÃ£o */
    }
  }
  return { bookId: 0, chapter: 0 };
}

/** Lazy init: URL ?v= Ã© o estado navegÃ¡vel (D-02); fallback localStorage bs-version. */
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [copiedSelection, setCopiedSelection] = useState(false);

  // Carrega o registro de traduÃ§Ãµes baixadas (IDB meta) no mount.
  useEffect(() => {
    getDownloadedVersions().then(setDownloaded).catch(() => {});
  }, []);

  // Carrega as chaves de capÃ­tulos lidos (IDB v4) no mount.
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
        // URL Ã© o estado navegÃ¡vel â€” se ?v= veio no deep-link, ele vence (D-02).
        const params = new URLSearchParams(window.location.search);
        const v = params.get("v");
        if (v && (SUPPORTED_VERSIONS as readonly string[]).includes(v)) {
          setVersion(v);
        }
      })
      .catch((err) => {
        console.error("[BÃ­blia] Erro ao carregar Ã­ndice:", err);
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
        document.title = `${result.book.name} ${result.chapter + 1} â€” BÃ­blia Sagrada`;
        const url = new URL(window.location.href);
        url.searchParams.set("b", String(result.book.id));
        url.searchParams.set("c", String(result.chapter));
        url.searchParams.set("v", version);
        // Pitfall 4: replaceState exige string, nunca objeto URL (DataCloneError).
        window.history.replaceState(null, "", url.toString());
        localStorage.setItem(LAST_POS_KEY, JSON.stringify({ bookId: result.book.id, chapter: result.chapter }));
        writeVersion(version);
        // Carrega registros de estudo (marcadores/anotaÃ§Ãµes) do capÃ­tulo.
        getStudyRecords(version, result.book.id, result.chapter)
          .then(setStudyRecords)
          .catch(() => setStudyRecords([]));
        // TÃ­tulos de seÃ§Ã£o editoriais (NTLH) para este capÃ­tulo.
        getChapterSectionTitles(result.book.abbrev, result.chapter + 1)
          .then(setSectionTitles)
          .catch(() => setSectionTitles([]));
      })
      .catch((err) => {
        console.error("[BÃ­blia] Erro ao carregar capÃ­tulo:", err);
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
    // O efeito de capÃ­tulo re-renderiza com a nova versÃ£o; sem reload, sem scroll reset.
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

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
    setSelectedVerses(new Set());
  }, []);

  const toggleVerseSelection = useCallback((verseIdx: number) => {
    setSelectedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseIdx)) next.delete(verseIdx);
      else next.add(verseIdx);
      return next;
    });
  }, []);

  const copySelectedVerses = useCallback(async () => {
    if (!chapter || selectedVerses.size === 0) return;
    const sorted = Array.from(selectedVerses).sort((a, b) => a - b);
    const lines = sorted.map((i) => chapter.verses[i]);
    const ref = `${chapter.book.abbrev} ${chapter.chapter + 1}:${sorted[0] + 1}${sorted.length > 1 ? "-" + (sorted[sorted.length - 1] + 1) : ""}`;
    const full = lines.join("\n") + "\n\n" + ref + " â€” " + version.toUpperCase();
    try {
      await navigator.clipboard.writeText(full);
    } catch {
      /* clipboard indisponÃ­vel */
    }
    setCopiedSelection(true);
    setTimeout(() => setCopiedSelection(false), 1500);
  }, [chapter, selectedVerses, version]);

  if (!index) {
    return (
      <Shell>
        <main className="flex flex-1 items-center justify-center px-6">
          <p className="font-serif text-lg text-ink-soft" role="status">
            Carregandoâ€¦
          </p>
        </main>
      </Shell>
    );
  }

  return (
    <>
      <Shell>
        <Header
          title={chapter ? `${chapter.book.name} ${chapter.chapter + 1}` : "BÃ­blia Sagrada"}
          versionLabel={chapter?.version.shortLabel ?? (index.versions.find((v) => v.code === version)?.shortLabel ?? version)}
          theme={theme}
          fontScale={fontScale}
          selectMode={selectMode}
          onOpenPicker={() => setPickerOpen(true)}
          onOpenVersionPicker={() => setVersionPickerOpen(true)}
          onToggleTheme={toggleTheme}
          onFontDown={() => bumpFont(-FONT_SCALE_STEP)}
          onFontUp={() => bumpFont(FONT_SCALE_STEP)}
          onToggleSelect={toggleSelectMode}
        />
        {offline && (
          <div className="border-b border-line bg-paper-muted px-4 py-1.5 text-center text-xs text-ink-soft">
            VocÃª estÃ¡ offline â€” o conteÃºdo jÃ¡ baixado permanece disponÃ­vel.
          </div>
        )}
        {status === "loading" && (
          <main className="flex flex-1 items-center justify-center px-6" aria-busy="true">
            <p className="font-serif text-lg text-ink-soft" role="status">
              Carregando {index.books[pos.bookId]?.name} {pos.chapter + 1}â€¦
            </p>
          </main>
        )}
        {status === "error" && (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-lg text-ink">NÃ£o foi possÃ­vel carregar este capÃ­tulo.</p>
            <p className="text-sm text-ink-soft">
              Verifique sua conexÃ£o. Se estiver offline, o capÃ­tulo precisa ter sido aberto antes.
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
            selectMode={selectMode}
            selectedVerses={selectedVerses}
            isRead={readKeys.has(readChapterKey(chapter.book.id, chapter.chapter))}
            onToggleRead={handleToggleRead}
            onVerseClick={handleVerseClick}
            onToggleVerse={toggleVerseSelection}
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
      {selectMode && selectedVerses.size > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-50 flex justify-center px-4 pb-2">
          <button
            type="button"
            onClick={copySelectedVerses}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
          >
            {copiedSelection ? <CheckCheck size={18} /> : <Copy size={18} />}
            {copiedSelection ? "Copiado!" : `Copiar ${selectedVerses.size} versÃ­culo${selectedVerses.size > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
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
  selectMode,
  onOpenPicker,
  onOpenVersionPicker,
  onToggleTheme,
  onFontDown,
  onFontUp,
  onToggleSelect,
}: {
  title: string;
  versionLabel: string;
  theme: Theme;
  fontScale: number;
  selectMode: boolean;
  onOpenPicker: () => void;
  onOpenVersionPicker: () => void;
  onToggleTheme: () => void;
  onFontDown: () => void;
  onFontUp: () => void;
  onToggleSelect: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-3">
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Escolher livro e capÃ­tulo"
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
          aria-label="Trocar traduÃ§Ã£o"
          title={`Trocar traduÃ§Ã£o (${versionLabel})`}
        >
          {versionLabel}
        </button>
        <div className="flex items-center">
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
          <IconButton label={`Diminuir fonte (${fontScale.toFixed(1).replace(".", ",")})`} onClick={onFontDown}>
            Aâˆ’
          </IconButton>
          <IconButton label={`Aumentar fonte (${fontScale.toFixed(1).replace(".", ",")})`} onClick={onFontUp}>
            A+
          </IconButton>
          <IconButton
            label={selectMode ? "Sair do modo seleÃ§Ã£o" : "Selecionar versÃ­culos"}
            onClick={onToggleSelect}
            active={selectMode}
          >
            {selectMode ? <SquareCheck size={20} /> : <Square size={20} />}
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
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-11 min-w-11 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        active
          ? "bg-accent text-white"
          : "text-ink-soft hover:bg-paper-muted hover:text-ink"
      }`}
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
  selectMode,
  selectedVerses,
  isRead,
  onToggleRead,
  onVerseClick,
  onToggleVerse,
}: {
  chapter: Chapter;
  fontScale: number;
  studyRecords: StudyRecord[];
  sectionTitles: SectionTitle[];
  selectMode: boolean;
  selectedVerses: Set<number>;
  isRead: boolean;
  onToggleRead: () => void;
  onVerseClick: (book: number, chapter: number, verse: number) => void;
  onToggleVerse: (verseIdx: number) => void;
}) {
  // TÃ­tulo de seÃ§Ã£o que abre o capÃ­tulo (ex.: Is 61 â†’ "A salvaÃ§Ã£o de Israel").
  const openingTitle = sectionTitles.find((t) => t.v === 1)?.title;
  // Demais tÃ­tulos, posicionados no versÃ­culo onde cada seÃ§Ã£o comeÃ§a.
  const inlineTitles = sectionTitles.filter((t) => t.v !== 1);
  // Fluxo contÃ­nuo: versÃ­culos em parÃ¡grafos, quebrando apenas nos tÃ­tulos de seÃ§Ã£o.
  const paragraphs: number[][] = [];
  let currentParagraph: number[] = [];
  chapter.verses.forEach((_, i) => {
    if (currentParagraph.length > 0 && inlineTitles.some((t) => t.v === i + 1)) {
      paragraphs.push(currentParagraph);
      currentParagraph = [];
    }
    currentParagraph.push(i);
  });
  if (currentParagraph.length > 0) paragraphs.push(currentParagraph);
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 sm:px-8">
      {openingTitle && (
        <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-accent sm:text-2xl">
          {openingTitle}
        </h1>
      )}
      <div
        className="font-serif text-ink"
        style={{ fontSize: `${(fontScale * 1.125).toFixed(2)}rem` }}
      >
        {paragraphs.map((para, pIdx) => {
          const sectionTitle = inlineTitles.find((t) => t.v === para[0] + 1);
          return (
            <div
              key={pIdx}
              className={`${sectionTitle ? "mt-6 first:mt-0" : ""} mb-5 last:mb-0`}
            >
              {sectionTitle && (
                <p className="mb-2 font-serif text-sm font-semibold tracking-wide text-accent sm:text-base">
                  {sectionTitle.title}
                </p>
              )}
              <p className="leading-[1.75] text-pretty">
                {para.map((i) => {
                  const record = studyRecords.find((r) => r.ref.verse === i);
                  const hasAnnotation = record?.text;
                  const marked = Boolean(record?.color);
                  return (
                    <span key={i} className="inline">
                      <button
                        type="button"
                        onClick={() => selectMode ? onToggleVerse(i) : onVerseClick(chapter.book.id, chapter.chapter, i)}
                        className={`inline align-baseline text-left focus-visible:outline-2 focus-visible:outline-accent ${
                          selectMode
                            ? selectedVerses.has(i)
                              ? "bg-accent/15"
                              : "hover:bg-paper-muted"
                            : "hover:bg-paper-muted"
                        }`}
                        style={!selectMode && record?.color ? { backgroundColor: record.color, color: "var(--color-mark-ink)" } : undefined}
                        aria-label={selectMode ? `Selecionar versÃ­culo ${i + 1}` : `VersÃ­culo ${i + 1} (${chapter.book.abbrev} ${chapter.chapter + 1}:${i + 1})`}
                      >
                        <sup
                          className={`mr-1 select-none text-[0.55em] font-semibold ${marked && !selectMode ? "text-[inherit]" : "text-accent"}`}
                        >
                          {i + 1}
                        </sup>
                        {chapter.verses[i]}
                        {hasAnnotation && !selectMode && (
                          <span
                            className={`ml-1 inline-flex text-xs ${marked ? "text-[inherit]" : "text-accent"}`}
                            aria-label="Tem anotaÃ§Ã£o"
                          >
                            <Pencil size={12} />
                          </span>
                        )}
                      </button>
                      {" "}
                    </span>
                  );
                })}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 border-t border-line pt-4 text-center">
        <button
          type="button"
          onClick={onToggleRead}
          aria-pressed={isRead}
          aria-label={isRead ? "Marcar capÃ­tulo como nÃ£o lido" : "Marcar capÃ­tulo como lido"}
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
      aria-label="NavegaÃ§Ã£o de capÃ­tulos"
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
          PrÃ³ximo <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
