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
| Pedido vago, só uma frase, sem certeza do escopo | Usuário descreve em linguagem natural, sem estrutura | `/gsd-progress --do "<pedido do usuário>"` |
| Funcionalidade grande / fase nova inteira | Múltiplas telas, múltiplos componentes, dura mais de uma sessão | `/gsd-phase "<descrição>"` (registra no ROADMAP.md) |
| Projeto novo do zero | Usuário pede para criar um app/projeto novo | `/gsd-new-project` (pipeline completo) |
| Qualquer edição em código já existente | Sempre | `.claude/skills/karpathy-guidelines.md` automaticamente |
| Qualquer componente/tela de UI nova ou alterada | Envolve HTML/JSX/CSS/Tailwind | `.claude/skills/responsive-design.md` automaticamente |
| Antes de considerar qualquer tarefa "concluída" | Sempre, como último passo | `.claude/skills/open-code-review.md` + agente `code-reviewer` + `/gsd-verify-work` |

Regra de desempate: prefira sempre a opção mais leve (`/gsd-quick` antes de `/gsd-phase`) — só escale se o escopo real aparecer maior durante a execução.

## Framework principal: GSD
- Fonte oficial: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (o link `gsd-build/get-shit-done` está migrado/arquivado — use este).
- Fluxo completo: `new-project` → `plan-phase` → `execute-phase` → `verify-work`.
- Fluxo rápido: `/gsd-quick` (ver tabela de roteamento acima).

## Onde cada coisa mora
- `projects/<nome>/` — cada projeto real, autocontido.
- `.claude/commands/` — `run-tests.md` define o `/run-tests`.
- `.claude/agents/` — `code-reviewer.md`.
- `.claude/rules/` — `coding.md`, `testing.md`, `deploy.md` (Supabase + Vercel).
- `.claude/skills/` — `karpathy-guidelines.md`, `open-code-review.md`, `responsive-design.md` (todas vendorizadas com conteúdo completo, não só link de instalação).
- `docs/` — specs GSD do próprio harness.

## Stack padrão
React + Next.js + TypeScript + Tailwind CSS, shadcn/ui, Lucide React, Framer Motion. HTML/JS puro sem framework **apenas** se pedido explicitamente.

## Fluxo recomendado
1. Classificar o pedido pela tabela de "Roteamento automático".
2. Se projeto/fase nova: registrar em `docs/PROJECT.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`.
3. Implementar seguindo `karpathy-guidelines.md` e `responsive-design.md` (se UI).
4. `open-code-review.md` + agente `code-reviewer` antes do merge.
5. `/gsd-verify-work` (inclui `/run-tests`).
