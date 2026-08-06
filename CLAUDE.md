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
| Pedido vago, só uma frase, sem certeza do escopo | Usuário descreve em linguagem natural, sem estrutura | `/gsd-progress --next` (ou `--do "<pedido>"` se disponível na versão instalada) |
| Funcionalidade grande / fase nova do roadmap | Múltiplas telas, múltiplos componentes, dura mais de uma sessão | `/gsd-discuss-phase N` → `/gsd-plan-phase N` → `/gsd-execute-phase N` |
| Projeto novo do zero | Usuário pede para criar um app/projeto novo | `/gsd-new-project` (se já existir código, rodar `/gsd-map-codebase` antes) |
| Qualquer edição em código já existente | Sempre, independente do comando GSD escolhido acima | Aplicar `.claude/skills/karpathy-guidelines/SKILL.md` automaticamente |
| Qualquer componente/tela de UI nova ou alterada | Envolve HTML/JSX/CSS/Tailwind | Aplicar `.claude/skills/responsive-design/SKILL.md` automaticamente |
| Antes de considerar qualquer tarefa "concluída"/pronta para merge | Sempre, como último passo | `.claude/skills/open-code-review/SKILL.md` (`ocr review` ou `ocr delegate`) + agente `code-reviewer` + `/gsd-verify-work` + `/gsd-ship` |

Regra de desempate: prefira sempre a opção mais leve (`/gsd-quick` antes do fluxo completo de fase) — só escale se o escopo real aparecer maior durante a execução.

## Framework principal: GSD
- Fonte oficial: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) (o link antigo `gsd-build/get-shit-done` está migrado/arquivado — use este).
- **Cópia local vendorizada:** conteúdo completo do plugin (commands, agents, hooks, workflows, templates, references, sdk, bin) em `vendor/get-shit-done/` (fonte `gsd-build/get-shit-done`). Usar como referência/backup — para instalação funcional siga o fluxo npx abaixo.
- **Instalação correta (via npx, funciona em Windows/Mac/Linux):**
  ```powershell
  npx @opengsd/gsd-core@latest
  ```
  O instalador pergunta o runtime (escolher **Claude Code**) e se é instalação global ou local. **Não** usar `/plugin marketplace add` — esse fluxo depende de clonar via `git` e pode falhar em Windows com Git instalado em pasta de usuário (AppData). **Não** copiar arquivos de `agents/`/`commands/` manualmente — o instalador faz uma conversão de frontmatter por runtime que copiar à mão não replica.
- Loop principal: `/gsd-new-project` → `/gsd-discuss-phase N` → `/gsd-plan-phase N` → `/gsd-execute-phase N` → `/gsd-verify-work N` → `/gsd-ship N` → `/gsd-complete-milestone` / `/gsd-new-milestone`.
- Atalho rápido para tarefas ad-hoc: `/gsd-quick` (flags `--discuss`, `--research`, `--validate`, `--full`).
- Objetivo: manter contexto limpo por tarefa (evitar "context rot"), sem o overhead de specs formais pesadas.

## Disciplina de código: karpathy-guidelines
Conteúdo vendorizado em `.claude/skills/karpathy-guidelines/SKILL.md`. Instalação opcional adicional: `npx skills add https://github.com/szkocot/andrej-karpathy-skills --skill karpathy-guidelines`.

Regras obrigatórias em toda alteração:
- Alterações cirúrgicas: toque apenas no que for necessário.
- Não tente "melhorar" código ou comentários adjacentes não relacionados ao pedido.
- Não refatore o que não está quebrado.
- Adapte-se ao estilo existente do código, mesmo que você faria diferente.
- Se notar código morto não relacionado, **mencione**, não apague sem avisar.

## Revisão de código: Open Code Review (OCR)
Referência completa vendorizada em `.claude/skills/open-code-review/SKILL.md` (modo `ocr review`) e `.claude/skills/open-code-review/references/delegate.md` (modo `ocr delegate`). Instalar via `npm install -g @alibaba-group/open-code-review` (comando `ocr`).

- CLI que combina engenharia determinística (seleção/agrupamento de arquivos) com um agente LLM para revisão.
- **Delegation Mode** (`ocr delegate`): deixa o próprio Claude Code fazer a revisão, sem precisar configurar API key separada para o OCR.
- **Regra do harness:** nenhum merge sem passar por `ocr review`/`ocr delegate` primeiro (triagem) e depois revisão humana/agente `code-reviewer` (gate final).

## Onde cada coisa mora
- `projects/<nome>/` — cada projeto real, autocontido (próprio `package.json`, `src/`, `docs/`).
- `.claude/commands/` — `run-tests.md` define o `/run-tests`.
- `.claude/agents/` — `code-reviewer.md`.
- `.claude/rules/` — `coding.md`, `testing.md`, `deploy.md` (Supabase + Vercel).
- `.claude/skills/` — `karpathy-guidelines/SKILL.md`, `open-code-review/SKILL.md` (+ `references/delegate.md`), `responsive-design/SKILL.md` (todas vendorizadas com conteúdo completo, no formato oficial de pasta por skill com `SKILL.md`).
- `docs/` — specs GSD do próprio harness (não dos projetos individuais, que têm os próprios `docs/`).

## Stack padrão
React + Next.js + TypeScript + Tailwind CSS, com shadcn/ui (componentes), Lucide React (ícones), Framer Motion (animações). HTML/JS puro sem framework **apenas** quando pedido explicitamente no prompt.

## Fluxo recomendado
1. Classificar o pedido pela tabela de "Roteamento automático" e escolher o comando certo, sem perguntar ao usuário.
2. Se for projeto/fase nova: registrar em `docs/PROJECT.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md` antes de codar.
3. Implementar seguindo `.claude/skills/karpathy-guidelines/SKILL.md` e `.claude/skills/responsive-design/SKILL.md` (se envolver UI).
4. `open-code-review` (`ocr review`/`ocr delegate`) + agente `code-reviewer` — antes do merge.
5. `/gsd-verify-work` + `/gsd-ship` — checklist final (inclui `/run-tests`).