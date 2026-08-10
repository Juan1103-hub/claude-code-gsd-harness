# Roadmap: Bíblia Sagrada

## Overview

Do zero a um app de Bíblia offline-first competitivo. Fase 1 entrega a fundação: projeto Flutter, banco de dados SQLite com traduções livres (ACF/ARC) embarcadas e leitor rápido com tema dia/noturno. Fase 2 adiciona troca de traduções, busca, estudo e personalização. Fase 3 completa com áudio offline, vídeos e sincronização. Granularidade coarse: 3 fases, entregas coerentes por fase.

## Phases

- [ ] **Phase 1: Fundação do Leitor** - Projeto Flutter, DB SQLite com ACF/ARC, leitor de capítulos instantâneo, tema dia/noturno, fonte ajustável
- [ ] **Phase 2: Estudo e Personalização** - Troca de traduções, busca FTS5, dicionário, planos de leitura, "O que a Bíblia diz", marcadores, anotações, hinários
- [ ] **Phase 3: Multimídia e Sincronização** - Áudio streaming+offline (devocionais, Rota 66), vídeos, sync Supabase

## Phase Details

### Phase 1: Fundação do Leitor
**Goal**: App Bíblia funcional offline com leitura rápida de 1-2 traduções livres, tema dia/noturno e fonte ajustável
**Depends on**: Nothing (first phase)
**Requirements**: LEI-01, LEI-03, LEI-05, LEI-06, OFF-01
**Success Criteria** (what must be TRUE):
  1. Usuário abre o app e lê Gênesis 1 instantaneamente, sem internet
  2. Usuário navega entre livros e capítulos sem travamento
  3. Usuário alterna modo noturno/dia e muda tamanho de fonte, mantendo leitura fluida
  4. App compilado Android pesa ~45MB com traduções embarcadas
  5. Capítulo carrega em <200ms (medido)
**Plans**: 3 plans

Plans:
- [ ] 01-01: Scaffold Flutter + estrutura do projeto
- [ ] 01-02: Pipeline de dados SQLite (gerar DBs ACF/ARC via parser, embarcar, indexes)
- [ ] 01-03: Leitor de capítulos com tema e configurações de fonte

### Phase 2: Estudo e Personalização
**Goal**: App com troca de traduções, busca, dicionário, planos, marcadores, anotações e hinários
**Depends on**: Phase 1
**Requirements**: LEI-02, LEI-04, EST-04, EST-05, EST-06, PER-01, PER-02, PER-03, OFF-02
**Success Criteria** (what must be TRUE):
  1. Usuário troca de tradução no mesmo capítulo sem recarregar visivelmente
  2. Usuário busca palavra e encontra versículos em <1s
  3. Usuário marca versículo com cor e cria anotação, ambas persistidas
  4. Usuário consulta dicionário, usa plano de leitura com progresso e acessa "O que a Bíblia diz"
  5. Usuário baixa tradução adicional sob demanda e lê offline
**Plans**: 3 plans

Plans:
- [ ] 02-01: Troca de traduções + download sob demanda
- [ ] 02-02: Busca FTS5 + dicionário + "O que a Bíblia diz"
- [ ] 02-03: Marcadores, anotações, hinários, planos de leitura

### Phase 3: Multimídia e Sincronização
**Goal**: Áudio devocional (streaming+offline), Rota 66, vídeos e sync opcional Supabase
**Depends on**: Phase 2
**Requirements**: EST-01, EST-02, EST-03, MUL-01, OFF-03, SYN-01
**Success Criteria** (what must be TRUE):
  1. Usuário ouve devocional em streaming e baixa para ouvir offline
  2. Usuário acessa comentário "Rota 66" em áudio
  3. Usuário assiste estudo em vídeo embarcado/linkado
  4. Usuário sincroniza marcadores/anotações/progresso via conta opcional
  5. Áudio baixado funciona sem internet
**Plans**: 2 plans

Plans:
- [ ] 03-01: Player de áudio streaming + download offline
- [ ] 03-02: Vídeos + sync Supabase

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação do Leitor | 0/3 | Not started | - |
| 2. Estudo e Personalização | 0/3 | Not started | - |
| 3. Multimídia e Sincronização | 0/2 | Not started | - |
