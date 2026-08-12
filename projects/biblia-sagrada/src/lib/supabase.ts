import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase (anon key) — D-17.
 *
 * Se as variáveis de ambiente não existirem (.env.local ausente), o módulo fica
 * desativado: `getSupabase()` retorna null e `ensureAnonSession()` resolve false.
 * O app permanece 100% local-first nesse caso — nada quebra.
 *
 * NUNCA usar service_role aqui: ela não entra no bundle do cliente.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
let sessionPromise: Promise<boolean> | null = null;

export function isSyncEnabled(): boolean {
  return Boolean(URL && ANON_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSyncEnabled()) return null;
  if (!client) {
    client = createClient(URL!, ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/**
 * Garante uma sessão anônima (sem fricção — D-14). Reutiliza sessão persistida
 * se houver; caso contrário chama signInAnonymously(). Deduplica chamadas
 * concorrentes. Retorna false se o sync estiver desativado ou falhar.
 */
export async function ensureAnonSession(): Promise<boolean> {
  if (!isSyncEnabled()) return false;
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return false;
      const { data } = await supabase.auth.getSession();
      if (data.session) return true;
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn("[sync] signInAnonymously falhou:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[sync] sessão anônima indisponível:", err);
      return false;
    }
  })();
  sessionPromise.finally(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}
