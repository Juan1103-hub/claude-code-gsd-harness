# STATE: Bíblia Sagrada

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Carregamento de texto ultra-rápido e leitura confortável, 100% offline, app leve (~45MB)
**Current focus:** Phase 1 — Fundação do Leitor (not started)

## Current State

- Projeto inicializado: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md criados
- Decisão registrada: traduções livres (ACF/ARC) no MVP; pagas dependem de licença
- Stack decidida: Next.js + TypeScript + Tailwind (PWA) + IndexedDB + Supabase (sync opcional)
  - Mudança de arquitetura: originalmente Flutter; usuário optou por web (sem espaço em disco para Flutter/Android SDK)
- Plataforma inicial: Android primeiro (via PWA instalável no celular)
- Nenhum código implementado ainda

## Next Action

- Executar /gsd-plan-phase 1 para planejar a Fase 1 (Fundação do Leitor)

## Decisions

| Decision | Status |
|----------|--------|
| Traduções livres (ACF/ARC) no MVP | Registered |
| PWA Next.js + IndexedDB (em vez de Flutter) | Registered |
| Android primeiro (PWA instalável no celular) | Registered |
| Dados baixados sob demanda (IndexedDB) | Registered |
