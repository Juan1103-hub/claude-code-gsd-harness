# CLAUDE.md — Harness GSD-first para Projetos Web

> Este repositório é um **template/harness**, não um produto. Todo projeto real vive em `projects/<nome-do-projeto>/`, autocontido (próprio `package.json`, `src/`, `docs/`).

## Perfil do usuário
- O usuário faz **vibe coding**: prefere descrever a ideia em linguagem natural e deixar o agente conduzir os detalhes técnicos, em vez de escrever specs formais linha a linha.
- Por isso este harness usa GSD (leve, rápido) em vez de frameworks de SDD mais pesados (ex: Spec Kit) — e compensa a informalidade do vibe coding com guardrails automáticos: `karpathy-guidelines` (disciplina de diffs) e `open-code-review` (revisão automática).
- Sempre traduza pedidos informais do usuário em decisões registradas (`docs/PROJECT.md`, `docs/DECISIONS.md`) antes de codar — ele não vai formalizar isso sozinho, essa é a função do harness.
- **O usuário não escolhe comandos/skills manualmente.** Ele só descreve o que quer; a seleção de comando/skill é responsabilidade do agente, seguindo a seção "Roteamento automático" abaixo.

## Roteamento automático de skills/comandos
Antes de agir em qualquer pedido, classifique-o e siga a regra correspondente **sem perguntar ao usuário qual comando usar** (só pergunte se a classificação em si for ambígua):

| Tipo de pedido | Sinal de reconhecimento | Comando/skill a usar |
|---|---|---|
| Ajuste pontual, correção, componente único | Pedido pequeno, escopo claro, cabe numa sessão | `/gsd-quick` (padrão) |
| Ajuste pontual mas com regra de negócio/lógica sensível | Envolve dados, permissões, cálculo crítico | `/gsd-quick --validate` |
| Pedido vago, só uma frase, sem certeza do escopo | Usuário descreve em linguagem natural, sem estrutura | `/gsd-progress --do "<pedido do usuário>"` — deixa o próprio GSD decidir o comando final |
| Funcionalidade grande / fase nova inteira | Múltiplas telas, múltiplos componentes, dura mais de uma sessão | `/gsd-phase "<descrição>"` (registra no ROADMAP.md) |
| Projeto novo do zero | Usuário pede para criar um app/projeto novo | `/gsd-new-project` (ou fluxo completo: spec-phase → discuss-phase → plan-phase → execute-phase) |
| Qualquer edição em código já existente | Sempre, independente do comando GSD escolhido acima | Aplicar `karpathy-guidelines` automaticamente (alterações cirúrgicas) |
| Qualquer componente/tela de UI nova ou alterada | Envolve HTML/JSX/CSS/Tailwind | Aplicar `.claude/skills/responsive-design.md` automaticamente |
| Antes de considerar qualquer tarefa "concluída"/pronta para merge | Sempre, como último passo | Rodar `open-code-review` (triagem) + `/gsd-verify-work` (checklist GSD) |

Regra de desempate: se o pedido parecer se encaixar em mais de uma linha, prefira sempre a opção mais leve (`/gsd-quick` antes de `/gsd-phase`) — só escale para o pipeline completo se `/gsd-quick` deixar claro que o escopo é maior do que parecia.

## Framework principal: GSD
- Fonte oficial: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (o repositório antigo `gsd-build/get-shit-done` foi migrado para este).
- Fluxo completo: `new-project` → `plan-phase` → `execute-phase` → `verify-work`.
- Fluxo rápido: `/gsd-quick` (ver tabela de roteamento acima).
- Objetivo: manter contexto limpo por tarefa (evitar "context rot"), sem o overhead de specs formais pesadas.

## Disciplina de código: karpathy-guidelines
Instalar via: `npx skills add https://github.com/szkocot/andrej-karpathy-skills --skill karpathy-guidelines`

Regras obrigatórias em toda alteração:
- Alterações cirúrgicas: toque apenas no que for necessário.
- Não tente "melhorar" código ou comentários adjacentes não relacionados ao pedido.
- Não refatore o que não está quebrado.
- Adapte-se ao estilo existente do código, mesmo que você faria diferente.
- Se notar código morto não relacionado, **mencione**, não apague sem avisar.

## Revisão de código: open-code-review (OCR)
Instalar via: `npx skills add alibaba/open-code-review --skill open-code-review` (ou plugin `/plugin install open-code-review@open-code-review`).

- CLI Go que combina regras determinísticas (NPE, thread-safety, XSS, SQL injection) com revisão via LLM.
- Exige configurar endpoint de LLM próprio (Anthropic ou OpenAI-compatível) — gera custo de tokens por review.
- **Regra do harness:** nenhum merge sem passar por OCR primeiro (triagem automática) e depois revisão humana/Claude Code (gate final).

## Onde cada coisa mora
- `projects/<nome>/` — cada projeto real, autocontido (próprio `package.json`, `src/`, `docs/`).
- `.claude/rules/` — `coding.md`, `testing.md`, `deploy.md` (Supabase + Vercel), `responsive.md` (mobile-first).
- `.claude/skills/` — referências às skills instaláveis (`karpathy-guidelines`, `open-code-review`).
- `docs/` — specs GSD do próprio harness (não dos projetos individuais, que têm os próprios `docs/`).

## Stack padrão
React + Next.js + TypeScript + Tailwind CSS, com shadcn/ui (componentes), Lucide React (ícones), Framer Motion (animações). HTML/JS puro sem framework **apenas** quando pedido explicitamente no prompt.

## Fluxo recomendado
1. Classificar o pedido pela tabela de "Roteamento automático" e escolher o comando certo, sem perguntar ao usuário.
2. Se for projeto/fase nova: registrar em `docs/PROJECT.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md` antes de codar.
3. Implementar seguindo `karpathy-guidelines` (alterações cirúrgicas) e `.claude/skills/responsive-design.md` (se envolver UI).
4. `open-code-review` — triagem automática antes do merge.
5. `/gsd-verify-work` — checklist final + revisão humana.
