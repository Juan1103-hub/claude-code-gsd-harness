# Decisões de Projeto - Bíblia Sagrada

## 2026-08-12 - NTLH adicionada como tradução baixável (decisão do usuário, ALERTA DE LICENÇA)
- **Decisão**: Adicionar **Nova Tradução na Linguagem de Hoje (NTLH)** como 4ª tradução, baixável sob demanda (padrão BLIVRE: embarcada no build, FORA do precache, baixa para IndexedDB). Fonte: SQLite extraído do APK `biblia-sagrada-ntlh-1-7-11` (Flutter) via `scripts/extract-ntlh.mjs` → `data/raw/NTLH.json` (66 livros, 30.307 versículos) → pipeline `generate-data.mjs` + `search-build.mjs`.
- **⚠️ ALERTA DE LICENÇA**: A NTLH é **© Sociedade Bíblica do Brasil (SBB) — direitos reservados** (metadata do próprio SQLite: `copyright: 'Nova Tradução na Linguagem de Hoje - 1988', permissions: 'SBB'`). Isto é uma decisão explícita do usuário (produto), registrada aqui para ciência do risco legal ao publicar/distribuir o app. Fora do precache para não inflar o bundle; acesso condicionado ao download manual (sem redistribuição automática).
- **Justificativa**: Usuário pediu explicitamente o uso da NTLH (baixou o APK e solicitou a integração); foco na entrega técnica solicitada.
- **Status**: Implementado. `SUPPORTED_VERSIONS` + `BibleVersionMeta.downloadable` generalizam o fluxo antes hardcoded de BLIVRE.

## 2026-08-10 - TASK 01-02: Pipeline de dados e cache offline (implementado)
- **Decisão**: Dados brutos (JSON domínio público) ficam em `data/raw/` (gitignored); `scripts/generate-data.mjs` gera formato compacto em `public/data/` (index.json + 1 arquivo JSON por livro/tradução, versículos `.trim()`). `dataVersion` = hash MD5 do conteúdo (estável entre gerações idênticas). Precache completo de `/data/` no Service Worker (2 Bíblias ~5MB) via `additionalPrecacheEntries` com URLs normalizadas `\ → /` (fix Windows). Cache runtime em IndexedDB (store `chapters` keyPath `[version, book, chapter]`), invalidação por `dataVersion`, carga sob demanda com fetch único por livro, mutex na transição de versão e dedup de cargas concorrentes. `prebuild` garante dados antes de `next build`.
- **Justificativa**: Precache integral é barato no orçamento de ~45MB e garante offline-first imediato; IndexedDB evita re-fetch a cada leitura e permite invalidar por versão de build.
- **Status**: Implementado. Code review: APROVADO COM RESSALVAS (1 P2 + 9 P3) — todas corrigidas.

## 2026-08-10 - CORREÇÃO LEGAL: Traduções embarcadas no MVP (substitui ACF/ARC)
- **Decisão**: Usar **Almeida 1911 (ALM1911)**, **Tradução Brasileira (TB)** e **Bíblia Livre (BLIVRE)** como traduções iniciais — as únicas confirmadas como **domínio público** (†) no catálogo damarals/biblias (licença MIT no repositório, textos sem direito autoral).
- **Justificativa**: Pesquisa confirmou que ACF (1994, SBTB) e ARC (1995, SBB) **têm direitos autorais de suas editoras** — risco legal real de redistribuir em app público. A regra "apenas conteúdo sem copyright" do MVP exige troca. Escolha inicial: ALM1911 (português arcaico, fiel) + TB (domínio público desde 2010, leitura moderna). BLIVRE disponível como 3ª opção.
- **Status**: Corrige decisão anterior "ACF/ARC livres" (incorreta). Atualiza REQUIREMENTS/ROADMAP.

## 2026-08-10 - Mudança de Stack: PWA Next.js (substitui Flutter)
- **Decisão**: Substituir Flutter/SQLite nativo por Progressive Web App (PWA) em Next.js + React + TypeScript + Tailwind. Dados em IndexedDB; cache offline via Service Worker. Flutter/Android SDK não cabem no disco da máquina de desenvolvimento (11GB livres). App roda na web e é instalável no celular ("Adicionar à tela inicial"), funcionando offline.
- **Justificativa**: Decisão do usuário — sem espaço para Flutter/Android SDK. A stack web atende multiplataforma (web + celular) e é a padrão deste harness. O primeiro target é Android via PWA instalável.

## 2026-08-10 - Definição de Stack Tecnológica (original, substituída acima)
- **Decisão**: Utilizar Flutter para desenvolvimento multiplataforma (Android e iOS) e SQLite para o banco de dados local. Supabase será usado para sincronização opcional na nuvem.
- **Justificativa**: Flutter oferece performance quase nativa, um único codebase e controle pixel-perfect da UI, crucial para a experiência de leitura. SQLite é a solução mais madura e performática para DBs embarcados offline-first. Supabase fornece uma camada gratuita generosa e robusta para backend/sincronização.
- **Status**: SUBSTITUÍDA em 2026-08-10 pela decisão de PWA Next.js (ver acima).

## 2026-08-10 - Estrutura Inicial do Banco de Dados
- **Decisão**: Implementar o esquema de banco de dados SQLite conforme detalhado no `PROJECT.md`, com foco em índices compostos (`idx_verse_lookup`, `idx_chapter_lookup`) na tabela `Verses` para garantir carregamento ultra-rápido de texto.
- **Justificativa**: A performance do carregamento de texto é a prioridade #1. A indexação agressiva é essencial para evitar lentidão em queries de milhões de versículos.

## 2026-08-10 - Estratégia de Tamanho do Aplicativo (45MB)
- **Decisão**: O bundle inicial do aplicativo conterá apenas 1-2 traduções da Bíblia (ARA, NVI) empacotadas em SQLite. Traduções adicionais e todos os arquivos de áudio serão baixados sob demanda pelo usuário.
- **Justificativa**: Para cumprir a restrição de 45MB de tamanho inicial do aplicativo, é imperativo que apenas o conteúdo essencial venha pré-instalado. Isso permite um download inicial rápido e dá controle ao usuário sobre o armazenamento.

## 2026-08-10 - Foco em UX/UI: Legibilidade e Modo Noturno
- **Decisão**: Priorizar a legibilidade do texto e a implementação de um modo noturno bem projetado desde a prototipação. A interface deve ser minimalista, evitando designs poluídos.
- **Justificativa**: Como um aplicativo de leitura, a experiência do usuário depende criticamente da facilidade de leitura e do conforto visual, especialmente em ambientes com pouca luz.

## 2026-08-10 - Modelo de Negócio: Totalmente Gratuito
- **Decisão**: O aplicativo será totalmente gratuito, sem compras no aplicativo ou anúncios intrusivos.
- **Justificativa**: Alinhado ao objetivo de tornar a palavra de Deus acessível a todos, em qualquer lugar, sem barreiras financeiras ou distrações comerciais.
