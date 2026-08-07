# Requirements: Estudo Bíblico Profundo

**Defined:** 2026-08-06
**Core Value:** Estudo bíblico profundo e personalizado num único lugar — contexto, originais e conexões a um clique de qualquer versículo, com IA imparcial e com fontes como professor. Se tudo mais falhar, isso precisa funcionar.

## v1 Requirements

Requisitos para a release inicial — a fatia vertical "estudo de versículo profundo", orquestrada sobre a camada de dados de originais com Strong's (P0). Cada um mapeia para fases do roadmap.

### Fundação de Dados (P0 — habilitador)

- [ ] **DATA-01**: Camada canônica de texto bíblico por-verso (livro, capítulo, versículo) com um "spine" de ID imutável — tudo (traduções, originais, crossrefs, notas) ancora nele
- [ ] **DATA-02**: Pipeline de dados de originais com tag Strong's por palavra (hebraico/aramaico/grego) — interlinear, léxico, concordância, transliteração e âncoras compõem sobre ela
- [ ] **DATA-03**: Self-host dos textos de domínio público (KJV-US, ASV, WEB, Almeida) em Supabase/Postgres, sem dependência runtime de Bible externo
- [ ] **DATA-04**: Originais livres de licença: SBLGNT (grego) + OpenScriptures OSHB/WLC (hebraico) — nunca NA28/Westminster (restritos)
- [ ] **DATA-05**: Licensing Ledger + página de créditos — gate de Fase 1 (domínio público não é uniforme; packaging editorial tem copyright)

### Leitura Multi-Tradução

- [ ] **READ-01**: Usuário lê a Bíblia em múltiplas traduções lado a lado (sincronizadas pelo mesmo versículo)
- [ ] **READ-02**: Usuário navega por livro/capítulo/versículo e clica em referências (salta e volta) — "o âncora move tudo"

### Estudo Profundo de Versículo

- [ ] **EST-01**: Usuário estuda um versículo em profundidade: contexto histórico, cultural, geográfico e arqueológico integrado (dossier por-versículo)
- [ ] **EST-02**: Usuário acessa originais (hebraico/aramaico/grego) com transliteração, pronúncia e significado
- [ ] **EST-03**: Usuário faz word-study: toca uma palavra → Strong's → lemma → parsing → léxico → outras ocorrências
- [ ] **EST-04**: Dicionário bíblico e concordância (Strong's, Easton's, BDB/Thayer) integrados
- [ ] **EST-05**: Referências cruzadas versículo-a-versículo (Treasury of Scripture Knowledge — 572k)

### Notas e Organização

- [ ] **NOTA-01**: Usuário cria notas e destaques ancorados a versículos
- [ ] **NOTA-02**: Sync confiável e entre dispositivos das notas/destaques/marcadores/progresso (Supabase)

### Conta e Fundação Cloud

- [ ] **AUTH-01**: Usuário cria conta com email e senha
- [ ] **AUTH-02**: Usuário recebe verificação de email após o cadastro
- [ ] **AUTH-03**: Usuário redefine a senha via link de email
- [ ] **AUTH-04**: Sessão do usuário persiste entre recargas do navegador
- [ ] **AUTH-05**: Dados do usuário protegidos por RLS (notas/destaques privados por padrão)

### Busca

- [ ] **BUSA-01**: Usuário busca na Bíblia por palavra-chave e localiza versículo

### Experiência (Princípio transversal)

- [ ] **UX-01**: "Zoom progressivo" — o app abre simples e o usuário puxa camadas de profundidade sob demanda; anti-overwhelm (o diferencial vs Logos)
- [ ] **UX-02**: Offline básico — texto legível offline via PWA (cache tiered, sem carregar o dataset inteiro no boot)

## v2 Requirements

Adiado para release futura. Rastreado mas não no roadmap atual.

### Personalização + Colaboração

- **GRUP-01**: Notas com âncora por PALAVRA (word-anchored, segue a palavra entre traduções)
- **GRUP-02**: Categorias/pastas para anotações e "estudos próprios"
- **GRUP-03**: Compartilhar estudos e grupos pequenos (leitura + edição + convite) — sem feed social
- **GRUP-04**: Ferramentas de criação (sermões, aulas, devocionais, pequenos grupos)
- **GRUP-05**: Modo de estudo por temas (fé, salvação, casamento…) com conexão automática de passagens
- **GRUP-06**: Busca inteligente/semântica por assunto (não lembra o versículo exato)
- **GRUP-07**: Acompanhamento de evolução do estudo: metas, histórico, revisões

### Visual/Conteúdo (camadas independentes)

- **VISU-01**: Linha do tempo visual da Bíblia (eventos, reis, profetas, impérios)
- **VISU-02**: Mapas interativos (viagens missionárias, êxodo, reinos, cidades)

## Out of Scope

Explícitos. Documentados para evitar scope creep.

| Feature | Reason |
|---------|--------|
| Traduções comerciais modernas (NVI, NAA, NIV, ESV) | Licença de direitos autorais custosa/restritiva; domínio público primeiro |
| IA como professor de teologia (EST-13/14) | Parte mais cara/complexa e de maior risco de precisão/austeridade; fase pós-fundação |
| Feed social / home algorítmica | Anti-feature #1 do mercado; destrói o foco de estudo (não-feed) |
| Gamificação (streaks, badges) | Anti-feature; em desacordo com a postura contemplativa do estudo |
| Anúncios / paywall no leitor | Anti-feature; core honesto e gratuito no v1 |
| Stack acadêmico de morfologia (syntax trees) no v1 | Caro e serve minoria; word-study médio cobre ~90% da necessidade séria |
| Aplicativo mobile nativo (iOS/Android) | Web/PWA acessível a todos os dispositivos no v1 |

## Traceability

Mapas das fases criados com o roadmap (ROADMAP.md).

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| READ-01 | Phase 1 | Pending |
| READ-02 | Phase 1 | Pending |
| EST-01 | Phase 3 | Pending |
| EST-02 | Phase 3 | Pending |
| EST-03 | Phase 3 | Pending |
| EST-04 | Phase 3 | Pending |
| EST-05 | Phase 3 | Pending |
| NOTA-01 | Phase 4 | Pending |
| NOTA-02 | Phase 4 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 4 | Pending |
| BUSA-01 | Phase 5 | Pending |
| UX-01 | Phase 1 | Pending |
| UX-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-06*
*Last updated: 2026-08-07 after roadmap creation*