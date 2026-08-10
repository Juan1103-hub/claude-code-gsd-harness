# Bíblia Sagrada

## What This Is

Aplicativo de Bíblia Sagrada gratuito, multiplataforma e 100% offline-first, construído como Progressive Web App (PWA) em Next.js — roda no navegador (web) e pode ser instalado no celular (adicionar à tela inicial), funcionando offline. Oferece múltiplas traduções com troca instantânea, leitura rápida, modo noturno, áudios devocionais, dicionário, planos de leitura, anotações, marcadores coloridos, hinários e estudos em vídeo. Concorre com líderes da Play Store como o app da Mobidic, entregando a palavra de Deus em qualquer lugar, sem custo.

## Core Value

**Carregamento de texto ultra-rápido e leitura confortável (legibilidade + modo noturno), 100% offline, em um app leve (~45MB).** Tudo o mais é secundário; se o leitor não for instantâneo e confortável, o app falha.

## Business Context

- **Customer**: Cristãos leitores de Bíblia no Brasil (público geral Android/iOS)
- **Revenue model**: 100% gratuito (sem ads, sem compras) — prioridade é acessibilidade
- **Success metric**: Downloads + retenção de leitura; avaliação alta nas lojas

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **LEI-01**: Usuário pode ler a Bíblia offline com carregamento de capítulo instantâneo (<200ms)
- [ ] **LEI-02**: Usuário pode trocar entre traduções (ARA, NVI, ARC, KJA, NTLH, NAA) instantaneamente
- [ ] **LEI-03**: Usuário pode navegar por livro, capítulo e versículo
- [ ] **LEI-04**: Usuário pode buscar texto nas traduções baixadas
- [ ] **LEI-05**: Usuário pode ajustar tamanho/tipo de fonte e alternar modo noturno
- [ ] **EST-01**: Usuário pode ouvir devocionais em áudio (streaming)
- [ ] **EST-02**: Usuário pode baixar áudios para ouvir offline
- [ ] **EST-03**: Usuário pode acessar o comentário bíblico "Rota 66" em áudio
- [ ] **EST-04**: Usuário pode consultar dicionário bíblico integrado
- [ ] **EST-05**: Usuário pode usar planos de leitura progressivos com progresso
- [ ] **EST-06**: Usuário pode acessar a seção "O que a Bíblia diz"
- [ ] **PER-01**: Usuário pode marcar versículos com cores diferentes
- [ ] **PER-02**: Usuário pode criar anotações por versículo
- [ ] **PER-03**: Usuário pode acessar hinários (texto)
- [ ] **MUL-01**: Usuário pode assistir estudos em vídeo (linkados/embarcados)
- [ ] **OFF-01**: App inicial ~45MB com traduções principais embarcadas
- [ ] **OFF-02**: Traduções adicionais baixáveis sob demanda
- [ ] **SYN-01**: Usuário pode sincronizar dados de estudo na nuvem (opcional, Supabase)

### Out of Scope

- Traduções pagas/com direitos autorais (NVI, NAA, KJA, NTLH) até licença ser obtida — risco legal
- Login obrigatório — app usável sem conta
- Publicidade e monetização — decisão estratégica
- Versões com licença comercial (ARA é domínio público; ACF/ARC livres)
- Modo fórum/rede social — fora do escopo de leitura

## Context

- Stack definida: Next.js + React + TypeScript + Tailwind (PWA). Decisão do usuário: app web que abre em celular, sem instalar Flutter/Android SDK (sem espaço em disco).
- Armazenamento offline: IndexedDB (com lib leve) para textos, cache do Service Worker para assets; FTS no navegador para busca
- Usuário é vibe coder: não define specs formais, decisões técnicas delegadas ao agente
- Pesquisa 2026 confirmou: DBs SQLite separados por tradução baixados sob demanda como .zip é o padrão offline-first premiado (al_hadith); `bible_parser_flutter` gera DBs a partir de XML OSIS/USFX; FTS5 + trigram tokenizer para busca em milhões de versículos; `sqlite_async` (WAL, pool de conexões em isolates) otimiza performance vs sqflite puro
- Domínio público: ACF, ARC são livres. ARA (SBB) tem restrições — verificar licenciamento
- Concorrente: app Mobidic como referência de feature set

## Constraints

- **Tech**: Next.js + React + TypeScript + Tailwind (PWA) — roda na web e é instalável no celular, sem Flutter/Android SDK (decisão do usuário por falta de espaço em disco)
- **Performance**: capítulo carregado em <200ms; troca de tradução instantânea — dados em IndexedDB + cache Service Worker
- **Tamanho**: ~45MB equivalente inicial — apenas 1-2 traduções embarcadas, áudio zero no bundle
- **Custo**: código aberto + camadas gratuitas (Vercel free tier, Supabase free tier) — sem custos fixos
- **Legal**: apenas conteúdo sem direitos autorais no MVP (ACF/ARC); traduções pagas exigem licença
- **UX**: legibilidade e modo noturno prioritários; design minimalista, sem poluição

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA Next.js + IndexedDB (em vez de Flutter) | Usuário não pode instalar Flutter/Android SDK (sem espaço); web abre no PC e no celular | Decided (2026-08-10) |
| Traduções livres (ACF/ARC) no MVP | Evita risco legal de copyright; publicável grátis | — Pending |
| Textos baixados sob demanda (IndexedDB) | App leve (~45MB), controle de armazenamento, atualização sem novo build | — Pending |
| Busca FTS no navegador | Busca instantânea em milhões de versículos | — Pending |
| PWA instalável + offline (Service Worker) | Funciona offline no celular sem loja de apps | — Pending |
| Bundle zero áudio | Mantém leve; áudio baixável por demanda | — Pending |
| Supabase para sync opcional | Sincronização de estudo sem infraestrutura própria | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-10 after initialization*
