export const metadata = {
  title: "Sem conexão",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="text-5xl">✝️</div>
      <h1 className="text-2xl font-semibold text-foreground">
        Você está offline
      </h1>
      <p className="max-w-md text-foreground/60">
        O conteúdo da Bíblia que você já baixou continua disponível. Verifique
        sua conexão para acessar novos conteúdos.
      </p>
    </div>
  );
}
