"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Search, GraduationCap } from "lucide-react";
import Reader from "@/components/reader";
import SearchView from "@/components/search-view";
import StudyView from "@/components/study-view";
import { getIndex, type BibleIndex } from "@/lib/bible";
import { readVersion } from "@/lib/settings";

type View = "reader" | "search" | "study";

export default function Home() {
  const [view, setView] = useState<View>("reader");
  const [index, setIndex] = useState<BibleIndex | null>(null);

  useEffect(() => {
    getIndex().then(setIndex).catch(() => {});
  }, []);

  const handleNavigate = (
    bookId: number,
    chapter: number,
    version?: string,
  ) => {
    setView("reader");
    const url = new URL(window.location.href);
    url.searchParams.set("b", String(bookId));
    url.searchParams.set("c", String(chapter));
    if (version) url.searchParams.set("v", version);
    // Pitfall 4: replaceState exige string, nunca objeto URL.
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="flex flex-1 flex-col pb-16">
        {view === "reader" && <Reader />}
        {view === "search" && index && (
          <SearchView
            index={index}
            activeVersion={readVersion()}
            onNavigate={handleNavigate}
          />
        )}
        {view === "study" && index && (
          <StudyView
            index={index}
            onNavigate={(b, c) => {
              setView("reader");
              const url = new URL(window.location.href);
              url.searchParams.set("b", String(b));
              url.searchParams.set("c", String(c));
              window.history.replaceState(null, "", url.toString());
            }}
          />
        )}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur"
        aria-label="Navegação principal"
      >
        <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-1 px-3 py-2">
          <TabButton
            label="Leitura"
            icon={<BookOpen size={20} />}
            active={view === "reader"}
            onClick={() => setView("reader")}
          />
          <TabButton
            label="Busca"
            icon={<Search size={20} />}
            active={view === "search"}
            onClick={() => setView("search")}
          />
          <TabButton
            label="Estudo"
            icon={<GraduationCap size={20} />}
            active={view === "study"}
            onClick={() => setView("study")}
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        active
          ? "bg-accent text-white"
          : "text-ink-soft hover:bg-paper-muted hover:text-ink"
      }`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
