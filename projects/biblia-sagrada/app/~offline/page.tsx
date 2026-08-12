import Link from "next/link";

export const metadata = {
  title: "Sem conexão",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <div className="text-5xl">✝️</div>
      <h1 className="text-2xl font-semibold text-ink">
        Você está offline
      </h1>
      <p className="max-w-md text-sm text-ink-soft">
        O conteúdo da Bíblia que você já baixou continua disponível. Verifique
        sua conexão para acessar novos conteúdos.
      </p>
      <Link
        href="/"
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Voltar à Bíblia
      </Link>
    </div>
  );
}
