# Roadmap: Bíblia Sagrada

## Overview

Do zero a um app de Bíblia offline-first competitivo. Fase 1 entrega a fundação: projeto Next.js PWA, texto das traduções de domínio público (Almeida 1911, Tradução Brasileira) em IndexedDB e leitor rápido com tema dia/noturno. Fase 2 adiciona troca de traduções, busca, estudo e personalização. Fase 3 completa com áudio offline, vídeos e sincronização. Granularidade coarse: 3 fases, entregas coerentes por fase.

## Phases

- [x] **Phase 1: Fundação do Leitor** - Projeto Next.js PWA, dados Almeida 1911 + Tradução Brasileira em IndexedDB, leitor de capítulos instantâneo, tema dia/noturno, fonte ajustável (completed 2026-08-11)
- [ ] **Phase 2: Estudo e Personalização** - Troca de traduções, busca FTS, dicionário, planos de leitura, "O que a Bíblia diz", marcadores, anotações, hinários
- [ ] **Phase 3: Multimídia e Sincronização** - Áudio streaming+offline (devocionais, Rota 66), vídeos, sync Supabase

## Phase Details

### Phase 1: Fundação do Leitor

**Goal**: App Bíblia funcional offline com leitura rápida de 1-2 traduções livres, tema dia/noturno e fonte ajustável
**Depends on**: Nothing (first phase)
**Requirements**: LEI-01, LEI-03, LEI-05, LEI-06, OFF-01
**Success Criteria** (what must be TRUE):

  1. Usuário abre o app (web e/ou instalado no celular) e lê Gênesis 1 instantaneamente, sem internet
  2. Usuário navega entre livros e capítulos sem travamento
  3. Usuário alterna modo noturno/dia e muda tamanho de fonte, mantendo leitura fluida
  4. PWA instalável, com dados embarcados e cache offline funcionando (desconecta e continua lendo)
  5. Capítulo carrega em <200ms (medido)

**Plans**: 3 plans

Plans:

- [x] 01-01: Scaffold Next.js PWA + estrutura do projeto
- [x] 01-02: Pipeline de dados (gerar JSON Almeida 1911 + Tradução Brasileira via parser, embarcar, popular IndexedDB)
- [x] 01-03: Leitor de capítulos com tema e configurações de fonte

### Phase 2: Estudo e Personalização

**Goal**: App com troca de traduções, busca, dicionário, planos, marcadores, anotações e hinários
**Depends on**: Phase 1
**Requirements**: LEI-02, LEI-04, EST-04, EST-05, EST-06, PER-01, PER-02, PER-03, OFF-02
**Success Criteria** (what must be TRUE):

  1. Usuário troca de tradução no mesmo capítulo sem recarregar visivelmente
  2. Usuário busca palavra e encontra versículos em <1s (FTS no navegador)
  3. Usuário marca versículo com cor e cria anotação, ambas persistidas
  4. Usuário consulta dicionário, usa plano de leitura com progresso e acessa "O que a Bíblia diz"
  5. Usuário baixa tradução adicional sob demanda e lê offline

**Plans**: 3/3 plans executed

Plans:

- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md

**Wave 1**

- [x] 02-01: Troca de traduções + download sob demanda

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02: Busca FTS + dicionário + "O que a Bíblia diz"

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03: Marcadores, anotações, hinários, planos de leitura

### Phase 3: Multimídia e Sincronização

**Goal**: Sincronização opcional Supabase e Rota 66 (escopo aprovado 12/08/2026 — áudio abortado, vídeos não selecionados)
**Depends on**: Phase 2
**Requirements**: EST-03, SYN-01
**Success Criteria** (what must be TRUE):

  1. Marcador/anotação/progresso sincroniza com Supabase via auth anônimo (local-first, outbox, LWW)
  2. App funciona 100% sem Supabase configurado (graceful degradation)
  3. Usuário acessa a seção "Rota 66" com link para o podcast oficial da RTM

**Plans**: 1 plan

Plans:

- [x] 03-01: Sync Supabase (outbox LWW) + Rota 66 (código pronto; infra dashboard pendente)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação do Leitor | 1/1 | Complete    | 2026-08-11 |
| 2. Estudo e Personalização | 3/3 | Complete   | 2026-08-11 |
| 3. Multimídia e Sincronização | 1/1 | In Progress | - (código pronto; aguardando infra dashboard) |
