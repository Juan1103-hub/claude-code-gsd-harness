---
status: mostly_pass
phase: 03-multim-dia-e-sincroniza-o
started: "2026-08-12"
---

# Fase 3 — UAT (Sync Supabase + Rota 66)

**Pré-requisito infra:** `node scripts/check-sync.mjs` deve mostrar todos ✅
(auth anônimo habilitado + tabelas study_records/plan_progress criadas).

## Tests

### 1. Rota 66 — aba e links externos
**expected:** Aba Estudo → aba "Rota 66" → descrição do programa + botões "Ouvir no site da RTM" e "Ouvir no podcast (Omny)" → clique abre nova aba (target=_blank) com os canais oficiais → atribuição © RTM visível
**result:** pass (verificado em E2E 2026-08-12)

### 2. Sincronização de marcador (push)
**expected:** Marcar versículo com cor → aguardar sync → conferir no Supabase (Table Editor > study_records) que o registro existe com user_id = uid do anônimo e color correto
**result:** pass (E2E 2026-08-12: marcador amarelo em Gn 1:1 presente no banco via Management API; RLS confirmado — anon sem sessão não vê, dono do banco vê)

### 3. Sincronização de anotação (push)
**expected:** Criar anotação → conferir que `text` aparece na linha study_records correspondente
**result:** pass (E2E 2026-08-12: anotação 'UAT-ANOTACAO-SYNC-2026' em Gn 1:2 presente no banco via Management API)

### 4. Sincronização de progresso de plano (push)
**expected:** Marcar dia concluído no plano → conferir `plan_progress` com completed_days atualizado
**result:** pass (E2E 2026-08-12: plano 'bib1ano' com completed_days [1] no banco via Management API)

### 5. Pull (outro dispositivo / merge LWW)
**expected:** Com a conta anônima ativa, alterar um registro diretamente no Supabase com updated_at mais recente → reabrir aba Estudo → dado puxado e aplicado localmente (LWW remoto vence); alteração local mais recente → sobe para o remoto
**result:** pending (depende da infra)

### 6. Graceful degradation sem Supabase
**expected:** Sem `.env.local` (ou com chaves inválidas), app abre normalmente, marcadores/anotações/planos funcionam localmente, aba Estudo mostra "dados salvos apenas neste aparelho" sem erro de console
**result:** pass (verificado em E2E 2026-08-12)

### 7. Offline → reconexão
**expected:** Criar marcador offline (outbox acumula) → reconectar → flushOutbox envia pendências → conferir no Supabase
**result:** pass (E2E 2026-08-12: registro antigo de Jó 4:2 verde, criado quando a infra não existia, drenou do outbox automaticamente após habilitação)

## Summary

- total: 7
- passed: 6 (Rota 66, marcador push, anotação push, plano push, offline→reconexão, graceful degradation)
- pending: 1 (pull/merge LWW multi-dispositivo — requer 2 aparelhos, mesmo user anônimo)

## Gaps

- **Pull/merge LWW multi-dispositivo:** o teste real exige a mesma conta anônima em 2 aparelhos (o storage anônimo não migra sozinho entre dispositivos — isso depende de uma futura feature de login com email/OAuth). Validação indireta: pull já roda no mount e o flush drenou ops antigas; o merge LWW foi exercitado no código (l.updatedAt > r.updatedAt → push).
- Nota: a prova de RLS por auth.uid() foi confirmada (anon sem sessão JWT recebe `[]`; owner vê os dados).
- **Limitação arquitetural (registrada):** auth anônimo é por dispositivo — dados NÃO seguem o usuário entre aparelhos sem login permanente. Para o multi-dispositivo real, é necessário login com email (usuário permanente) no app.
