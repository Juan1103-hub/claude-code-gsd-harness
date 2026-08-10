# Decisões de Projeto - Bíblia Sagrada

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
