# Phase 2: Estudo e Personalização - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-11
**Phase:** 2-Estudo e Personalização
**Areas discussed:** Troca de traduções, Download sob demanda (BLIVRE), Busca FTS, Marcadores e anotações, Dicionário, Hinários, Planos de leitura, "O que a Bíblia diz"

---

## Seleção de áreas

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Troca de traduções | Seletor, URL, BLIVRE | ✓ |
| Busca (LEI-04) | Motor FTS, escopo, resultado | ✓ |
| Marcadores e anotações | Cores, persistência, listagem | ✓ |
| Conteúdo de estudo | Dicionário, planos, hinários, "O que a Bíblia diz" | ✓ |

**User's choice:** "pode seguir o que e mais prudente e viavel" — delegação de escolha ao agente; todas as áreas selecionadas. Perguntas sempre em pt-BR.

---

## Troca de traduções

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Seletor + URL | Menu no header, persistência localStorage, tradução na URL (?v=tb) | ✓ |
| Só seletor, sem URL | Troca em memória/localStorage; URL só com livro/capítulo | |
| Colunas lado a lado | 2 traduções simultâneas (divergente do leitor single-column) | |

**User's choice:** Seletor + URL (Recomendado)
**Notes:** reader.tsx hoje usa `VERSION = "tb"` fixo; troca deve acontecer no mesmo capítulo sem recarregar visivelmente (SC1).

---

## Download sob demanda (BLIVRE / OFF-02)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Baixar sob demanda | BLIVRE gerada no pipeline, app baixa quando online, salva em IndexedDB, soma ao índice | ✓ |
| Embarcar BLIVRE no build | Mais simples, ~4MB; não atende OFF-02 | |
| Adiar OFF-02 | Só troca ALM1911/TB | |

| Opção (origem) | Descrição | Selected |
|-------|-----------|----------|
| BLIVRE no build, fora do precache | Embarcada mas não precacheada; baixa p/ IndexedDB quando online | ✓ |
| Origem externa (URL remota) | GitHub raw/Vercel; flexível mas depende de rede/terceiro | |
| Não incluir BLIVRE agora | Adiar | |

**User's choice:** Baixar sob demanda + BLIVRE no build, fora do precache (Recomendado)
**Notes:** `collectPublicFiles()` deve excluir BLIVRE do precache.

---

## Busca FTS (LEI-04)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Índice pré-computado | Pipeline gera índice FTS (MiniSearch/FlexSearch), embarcado; busca instantânea offline | ✓ |
| Indexar no cliente | Indexa capítulos do IndexedDB na primeira busca (mais lento) | |

| Opção (formato) | Descrição | Selected |
|-------|-----------|----------|
| Resultado por versículo + navegação | Contexto, destaque, clique navega p/ capítulo; escopo = tradução selecionada | ✓ |
| Lista enxuta | Só refs com contagem, sem trecho | |
| Busca multi-tradução | Todas traduções simultaneamente com filtro | |

**User's choice:** Índice pré-computado + Resultado por versículo com navegação (Recomendado)
**Notes:** FTS no navegador <1s em todas as traduções baixadas (SC2).

---

## Marcadores e anotações (PER-01/02)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Tap no versículo + 5 cores | Versículo clicável abre painel (cores + anotar); IndexedDB store novo com id/ref/cor/texto/updatedAt | ✓ |
| Só anotação | Sem paleta | |
| Painel dedicado de estudo | Interface mais elaborada, reuso Fase 3 | |

**User's choice:** Tap no versículo + 5 cores (Recomendado)
**Notes:** Dados desenhados para sync na Fase 3 (updatedAt, id estável).

---

## Dicionário (EST-04)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| Curto p/ fase | ~200-300 verbetes curados (nomes próprios + termos-chave) | ✓ |
| Completo (Smith's) | Dicionário completo de domínio público — grande | |
| Mínimo | UI + esquema só | |

**User's choice:** Curto p/ fase (Recomendado)
**Notes:** Expandir em fase futura.

---

## Hinários (PER-03)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| 1 hinário, ~50 hinos | Hinário de domínio público em português, curado | ✓ |
| Adiar PER-03 | Só estrutura | |
| Múltiplos | Vários hinários completos | |

**User's choice:** 1 hinário, ~50 hinos (Recomendado)

---

## Planos de leitura (EST-05)

| Opção | Descrição | Selected |
|-------|-----------|----------|
| 2 planos fixos | "Bíblia em 1 ano" + "Novo Testamento em 90 dias"; progresso local IndexedDB | ✓ |
| 1 plano | Mais simples | |
| Configurável | Planos criados pelo usuário (mais trabalho) | |

**User's choice:** 2 planos fixos (Recomendado)

---

## Claude's Discretion

- Usuário delegou a escolha de áreas ("pode seguir o que e mais prudente e viavel") — todas as 4 áreas foram selecionadas e discutidas.
- Detalhes técnicos (componentização, schema do store, composição do índice FTS, exclusão de BLIVRE do precache) ficam para researcher/planner.

## Deferred Ideas

- Dicionário completo (Smith's) — fase futura.
- Múltiplos hinários — fase futura.
- Planos configuráveis — fase futura.
- Áudio, Rota 66, vídeos, sync Supabase — Fase 3.
