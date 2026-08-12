-- ============================================================================
-- Bíblia Sagrada — News feed (feature do usuário, 2026-08-12)
-- Executar no SQL Editor do Supabase (Dashboard > SQL Editor > New query).
--
-- Regra de negócio:
--  - Apenas usuários PERMANENTES (auth.jwt()->>'is_anonymous' = false) postam.
--  - Usuários anônimos E permanentes podem VER o feed (leitura pública do feed).
--
-- Ajuste as colunas de news_feed abaixo conforme o schema criado no dashboard,
-- se já existir (CREATE TABLE IF NOT EXISTS não sobrescreve).
-- ============================================================================

create table if not exists public.news_feed (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid(),
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.news_feed enable row level security;

create policy "Only permanent users can post to the news feed"
on news_feed as restrictive for insert
to authenticated
with check ((select (auth.jwt()->>'is_anonymous')::boolean) is false );

create policy "Anonymous and permanent users can view the news feed"
on news_feed for select
to authenticated
using ( true );

-- Nota: SELECT usa USING (true) de propósito — o feed é leitura pública entre
-- usuários autenticados (regra do harness mitigada: conteúdo não é dado
-- privado por usuário; a restrição real está no INSERT via is_anonymous).
-- Se preferir excluir anônimos da leitura, troque por uma policy com
-- (select (auth.jwt()->>'is_anonymous')::boolean) is false também no select.
