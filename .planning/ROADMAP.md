# Roadmap: Estudo Bíblico Profundo

## Overview

Do zero a uma PWA de estudo bíblico profundo em 5 fases verticais (modo MVP — cada fase entrega um slice de capacidade de usuário, não camadas horizontais). A Fase 1 assenta a fundação canônica — spine de ID imutável de versículo, pipeline de originais com Strong's, textos self-hosted com gate de licenciamento — e a prova com leitura multi-tradução. A Fase 2 estabelece identidade de usuário. A Fase 3 entrega o "deep-verse": interlinear, word-study, dossier de contexto e referências cruzadas. A Fase 4 torna o estudo pessoal e confiável — notas, destaques, sync, RLS e offline. A Fase 5 fecha com busca por palavra-chave, refinamentos de release e o gate de segurança que libera o go-live.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Fundação de Dados e Leitura** - Spine canônico, originais com Strong's, textos self-hosted, licenças e leitura multi-tradução do mesmo versículo
- [ ] **Phase 2: Conta e Fundação Cloud** - Identidade: cadastro, verificação, redefinição de senha, sessão persistente
- [ ] **Phase 3: Estudo Profundo do Versículo** - Interlinear, word-study, dicionário, dossiers de contexto e referências cruzadas
- [ ] **Phase 4: Notas, Sync e Offline** - Notas/destaques ancorados, sincronização confiável, RLS e leitura offline PWA
- [ ] **Phase 5: Busca e Go-Live** - Busca por palavra-chave, refinamentos de release e gate de segurança

## Phase Details

### Phase 1: Fundação de Dados e Leitura
**Goal**: Abrir qualquer versículo em profundidade básica: leitura multi-tradução (KJV, WEB, ASV, Almeida) lado a lado, servida pelo spine canônico + pipeline de originais com Strong's + textos self-hosted + Licensing Ledger.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, READ-01, READ-02, UX-01
**Success Criteria** (what must be TRUE):
  1. O usuário abre o app e lê o mesmo versículo em 2+ traduções de domínio público lado a lado, sincronizadas na mesma referência.
  2. O usuário navega por livro/capítulo/versículo e clica nas referências para saltar para outro versículo e voltar (o âncora move tudo).
  3. Todo texto exibido vem do próprio banco do app (self-hosted) — sem dependência de runtime de serviço externo de Bíblia.
  4. Os textos originais (SBLGNT grego + OSHB/WLC hebraico, livres de licença) estão populados por-versículo, com tokens Strong por palavra, consultáveis — base do interlinear da Fase 3.
  5. O usuário confere a página de créditos com a fonte e o status de cada licença (ledger), e a interface abre simples com profundidade em camadas sob demanda (zoom progressivo).
**Plans**: TBD
**UI hint**: yes

### Phase 2: Conta e Fundação Cloud
**Goal**: O usuário tem identidade confiável — cria conta, confirma o email e mantém sessão entre recargas — antes de existir qualquer dado pessoal.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. O usuário cria conta com email e senha, e o cadastro só se conclui após a verificação do email.
  2. O usuário redefine a senha via link enviado por email e retorna logado com a nova senha.
  3. Depois de recarregar o navegador ou trocar de device, a sessão do usuário continua ativa — sem novo login.
  4. O usuário encerra a sessão pelo app, e outra conta pode entrar no mesmo navegador sem conflito (identidade é por usuário).
**Plans**: TBD
**UI hint**: yes

### Phase 3: Estudo Profundo do Versículo
**Goal**: A prova do deep-verse: de qualquer versículo o usuário puxa as camadas de profundidade — originais com transliteração, word-study por palavra, léxico/dicionário, contexto histórico/cultural/geográfico/arqueológico e referências cruzadas — sem sair da tela.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: EST-01, EST-02, EST-03, EST-04, EST-05
**Success Criteria** (what must be TRUE):
  1. O usuário acessa o original de um versículo (hebraico/aramaico/grego) com transliteração, pronúncia e significado.
  2. O usuário toca em qualquer palavra e vê o word-study completo: Strong → lemma → parsing → léxico (BDB/Thayer) → outras ocorrências da palavra.
  3. O usuário abre o módulo de contexto do versículo e vê contexto histórico, cultural, geográfico e arqueológico integrado.
  4. O usuário clica numa referência cruzada para o versículo relacionado (e volta), com a base de 572k do TSK importada.
**Plans**: TBD
**Dependencies Notes**: Usa o pipeline de originais com Strong's populado na Fase 1; não depende de conta (funciona sem login também).
**UI hint**: yes

### Phase 4: Notas, Sync e Offline
**Goal**: O estudo se torna do usuário: notas e destaques ancorados em versículos, sincronização confiável entre dispositivos, privacidade via RLS e leitura offline básica via PWA (cache tiered).
**Mode:** mvp
**Depends on**: Phase 2, Phase 3
**Requirements**: NOTA-01, NOTA-02, AUTH-05, UX-02
**Success Criteria** (what must be TRUE):
  1. O usuário seleciona um versículo e cria destaques e notas ancoradas no spine (sobrevivem a reload).
  2. As anotações sincronizam entre devices (Supabase): o que editei no device A aparece no device B sem ação manual.
  3. Os dados pessoais são privados: notas/destaques de um usuário não são visíveis por outro usuário logado (RLS).
  4. Com a rede offline, o usuário continua lendo os versículos já acessados (cache PWA).
**Plans**: TBD
**UI hint**: yes

### Phase 5: Busca e Go-Live
**Goal**: Encontrar qualquer passagem por palavra-chave e entregar a release: refinamentos, segurança e gate de deploy.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: BUSA-01
**Success Criteria** (what must be TRUE):
  1. O usuário digita uma palavra-chave (ex.: "misericórdia") e chega à lista de versículos correta, com clique direto no versículo.
  2. A busca cobre a suíte de traduções self-hosted, com resultados relevantes e sem travar o app (índice em memória).
  3. O app passa no gate de segurança do harness antes do go-live: RLS ativo em todas as tabelas de dados, `service_role` apenas server-side, Supabase Security Advisor sem crítico, headers Vercel.
  4. A PWA instalável (manifest e ícone corretos) e os textos públicos self-hosted são re-verificados por licença.
**Plans**: TBD
**UI hint**: yes

## Mapeamento de Requisitos (cobertura)

| Requirement | Phase |
|-------------|-------|
| DATA-01, DATA-02, DATA-03, DATA-04, DATA-05 | Phase 1 |
| READ-01, READ-02 | Phase 1 |
| UX-01 | Phase 1 |
| AUTH-01, AUTH-02, AUTH-03, AUTH-04 | Phase 2 |
| EST-01, EST-02, EST-03, EST-04, EST-05 | Phase 3 |
| NOTA-01, NOTA-02 | Phase 4 |
| AUTH-05 | Phase 4 |
| UX-02 | Phase 4 |
| BUSA-01 | Phase 5 |

**Cobertura:** 22/22 requisitos v1 mapeados ✓ (nenhum órfão)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação de Dados e Leitura | 0/TBD | Not started | - |
| 2. Conta e Fundação Cloud | 0/TBD | Not started | - |
| 3. Estudo Profundo do Versículo | 0/TBD | Not started | - |
| 4. Notas, Sync e Offline | 0/TBD | Not started | - |
| 5. Busca e Go-Live | 0/TBD | Not started | - |