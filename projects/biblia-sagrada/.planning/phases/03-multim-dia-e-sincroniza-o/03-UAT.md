---
status: pending
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
**result:** pending (depende da infra)

### 3. Sincronização de anotação (push)
**expected:** Criar anotação → conferir que `text` aparece na linha study_records correspondente
**result:** pending (depende da infra)

### 4. Sincronização de progresso de plano (push)
**expected:** Marcar dia concluído no plano → conferir `plan_progress` com completed_days atualizado
**result:** pending (depende da infra)

### 5. Pull (outro dispositivo / merge LWW)
**expected:** Com a conta anônima ativa, alterar um registro diretamente no Supabase com updated_at mais recente → reabrir aba Estudo → dado puxado e aplicado localmente (LWW remoto vence); alteração local mais recente → sobe para o remoto
**result:** pending (depende da infra)

### 6. Graceful degradation sem Supabase
**expected:** Sem `.env.local` (ou com chaves inválidas), app abre normalmente, marcadores/anotações/planos funcionam localmente, aba Estudo mostra "dados salvos apenas neste aparelho" sem erro de console
**result:** pass (verificado em E2E 2026-08-12)

### 7. Offline → reconexão
**expected:** Criar marcador offline (outbox acumula) → reconectar → flushOutbox envia pendências → conferir no Supabase
**result:** pending (depende da infra)

## Summary

- total: 7
- passed: 2 (Rota 66 + graceful degradation)
- pending: 5 (dependem da infra no dashboard)

## Gaps

- Infra: auth anônimo + migration não executadas no dashboard Supabase (aguardando usuário).
