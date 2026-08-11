# Requirements: Bíblia Sagrada

**Defined:** 2026-08-10
**Core Value:** Carregamento de texto ultra-rápido e leitura confortável, 100% offline, app leve (~45MB)

## v1 Requirements

Requisitos para o lançamento inicial. Cada um mapeia para fases do roadmap.

### Leitura (LEI)

- [x] **LEI-01**: Usuário pode ler qualquer capítulo offline com carregamento instantâneo (<200ms)
- [x] **LEI-02**: Usuário pode trocar entre traduções disponíveis com troca instantânea
- [x] **LEI-03**: Usuário pode navegar por livro, capítulo e versículo
- [x] **LEI-04**: Usuário pode buscar texto nas traduções baixadas
- [x] **LEI-05**: Usuário pode ajustar tamanho e tipo de fonte
- [x] **LEI-06**: Usuário pode alternar modo noturno/dia

### Estudo (EST)

- [ ] **EST-01**: Usuário pode ouvir devocionais em áudio (streaming)
- [ ] **EST-02**: Usuário pode baixar áudios para ouvir offline
- [ ] **EST-03**: Usuário pode acessar o comentário bíblico "Rota 66" em áudio
- [x] **EST-04**: Usuário pode consultar dicionário bíblico integrado
- [x] **EST-05**: Usuário pode usar planos de leitura progressivos e acompanhar progresso
- [x] **EST-06**: Usuário pode acessar a seção "O que a Bíblia diz"

### Personalização (PER)

- [x] **PER-01**: Usuário pode marcar versículos com cores diferentes
- [x] **PER-02**: Usuário pode criar e ver anotações por versículo
- [x] **PER-03**: Usuário pode acessar hinários (texto)

### Multimídia (MUL)

- [ ] **MUL-01**: Usuário pode assistir estudos em vídeo (links ou embarcados)

### Offline & Tamanho (OFF)

- [x] **OFF-01**: App inicial com ~45MB e traduções principais embarcadas
- [x] **OFF-02**: Traduções adicionais baixáveis sob demanda (sem novo build)
- [ ] **OFF-03**: Áudios baixados funcionam sem internet

### Sincronização (SYN)

- [ ] **SYN-01**: Usuário pode sincronizar dados de estudo (marcadores, anotações, progresso) na nuvem (opcional)

## v2 Requirements

Adiado para release futuro. Rastreado, mas fora do roadmap atual.

### Traduções pagas

- **LEI-07**: Usuário pode usar NVI, NAA, KJA, NTLH quando licenças forem obtidas

### Traduções com direitos autorais (não utilizáveis)

- **ACF** (Almeida Corrigida Fiel) — © 1994, 1995, 2007, 2011 Sociedade Bíblica Trinitariana do Brasil. SBTB só permite reimpressão de até 1.100 versículos com crédito; Bíblia completa exige autorização escrita. **Não utilizar.**
- **ARC** (Almeida Revista e Corrigida) — © 1995/2009 Sociedade Bíblica do Brasil. Todos os direitos reservados. **Não utilizar.**

### Áudio avançado

- **EST-07**: Usuário pode ajustar velocidade de reprodução
- **EST-08**: Usuário pode usar timer de sono

### Social

- **SOC-01**: Usuário pode compartilhar versículos (imagem/texto)

## Out of Scope

Excluído explicitamente. Documentado para evitar escopo crescente.

| Feature | Reason |
|---------|--------|
| Traduções com copyright (NVI, NAA, KJA, NTLH) | Exigem licença paga; risco legal |
| ACF (Almeida Corrigida Fiel) | © SBTB 1994/1995/2007/2011; Bíblia completa exige autorização escrita |
| ARC (Almeida Revista e Corrigida) | © SBB 1995/2009; todos os direitos reservados |
| Login obrigatório | App usável sem conta; sync é opcional |
| Publicidade / compras | Decisão estratégica: 100% gratuito |
| Rede social / fórum | Fora do escopo de leitura |
| ARA (SBB) no MVP | Restrições de licenciamento — verificar |

## Traduções confirmadas como domínio público (para uso)

| Tradução | Ano | Fonte/licença | Observação |
|----------|-----|---------------|------------|
| Almeida 1911 (ALM1911) | 1911 | Domínio público (†) | Português arcaico, fiel |
| Tradução Brasileira (TB) | 1917/2010 | Domínio público (†), SBB declarou | Leitura moderna |
| Bíblia Livre (BLIVRE) | 2018 | Domínio público (†) | Alternativa

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LEI-01 | Phase 1 | Complete |
| LEI-02 | Phase 2 | Complete |
| LEI-03 | Phase 1 | Complete |
| LEI-04 | Phase 2 | Complete |
| LEI-05 | Phase 1 | Complete |
| LEI-06 | Phase 1 | Complete |
| EST-01 | Phase 3 | Pending |
| EST-02 | Phase 3 | Pending |
| EST-03 | Phase 3 | Pending |
| EST-04 | Phase 2 | Complete |
| EST-05 | Phase 2 | Complete |
| EST-06 | Phase 2 | Complete |
| PER-01 | Phase 2 | Complete |
| PER-02 | Phase 2 | Complete |
| PER-03 | Phase 2 | Complete |
| MUL-01 | Phase 3 | Pending |
| OFF-01 | Phase 1 | Complete |
| OFF-02 | Phase 2 | Complete |
| OFF-03 | Phase 3 | Pending |
| SYN-01 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-10*
*Last updated: 2026-08-10 after initial definition*
