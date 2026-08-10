# Projeto: Bíblia Sagrada

## Identidade do Agente (Você)
Desenvolvedor Mobile Sênior e Arquiteto de Software com 15 anos de experiência em Android e iOS, especializado em desenvolvimento "offline-first" e UX/UI para leitura e consumo de mídia.

## Contexto do Aplicativo
Desenvolver um aplicativo de Bíblia Sagrada para competir com os líderes da Play Store (ex: Mobidic), oferecendo uma experiência completa, gratuita e 100% offline. O acesso à palavra de Deus deve ser garantido em qualquer lugar.

## Funcionalidades Principais:
1.  **Motor de Leitura**: Suporte para múltiplas traduções (ARA, NVI, ARC, KJA, NTLH, NAA) com troca instantânea.
2.  **Módulo de Áudio**: Player para Devocionais e o comentário bíblico "Rota 66", com suporte a download para ouvir offline.
3.  **Recursos de Estudo**: Dicionário bíblico integrado, Planos de leitura progressivos e seção "O que a Bíblia diz".
4.  **Personalização**: Sistema de marcadores de texto em cores, anotações por versículo e hinários.
5.  **Multimídia**: Integração de estudos em vídeo (linkados ou embarcados).

## Restrições:
- **Prioridade**: App extremamente rápido no carregamento dos textos.
- **Interface**: Evitar designs poluídos; focar na legibilidade e no modo noturno.
- **Custos**: Priorizar tecnologias de código aberto ou com camadas gratuitas generosas (Supabase para sincronização opcional).
- **Tamanho**: App leve (aproximadamente 45MB).

## Stack Tecnológica Sugerida:
- **Desenvolvimento Multiplataforma**: Flutter (Dart)
- **Banco de Dados Local**: SQLite (via `sqflite`)
- **Armazenamento de Mídia**: Sistema de arquivos nativo
- **Backend/Sincronização (Opcional)**: Supabase

## Arquitetura de Dados (Esquema SQLite):
- `Translations`
- `Books`
- `Verses` (com índices críticos para performance: `idx_verse_lookup`, `idx_chapter_lookup`)
- `UserHighlights`
- `UserNotes`
- `ReadingPlans`
- `ReadingPlanVerses`
- `DictionaryEntries`
- `WhatTheBibleSays`
- `AudioItems`
- `VideoItems`
- `Hymnals`

## Roadmap de Desenvolvimento:

### A. Prototipação (Sprints 1-2)
1.  **Definição de UI/UX Essencial**: Wireframes e mockups para telas de leitura, navegação, seleção de tradução, modo noturno.
2.  **Prova de Conceito (PoC) de Carregamento de Texto**:
    *   SQLite com uma única tradução (ex: Gênesis-Apocalipse da ARA).
    *   Leitor Flutter que carrega e exibe capítulos de forma ultra-rápida.
    *   Medição de performance.
3.  **Mecanismo de Troca de Capítulos/Livros**.
4.  **Integração Inicial de Cores/Fontes**: Modos dia/noite e ajuste básico de tamanho de fonte.

### B. MVP (Mínimo Produto Viável) (Sprints 3-6)
1.  **Engine de Leitura Central**:
    *   Suporte para 2-3 traduções (ARA, NVI).
    *   Navegação intuitiva por livro, capítulo e versículo.
    *   Busca simples por palavra-chave.
    *   Ajustes de fonte e temas.
2.  **Personalização Básica**:
    *   Marcadores de texto (1-2 cores).
    *   Criação/visualização de anotações por versículo.
3.  **Módulo de Áudio (Streaming)**:
    *   Player para Devocionais (streaming).
    *   Controles básicos.
4.  **Estratégia Offline Inicial**:
    *   Pré-empacotamento de 1-2 traduções no instalador.
    *   Gerenciamento de dados SQLite para texto.
    *   Otimização do tamanho do APK/IPA (alvo 45MB).
5.  **Interface de Usuário (Refinamento)**: Legibilidade, design minimalista.

### C. Funcionalidades Avançadas (Sprints 7 em diante)
1.  **Engine de Leitura Completa**:
    *   Todas as traduções (ARA, NVI, ARC, KJA, NTLH, NAA).
    *   Troca instantânea entre traduções (com cache).
    *   Busca avançada.
    *   Comparação de versículos.
2.  **Módulo de Áudio Completo**:
    *   Download Manager para áudios (Devocionais, Rota 66) offline.
    *   Controles avançados (velocidade, timer).
    *   Gerenciamento de espaço.
3.  **Recursos de Estudo**:
    *   Dicionário Bíblico.
    *   Planos de Leitura Progressivos.
    *   Seção "O que a Bíblia diz".
4.  **Personalização Avançada**:
    *   Múltiplas cores para marcadores.
    *   Anotações ricas.
    *   Integração de Hinários.
    *   **Sincronização Opcional (Supabase)**.
5.  **Multimídia**:
    *   Integração de estudos em vídeo (links externos/embed).
6.  **Otimização Contínua**.

## Estratégia Offline Detalhada:
1.  **Gerenciamento de Texto**:
    *   Bundle Inicial Compacto (1-2 traduções SQLite otimizadas).
    *   Downloads de Traduções Sob Demanda (arquivos SQLite compactados via CDN/Supabase Storage).
    *   Cache Inteligente e Indexação Eficiente SQLite.
2.  **Gerenciamento de Áudio**:
    *   Zero Áudio no Bundle Inicial.
    *   Streaming como Padrão.
    *   Download Explícito para Offline (formatos eficientes, bitrates otimizados).
    *   Gerenciamento de Espaço pelo Usuário.
3.  **Otimização Geral do App Size**: Assets otimizados, Tree Shaking, dependências leves.
