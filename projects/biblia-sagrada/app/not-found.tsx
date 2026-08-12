import Link from "next/link";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <div className="text-5xl">✝️</div>
      <h1 className="text-2xl font-semibold text-ink">
        Página não encontrada
      </h1>
      <p className="max-w-md text-sm text-ink-soft">
        Esta página não existe. Volte à Bíblia Sagrada.
      </p>
      <Link
        href="/"
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Ir para a Bíblia
      </Link>
    </div>
  );
}
