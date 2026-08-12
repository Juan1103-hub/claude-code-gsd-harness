-- ============================================================================
-- Bíblia Sagrada — Sync Supabase (SYN-01, plano 03)
-- Executar no SQL Editor do Supabase (Dashboard > SQL Editor > New query).
-- Cria as tabelas de sincronização com RLS: cada usuário só vê/edita os próprios
-- dados (auth.uid()). Compatível com auth anônimo (signInAnonymously).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) study_records — marcadores (5 cores) e anotações por versículo
--    Local: StudyRecord { id, ref{version,book,chapter,verse}, color, text, updatedAt }
-- ----------------------------------------------------------------------------
create table if not exists public.study_records (
  id          text primary key,           -- `${version}:${book}:${chapter}:${verse}` (D-06)
  user_id     uuid not null default auth.uid(),
  ref_version text not null,
  ref_book    integer not null,
  ref_chapter integer not null,
  ref_verse   integer not null,
  color       text,
  text        text,
  updated_at  timestamptz not null default now()
);

alter table public.study_records enable row level security;

create policy "study_records_select_own" on public.study_records
  for select using (auth.uid() = user_id);
create policy "study_records_insert_own" on public.study_records
  for insert with check (auth.uid() = user_id);
create policy "study_records_update_own" on public.study_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_records_delete_own" on public.study_records
  for delete using (auth.uid() = user_id);

create index if not exists study_records_user_idx on public.study_records (user_id, updated_at desc);

-- ----------------------------------------------------------------------------
-- 2) plan_progress — progresso dos planos de leitura
--    Local: PlanProgress { planId, completedDays: number[], updatedAt }
-- ----------------------------------------------------------------------------
create table if not exists public.plan_progress (
  plan_id        text primary key,
  user_id        uuid not null default auth.uid(),
  completed_days jsonb not null default '[]'::jsonb,
  updated_at     timestamptz not null default now()
);

alter table public.plan_progress enable row level security;

create policy "plan_progress_select_own" on public.plan_progress
  for select using (auth.uid() = user_id);
create policy "plan_progress_insert_own" on public.plan_progress
  for insert with check (auth.uid() = user_id);
create policy "plan_progress_update_own" on public.plan_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "plan_progress_delete_own" on public.plan_progress
  for delete using (auth.uid() = user_id);

create index if not exists plan_progress_user_idx on public.plan_progress (user_id, updated_at desc);

-- Nota: user_id default auth.uid() é redundante com as policies, mas protege
-- contra inserts acidentais sem a coluna. Nunca usar USING (true) em tabelas
-- de dados de usuário (regra do harness: deploy.md).
