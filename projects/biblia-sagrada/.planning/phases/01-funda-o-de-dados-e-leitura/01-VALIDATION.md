---
phase: 1
slug: fundacao-de-dados-e-leitura
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (harness standard; Next.js 16 + TS) |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `cd projects/<nome> && npm test` |
| **Full suite command** | `cd projects/<nome> && npm run test:ci` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd projects/<nome> && npm test`
- **After every plan wave:** Run `cd projects/<nome> && npm run test:ci`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

*(Preenchido pelo planner ao criar os PLAN.md — tabela-tarefa mapeia cada task a seu teste/verificação.)*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | DATA-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `projects/<nome>/vitest.config.ts` — test runner config (installs at execution)
- [ ] `projects/<nome>/tests/` — shared fixtures (spine reference, sample verses)
- [ ] vitest install — if no framework detected at execution

*Viável: READING engine + seed pipeline validáveis automatizadamente; visualização multi-coluna e zoom progressivo via manual-only (backstop UI).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Colunas sincronizadas no mesmo âncora (scroll + URL) | READ-01 / READ-02 | Interação visual/multi-coluna sincronizada por rolagem e navegação | Abrir `/read/:OSIS` com 2+ colunas, rolar, clicar com referência interno e conferir volta (back) |
| Zoom progressivo (abre simples, adiciona coluna) | UX-01 | Sensação anti-overwhelm — decide visual, não lógica | Abrir o leitor, conferir que abre com poucas colunas e que "Adicionar tradução" expande |
| Créditos refletindo o ledger | DATA-05 | Página de créditos renderiza a tabela canônica de licenças | Abrir `/creditos` e comparar com a tabela ledger (fonte/status/termos) |
| Long verses (Salmo 119) reflow sem truncar | READ-01 | Comportamento tipográfico responsiva | Abrir Salmo 119 em 320/375/414px widths |

*Backstop checks (2) do UI-SPEC — long-text e jump-and-back — são Manbornal.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending