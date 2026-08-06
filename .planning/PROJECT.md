# Estudo Bíblico Profundo

## What This Is

Plataforma web (PWA) de estudo bíblico profundo, organizado e personalizado — não um leitor de Bíblia com comentários. Reúne em um único lugar o que hoje está espalhado em vários apps: estudo versículo por versículo com contexto histórico/cultural/geográfico/arqueológico, comparação de traduções lado a lado, textos originais (hebraico, aramaico, grego) com transliteração, dicionário bíblico, concordância, mapas, cronologias, genealogias, sistema de anotações avançado e IA como professor de teologia com fontes. Atende do novo convertido ao pastor/teólogo — o usuário escolhe a profundidade, o app não o força.

## Core Value

Estudo bíblico profundo e personalizado num único lugar — contexto, originais e conexões a um clique de qualquer versículo, com IA imparcial e com fontes como professor. Se tudo mais falhar, isso precisa funcionar.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] [EST-01] Usuário lê a Bíblia em múltiplas traduções lado a lado (domínio público) — [REQ]
- [ ] [EST-02] Usuário estuda um versículo em profundidade: contexto histórico, cultural, geográfico e arqueológico integrado
- [ ] [EST-03] Usuário acessa originais (hebraico/aramaico/grego) com transliteração, pronúncia e significado
- [ ] [EST-04] Dicionário bíblico, concordância, mapas, cronologias e genealogias integrados ao estudo
- [ ] [EST-05] Sistema de anotações avançado: destaques, categorias, relações entre versículos, estudos próprios e compartilhamento
- [ ] [EST-06] Linha do tempo visual da Bíblia (eventos, reis, profetas, impérios)
- [ ] [EST-07] Mapas interativos (viagens missionárias, êxodo, reinos, cidades)
- [ ] [EST-08] Ferramentas de criação (sermões, estudos, aulas, devocionais, pequenos grupos)
- [ ] [EST-09] Busca inteligente por assunto, mesmo sem lembrar o versículo exato
- [ ] [EST-10] Modo de estudo por temas com conexão automática de passagens relacionadas
- [ ] [EST-11] Acompanhamento de evolução do estudo: metas, histórico, revisões
- [ ] [EST-12] Estudo individual e em grupos, compartilhando anotações e estudos
- [ ] [EST-13] IA como professor de teologia: explica passagens, mostra interpretações, sempre com fontes
- [ ] [EST-14] Fidelidade aos textos bíblicos com linhas de interpretação imparciais — o usuário tira suas próprias conclusões

### Out of Scope

- Traduções comerciais modernas (NVI, NAA, NIV…) — licença de direitos autorais custosa e restritiva; usa-se domínio público (KJV, ASV, WEB, Almeida, originais acadêmicos)
- IA como professor de teologia no v1 — é a parte mais cara, complexa e de maior risco de precisão/austeridade; separada da fundação, fase posterior
- Aplicativos mobile nativos (iOS/Android) — começa como Web/PWA acessível de qualquer dispositivo
- Redes sociais de conteúdo — foco em estudo individual e em grupos de estudo, não feed social

## Context

- **Produto:** usuário busca profundidade de estudo sem multiplicidade de apps — problema real e atende a um espectro (novo convertido a teólogo).
- **Diferencial:** experiência de "zoom progressivo" — o app abre simples e deixa o usuário puxar camadas de profundidade (originais, léxico, cronologia) sob demanda; mesma tela atende novato e teólogo sem sobrecarregar nenhum.
- **Conteúdo de valor** (comentários, contexto, conexões): marcar disponível como built-in no v1 — conteúdo curado a partir de dados públicos (OpenBible, Bible Hub, dados acadêmicos livres) + IA, sem travar em licença.
- **IA:** separada como fase pós-fundação; o professor de teologia com fontes é o maior diferencial, mas o mais caro/complexo — segmentá-lo evita um v1 sobrecarregado.
- **Equilíbrio de persona:** todos igualmente é o princípio de design; zoom progressivo é o mecanismo.
- **Harness:** este é um projeto real dentro do harness `claude-code-gsd-harness`; stack padrão do harness (React + Next.js + TypeScript + Tailwind, shadcn/ui, Lucide, Framer Motion) e Supabase para dados/auth.
- **Licenciamento de textos:** entendido — domínio público primeiro, sem licenciamento comercial no início.

## Constraints

- **Tech stack**: React + Next.js + TypeScript + Tailwind CSS, shadcn/ui, Lucide React, Framer Motion — padrão do harness.
- **Data/Backend**: Supabase para dados do usuário, auth e RLS; deploy em Vercel — conforme `.claude/rules/deploy.md`.
- **Traduções**: domínio público primeiro (licenciamento comercial não atrapalha o início).
- **Escopo v1**: fatia vertical "estudo de versículo profundo" (traduções lado a lado + originais + contexto + dicionário + notas) é a prioridade; IA-professor e grupos são fases posteriores.
- **Imparcialidade**: preservar fidelidade aos textos e apresentar diferentes linhas de interpretação; o usuário tira suas próprias conclusões.
- **Segurança**: regras de deploy do harness (RLS, `service_role` server-side, Supabase Security Advisor, headers Vercel) são obrigatórias antes de go-live.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web/PWA (não mobile nativo) | Uma base para todos os dispositivos, mais rápido de lançar e iterar | — Pending |
| Persona: todos igualmente (novato a teólogo) | Ambicioso; zoom progressivo como mecanismo para não sobrecarregar | — Pending |
| Traduções de domínio público primeiro | Legal, gratuito, cobre comparação lado a lado; comerciais depois se fizer sentido | — Pending |
| Fatia v1: estudo de versículo profundo | Prova o conceito de ponta a ponta com o recurso que emociona | — Pending |
| Zoom progressivo para profundidade | Mesma tela atende novato e teólogo; app abre simples, usuário puxa profundidade | — Pending |
| Conteúdo built-in curado (não colaborativo só) | Dados públicos + IA; não trava em licença, entrega valor imediato | — Pending |
| IA-professor como fase pós-fundação | Parte mais cara/complexa; segmentar evita v1 sobrecarregado | — Pending |
| Supabase para dados/auth | Funda grupos e compartilhamento desde já; padrão do harness | — Pending |
| Individual + grupos no v1 | Diferenciação social do deep-study; compartilhamento desde o início | — Pending |

---
*Last updated: 2026-08-06 after initialization*
