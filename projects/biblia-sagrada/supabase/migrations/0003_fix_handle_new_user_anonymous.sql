-- ============================================================================
-- APPROVAL: 2026-08-16 — Aprovada em docs/DECISIONS.md ("Gate de aprovação
-- para migrations de superfície compartilhada"). Sem mudança de comportamento.
-- ============================================================================
-- Fix: handle_new_user quebrava o sign-in anônimo.
--
-- O projeto compartilha o banco com outro app (vendas/PDV) cujo trigger
-- public.handle_new_user insere em public.users (id, email, full_name, role)
-- para TODA criação de usuário em auth.users. Usuários ANÔNIMOS não têm email
-- (NULL) → a inserção falha → o signup anônimo retorna 500
-- ("Database error creating anonymous user").
--
-- Solução cirúrgica: o trigger agora ignora usuários anônimos
-- (auth.users.is_anonymous = true), preservando o comportamento para
-- usuários normais (email/password, OAuth) do app de vendas.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  -- Usuários anônimos não têm email e não devem virar registro do app de vendas.
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  insert into public.users (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'almoxarife'),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
