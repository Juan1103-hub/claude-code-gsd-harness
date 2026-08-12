import { openDb, SYNC_OUTBOX_STORE_NAME, type PlanProgress, type StudyRecord } from "./bible";
import { ensureAnonSession, getSupabase } from "./supabase";

/**
 * Sincronização local-first (D-14/D-15/D-16).
 *
 * - IndexedDB é a fonte de verdade local; o Supabase é uma réplica remota.
 * - Toda escrita local enfileira uma operação no store `sync_outbox` (IDB v3,
 *   criado em bible.ts); quando online, `flushOutbox()` envia para o Supabase
 *   (upsert/delete) e limpa a fila.
 * - `pullAll()` baixa os dados do usuário e faz merge LWW por updatedAt.
 * - Sem rede/sem .env.local → tudo permanece local, nada quebra.
 */

export type OutboxOp =
  | { kind: "upsert_study"; id: string; payload: StudyRecord }
  | { kind: "delete_study"; id: string }
  | { kind: "upsert_plan"; id: string; payload: PlanProgress };

interface OutboxRow {
  seq: number;
  op: OutboxOp;
}

/** Registra a operação no outbox local (fire-and-forget, nunca bloqueia a UI). */
export function enqueueSync(op: OutboxOp): void {
  if (typeof indexedDB === "undefined") return;
  openDb()
    .then((db) => {
      return new Promise<void>((resolve) => {
        const tx = db.transaction(SYNC_OUTBOX_STORE_NAME, "readwrite");
        tx.objectStore(SYNC_OUTBOX_STORE_NAME).add({ seq: nextSeq(), op });
        tx.oncomplete = () => {
          resolve();
          void flushOutbox();
        };
        tx.onerror = () => resolve();
      });
    })
    .catch(() => {});
}

/** Puxa os dados do usuário e faz merge LWW com o local. Chamado no boot/mount. */
export async function syncPull(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const ok = await ensureAnonSession();
  if (!ok) return;

  try {
    // Study records do usuário
    const { data: remoteRecords, error: recErr } = await supabase
      .from("study_records")
      .select("id, ref_version, ref_book, ref_chapter, ref_verse, color, text, updated_at");
    if (recErr) {
      console.warn("[sync] pull study_records falhou:", recErr.message);
      return;
    }
    await mergeStudyRecords(remoteRecords ?? []);

    // Plan progress do usuário
    const { data: remotePlans, error: planErr } = await supabase
      .from("plan_progress")
      .select("plan_id, completed_days, updated_at");
    if (planErr) {
      console.warn("[sync] pull plan_progress falhou:", planErr.message);
      return;
    }
    await mergePlanProgress(remotePlans ?? []);
  } catch (err) {
    console.warn("[sync] pull falhou:", err);
  }
}

/** Envia todas as operações pendentes do outbox para o Supabase. */
export async function flushOutbox(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const ok = await ensureAnonSession();
  if (!ok) return;

  const db = await openDb();
  let rows: OutboxRow[] = [];
  await new Promise<void>((resolve) => {
    const tx = db.transaction(SYNC_OUTBOX_STORE_NAME, "readonly");
    const req = tx.objectStore(SYNC_OUTBOX_STORE_NAME).getAll();
    req.onsuccess = () => {
      rows = (req.result as OutboxRow[]) ?? [];
      resolve();
    };
    req.onerror = () => resolve();
  });

  if (rows.length === 0) return;

  // Agrupa por id — mantém a ÚLTIMA operação de cada chave (a mais recente vence).
  const latest = new Map<string, OutboxOp>();
  for (const row of rows) {
    latest.set(row.op.id, row.op);
  }

  let failed = false;
  for (const op of latest.values()) {
    try {
      if (op.kind === "upsert_study") {
        await upsertStudyRecord(supabase, op.payload);
      } else if (op.kind === "delete_study") {
        const { error } = await supabase.from("study_records").delete().eq("id", op.id);
        if (error) throw error;
      } else if (op.kind === "upsert_plan") {
        const { error } = await supabase.from("plan_progress").upsert({
          plan_id: op.payload.planId,
          completed_days: op.payload.completedDays,
          updated_at: new Date(op.payload.updatedAt).toISOString(),
        });
        if (error) throw error;
      }
    } catch (err) {
      failed = true;
      console.warn("[sync] flush falhou em", op.kind, op.id, ":", err);
      break;
    }
  }

  if (!failed) {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(SYNC_OUTBOX_STORE_NAME, "readwrite");
      tx.objectStore(SYNC_OUTBOX_STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }
}

async function upsertStudyRecord(supabase: NonNullable<ReturnType<typeof getSupabase>>, rec: StudyRecord): Promise<void> {
  const { error } = await supabase.from("study_records").upsert({
    id: rec.id,
    ref_version: rec.ref.version,
    ref_book: rec.ref.book,
    ref_chapter: rec.ref.chapter,
    ref_verse: rec.ref.verse,
    color: rec.color,
    text: rec.text,
    updated_at: new Date(rec.updatedAt).toISOString(),
  });
  if (error) throw error;
}

async function mergeStudyRecords(
  remote: Array<{
    id: string;
    ref_version: string;
    ref_book: number;
    ref_chapter: number;
    ref_verse: number;
    color: string | null;
    text: string | null;
    updated_at: string;
  }>,
): Promise<void> {
  const { getAllStudyRecords, putStudyRecord } = await import("./bible");
  const local = await getAllStudyRecords();
  const localById = new Map(local.map((r) => [r.id, r]));
  const remoteById = new Map(
    remote.map((r) => [
      r.id,
      {
        id: r.id,
        ref: { version: r.ref_version, book: r.ref_book, chapter: r.ref_chapter, verse: r.ref_verse },
        color: r.color,
        text: r.text,
        updatedAt: new Date(r.updated_at).getTime(),
      } satisfies StudyRecord,
    ]),
  );

  const allIds = new Set([...localById.keys(), ...remoteById.keys()]);
  for (const id of allIds) {
    const l = localById.get(id);
    const r = remoteById.get(id);
    if (l && r) {
      // LWW: o mais recente vence
      if (r.updatedAt > l.updatedAt) {
        await putStudyRecord(r);
      } else if (l.updatedAt > r.updatedAt) {
        await pushStudyNow(r.id, l);
      }
    } else if (r && !l) {
      await putStudyRecord(r);
    } else if (l && !r) {
      await pushStudyNow(l.id, l);
    }
  }
}

/** Empurra um registro que não existe no remoto (envio direto, fora do outbox). */
async function pushStudyNow(id: string, rec: StudyRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await upsertStudyRecord(supabase, rec);
  } catch {
    enqueueSync({ kind: "upsert_study", id, payload: rec });
  }
}

async function mergePlanProgress(
  remote: Array<{ plan_id: string; completed_days: number[]; updated_at: string }>,
): Promise<void> {
  const { getPlanProgress, setPlanProgress } = await import("./bible");
  for (const rp of remote) {
    const local = await getPlanProgress(rp.plan_id);
    const remoteUpdatedAt = new Date(rp.updated_at).getTime();
    if (!local) {
      await setPlanProgress(rp.plan_id, rp.completed_days);
    } else if (remoteUpdatedAt > local.updatedAt) {
      await setPlanProgress(rp.plan_id, rp.completed_days);
    } else if (local.updatedAt > remoteUpdatedAt) {
      // Local mais recente — empurra
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from("plan_progress").upsert({
            plan_id: local.planId,
            completed_days: local.completedDays,
            updated_at: new Date(local.updatedAt).toISOString(),
          });
          if (error) enqueueSync({ kind: "upsert_plan", id: local.planId, payload: local });
        } catch {
          enqueueSync({ kind: "upsert_plan", id: local.planId, payload: local });
        }
      }
    }
  }
}

/** Gera um seq monotônico aproximado para o outbox (chave única). */
function nextSeq(): number {
  return Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
}
