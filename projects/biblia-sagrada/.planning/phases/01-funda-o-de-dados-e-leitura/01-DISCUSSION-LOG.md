# Phase 1: Fundação de Dados e Leitura - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-07
**Phase:** 1-Fundação de Dados e Leitura
**Areas discussed:** Leitor lado a lado, Primeira fatia (Walking Skeleton), Dados self-host, Licensing Ledger, Navegação

---

## Leitor lado a lado

| Option | Description | Selected |
|--------|-------------|----------|
| Colunas sincronizadas | 2-3 colunas de traduções selecionáveis, sincronizadas no mesmo âncora de versículo; abre simples (KJV + 1 coluna), usuário adiciona mais. Casamento exato do zoom progressivo + READ-01. | ✓ |
| Abas com troca rápida | Uma tradução por vez em abas, sincronizadas no mesmo versículo. Mais simples, mas comparar exige alternar. | |
| Visão única + alternador | Uma tradução com dropdown/alternador. UI mínima, mas não entrega a comparação visual que é o diferencial. | |

**User's choice:** Colunas sincronizadas
**Notes:** O usuário delegou a escolha ("pode sugerir o melhor") — a opção recomendada foi confirmada.

---

## Leitor — capítulo ou versículo (+ perguntas de profundidade)

| Option | Description | Selected |
|--------|-------------|----------|
| Capítulo inteiro | Capítulo inteiro em cada coluna, com âncora rolando as colunas juntas. Preserva fluência de leitura. | ✓ |
| Versículo assado focado | 1-2 versículos focados por vez, mais limpo para estudo profundo, mas quebra a fluência de leitura. | |

**User's choice:** Capítulo inteiro

---

## Navegação (READ-02)

| Option | Description | Selected |
|--------|-------------|----------|
| URL canônica + links | Rota canônica (/read/:OSIS) + links de referência para saltar/voltar. URL é o estado; back/forward do navegador funciona. 'O âncora move tudo'. | ✓ |
| Estado em memória | Estado em componente sem mudar URL. Mais simples mas perde deep-link e histórico. | |

**User's choice:** URL canônica + links

---

## Primeira fatia (Walking Skeleton)

| Option | Description | Selected |
|--------|-------------|----------|
| 1 livro, 2 traduções | spine → seed → leitor KJV+WEB do mesmo livro sincronizadas. Prova a corrente inteira no caminho mais curto. | ✓ |
| Multi-livro no skeleton | Vários livros traduzidos no skeleton. Prova mais, mas adia a primeira leitura utilizável. | |
| Dado primeiro, leitor mínimo | Foca no dado com UI mínima. Menos risco, mas a prova visual (SC1) fica para o fim. | |

**User's choice:** 1 livro, 2 traduções

---

## Dados self-host

| Option | Description | Selected |
|--------|-------------|----------|
| Corpus completo | 66 livros spine + traduções KJV/ASV/WEB/Almeida completas + originais SBLGNT/OSHB com Strong's, via migrations + seeds idempotentes. | ✓ |
| Originais só NT primeiro | Traduções completas, originais só SNBL para o NT até aqui. Adia parte da SC4. | |
| Recorte por livro | Re-seed necessário depois; custo de migração adiado. | |

**User's choice:** Corpus completo (originais Strong's já na Fase 1, conforme SC4 do roadmap)

---

## Pipeline de seed

| Option | Description | Selected |
|--------|-------------|----------|
| IMPORT pipeline | Ferramenta node/TS que lê fontes (ex. midvash/bible-database) e grava via migrations + seed deterministicamente/reproduzível. Fonte primária fora do DB. | ✓ |
| SQL estático | Migrations SQL brutas com INSERTs gigantes. Simples, mas corpus vira monolito difícil de atualizar. | |
| Seeder reduzido | Adiar seed para execução; deixar só o schema agora. | |

**User's choice:** IMPORT pipeline

---

## Licensing Ledger (DATA-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Ledger data-driven | Tabela canônica de licenças (fonte, status, termos) que alimenta a página /creditos automaticamente + verificação como gate antes do ship. | ✓ |
| Página estática | Página de créditos escrita à mão. Simples, mas fonte de verdade num texto solto. | |
| Ledger + auditoria | Ledger com auditoria por dataset e detalhes. Mais rigoroso que o necessário na Fase 1. | |

**User's choice:** Ledger data-driven

---

## Claude's Discretion

- O usuário delegou a escolha do pacote de decisões ("pode sugerir a melhor"). Todas as opções apresentadas foram as recomendadas e confirmadas sem customização.

## Deferred Ideas

- Nenhum fora de escopo levantado — a discussão permaneceu dentro da Fase 1.
- Originais do AT em profundidade (léxico BDB/Thayer, word-study) bem vocês para a Fase 3 — Fase 1 apenas popula o pipeline com Strong's.