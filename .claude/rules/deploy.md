# DEPLOY.md — Go-Live (Supabase + Vercel)

> Ordem: 1) Supabase (banco+segurança) → 2) Vercel (deploy) → 3) Domínio → 4) Verificação final

## FASE 1 — Supabase: banco de dados
1. Criar projeto (região próxima aos usuários).
2. Rodar migrations via CLI (`supabase db push`), nunca alterar schema manualmente em produção.
3. Conectar repositório Git no Supabase (Integrations) para deploy automático de migrations.

## FASE 2 — Supabase: segurança (bloqueia go-live)
- [ ] RLS em **todas** as tabelas com dados de negócio
- [ ] Policies SELECT usam `auth.uid()`; nunca `USING (true)` em tabela não-pública
- [ ] `service_role` key só em variáveis server-side
- [ ] Storage buckets privados por padrão, signed URLs para arquivos privados
- [ ] MFA na conta Supabase; Security Advisor sem críticos pendentes

## FASE 3 — Vercel: deploy
1. Conectar repositório Git ao Vercel.
2. Variáveis de ambiente no dashboard (nunca commitadas).
3. Headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

## FASE 4 — Verificação final
- [ ] Bundle sem `service_role` key
- [ ] HTTPS ativo
- [ ] Security Advisor do Supabase re-executado pós-deploy
