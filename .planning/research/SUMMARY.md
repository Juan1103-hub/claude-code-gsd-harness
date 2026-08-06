# Project Research Summary

**Project:** Estudo Bíblico Profundo (Deep Bible Study)
**Domain:** deep Bible study web platform (multi-version reader, original-language study, notes, collaboration, AI)
**Researched:** 2026-08-06
**Confidence:** HIGH

## Executive Summary

Este é um produto de "deep study" de Bíblia — o oposto de um leitor simples. A tese central, validada contra Logos/Olive Tree/BLB/Bible Hub, é que o problema nº1 do mercado é **sobrecarga** ("Logos é imenso/intimidador") e que a diferenciação vencedora é **anti-overwhelm + conexões**: uma experiência de "zoom progressivo" onde o app abre simples e o usuário puxa camadas de profundidade (originais, léxico, cronologia) sob demanda, com um modelo de dados de conexões (relações entre versículos, temas, categorias) que nenhum reader simples tem.

A aposta de engenharia P0 é uma **camada de dados de originais com tags Strong por palavra** — interlinear, léxico, concordância, transliteração, âncoras de notas, busca semântica e grounding de IA compõem sobre ela. Essa camada deve ser o comprometimento de engenharia da Fundação/Fase 1. A outra costura é o **"spine" de ID de versículo imutável e canônico** — uma vez resolvido "qual o id de João 3:16", tudo (traduções, interlinear, mapas, notas) se ancora nele.

Os riscos-chave: **licenciamento** ("public domain" não é uniforme — KJV é só-EUA, packaging editorial tem copyright separado), **imparcialidade da IA** (é problema de design de sistema: moderação independente + citações, jamais modelo-base apenas) e **PWA** (proibido carregar o dataset inteiro no boot — cache tiered lazy).

## Key Findings

### Recommended Stack

Stack moderna e verificada: **Next.js 16** (15 está EOL em 2026-10), React 19, TypeScript 5.x, Tailwind v4, shadcn/ui 4.16. Dados: **Supabase + TanStack Query v5**, busca via Postgres FTS nativo (tsvector GIN + pg_trgm + unaccent; pgvector adiado para a fase de IA). Editor de notas **Tiptap 3.29**, mapas **react-leaflet + OSM** (zero-key), PWA por **Serwist** + **IndexedDB** (`idb`) com cache read-through imutável + outbox local-first synced ao Supabase. Feature data cache para os originais via `@supabase-cache-helpers`.

**Textos originais:** **SBLGNT** (grego, CC BY 4.0) + morphgnt e **OpenScriptures OSHB/WLC + morphhb** (hebraico, CC BY 4.0). Evitar **NA28** e **Westminster Hebrew Morphology** (restritos comercialmente). As textuais públicas (KJV-US, ASV, WEB, BSB, Almeida antiga) self-hospiladas — nunca runtime dependency de um full Bible.

### Expected Features

**Deliverables (de FEATURES.md):** a delta vs YouVersion é a superfície por-versículo com tap-to-word → Strong → lemma → parsing → léxico → outras ocorrências → cross-reference → jump-and-back. É o campo de provas organizador do produto.

**Must have (table stakes):** leitura multi-tradução lado a lado; busca (assunto/de versículo); originais + transliteração + léxico; referências cruzadas; notas/destaques ancorados por versículo; offline básico; import/export de notas.

**Should have (competitiva / diferencial):** estudo de versículo profundo (dossier: contexto histórico/cultural/geográfico/arqueológico), modo por tema com conexão automática, timeline visual, mapas interativos, estudo em grupos/compartilhamento, ferramentas de criação (sermão/estudo/devocional).

**Defer (v2+):** AI-as-teacher com fontes (EST-13), morf forsência completa do expert, anti-overwhelm como fundação de UX (é Princípio, não tagline). Antialias: feed social, gamificação/streaks, ads, lock-in comercial.

**Anti-features (deliberadamente NÃO construir):** feed social/algorthmic home, gamification streaks, ads/paywall no leitor, lock-in de tradução comercial no v1, tiragem de IA sem fontes / "one true answer".

### Architecture Approach

- **Spine composable:** todos os features ancoram num ID de versículo imutável e canônico (livro, capítulo, versículo) + índice Strong.
- **Referência vs dados de usuário separados fisicamente:** textos/léxico/mapas imutáveis e comuns → servidos read-only, cache agressivo e offline; notas/destaques/estudos por-usuário → linhas Supabase RLS-chaveadas no spine.
- **Zoom progressivo = code-splitting:** superfície (1 tradução) sempre carregada; interlinear/léxico/mapas/timeline como módulos lazy keyed por versículo, expandidos on demand, pré-buscados idle-test no IndexedDB. Não emitir deep panes no chunk do reader.
- **PWA tiered:** texto sempre em cache (Cache API); léxico/concordância = dezenas de MB on-access; interlinear + mapas 50–150 MB via "instalar dados de estudo" explícito em IndexedDB.
- **Anhora intra-versículo por token estável (índice Strong's), não por string mutável** — senão âncoras de destaque/nota drifftam quando a tradução é corrigida.

### Critical Pitfalls

1. **Licenciamento é o maior e menos visível risco.** "Public domain" não é categoria única: KJV é só EUA (Crown UK); packaging editorial (notas, TSK, mapas) tem copyright separado da tradução; CC-NC não pode monetizar. → **Licensing Ledger + página de créditos como gate da Fase 1.**
2. **Imparcialidade da IA é design de sistema, não prompt** — pesquisas (precision 0.80–0.86, recall 0.42–0.56; lean evangelical nos chatbots) exigem professor de teologia tradition-explicit com citações + camada de moderação independente. Política de imparcialização na fundação de dados; eval-harness na fase AI pós-v1.
3. **PWA morre se dataset inteiro carregar no boot** — 20MB+; lazy per-book + Índice em memória. (BLB's 3-min "initialize resources" é o contra-exemplo.)
4. **Dados de originais são community-owned, não authoritativo** — Strong's, MorphGNT vs Nestle-1904, versificação diferem entre sources; léxemas conflacionados escondem erros. → reconciliação contra segunda source + marcador "possível" honesto na UI.
5. **Notas precisam de grafo com refs canônicas, export/import no v1 e sync confiável** — lock-in e falha de sync são breach de confiança (BLB é o contra-exemplo).
6. **"Zoom progressivo" não pode ser tagline** — panel-layering e persona defaults DEVEM ship na primeira vertical slice, senão novatos (overwhelmed) e teólogos (capped) chrunem.

## Implications for Roadmap

- **Fase 1 = espínea + pipeline de dados + gate de licenças** (não a UI). Modelar schema canônico scripture/lexicon + importadores (OSIS/XML) antes de qualquer tela. Licença ledger e ID canônico são gates duros.
- **Fase 2 = slice vertical de versículo profundo** (EST-01/02/03/04/09): leitura paralela + interlinear + dossier por-versículo + crossrefs + notas âncora de palavra + busca + zoom-progressivo + offline. É a prova de validade do v1.
- **Fase 3 = Personalização + Colaboração** (word-anchor, categorias, grupos/grupos pequenos — comprometer polserlink de merge PRIMEIRO, criação de estudos, modo temático, smart search).
- **Fase 4 = stairway de alto custo adiado** (mapas + timeline; AI-as-teacher) — alavancado e risk-separated, com tradition-explicit eval-harness desenhado na fundação.
- A camada de originais com Strong's tag (P0), o spine canônico e o ledger de licenças são o compromisso de engenharia da Fase 1.

## Sources

- midvash/bible-data, OpenScriptures OSHB/morphhb, SBLGNT/morphgnt, STEPBible, Groves Center/licensing
- Blackwell/Springer 2026, Bible Society/Cambridge CCCT 2026, LegalClarity 2026 (licensing)
- CrossWire, Tauber MorphGNT (data quality)
- web.dev / Edge PWA local-first references, react-leaflet, Serwist, TipTap, supabase docs