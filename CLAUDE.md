# CLAUDE.md — Harness GSD-first para Projetos Web

> Este repositório é um **template/harness**, não um produto. Todo projeto real vive em `projects/<nome-do-projeto>/`, autocontido (próprio `package.json`, `src/`, `docs/`).

## Perfil do usuário
- O usuário faz **vibe coding**: prefere descrever a ideia em linguagem natural e deixar o agente conduzir os detalhes técnicos, em vez de escrever specs formais linha a linha.
- Por isso este harness usa GSD (leve, rápido) em vez de frameworks de SDD mais pesados (ex: Spec Kit) — e compensa a informalidade do vibe coding com guardrails automáticos: `karpathy-guidelines` (disciplina de diffs) e `open-code-review` (revisão automática).
- Sempre traduza pedidos informais do usuário em decisões registradas (`docs/PROJECT.md`, `docs/DECISIONS.md`) antes de codar — ele não vai formalizar isso sozinho, essa é a função do harness.

## Framework principal: GSD
- Fonte oficial: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (o repositório antigo `gsd-build/get-shit-done` foi migrado para este).
- Fluxo: `new-project` → `plan-phase` → `execute-phase` → `verify-work`.
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
1. GSD `new-project` — traduzir o pedido informal do usuário em `docs/PROJECT.md`, `docs/DECISIONS.md`.
2. GSD `plan-phase` — quebrar em fases (`docs/ROADMAP.md`).
3. GSD `execute-phase` — implementar seguindo `karpathy-guidelines` (alterações cirúrgicas).
4. `open-code-review` — triagem automática antes do merge.
5. GSD `verify-work` — checklist final + revisão humana.
