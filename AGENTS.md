# AGENTS.md — Harness GSD-first para Projetos Web (versão OpenCode)

> Este arquivo é a tradução de `CLAUDE.md` para o runtime OpenCode. O `CLAUDE.md` segue sendo a fonte canônica para Claude Code. Se divergirem, `CLAUDE.md` vence.
>
> Este repositório é um **template/harness**, não um produto. Na raiz do harness **não existe** `package.json` nem build próprio. Todo projeto real vive em `projects/<nome-do-projeto>/`, autocontido (próprio `package.json`, `src/`, `docs/`) — rodar build/test sempre dentro da pasta do projeto (`cd projects/<nome>`), nunca na raiz.

## Mapa de correspondência Claude Code → OpenCode

| Claude Code (CLAUDE.md) | OpenCode (este arquivo) |
|---|---|
| Comando `/gsd-*` | Comando `/gsd-*` em `~/.config/opencode/commands/` (76 instalados: gsd-quick, gsd-debug, gsd-progress, gsd-new-project, gsd-plan-phase, gsd-execute-phase, gsd-verify-work, gsd-ship, etc.) |
| Skill `.claude/skills/karpathy-guidelines/SKILL.md` | Skill `karpathy-guidelines` (carregada pelo OpenCode) |
| Skill `.claude/skills/open-code-review/SKILL.md` | Skill `open-code-review` (carregada pelo OpenCode; CLI `ocr`) |
| Skill `.claude/skills/hallmark/SKILL.md` | Skill `hallmark` (carregada pelo OpenCode) |
| Skill `.claude/skills/responsive-design/SKILL.md` | Skill `responsive-design` (carregada pelo OpenCode) |
| Skill `.claude/skills/...` demais | Skill equivalente em `~/.config/opencode/skills/` |
| Agente `.claude/agents/code-reviewer.md` | Agentes `web-code-reviewer`, `backend-code-reviewer`, `advpl-code-reviewer` (disponíveis no runtime OpenCode) |
| Comando `/run-tests` (`.claude/commands/run-tests.md`) | Comando `/run-tests` em `~/.config/opencode/commands/run-tests.md` |
| Regras `.claude/rules/coding.md`, `testing.md`, `deploy.md` | Incorporadas abaixo ("Regras do harness") |

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
| Qualquer edição em código já existente | Sempre, independente do comando GSD escolhido acima | Aplicar skill `karpathy-guidelines` automaticamente |
| Pedido sem encaixe claro nas categorias acima | — | Default seguro: `/gsd-progress` (ver `docs/PROJECT.md` do projeto ativo). Ajustar conforme o pedido depois de ler o projeto. |
| Qualquer componente/tela de UI nova ou alterada | Envolve HTML/JSX/CSS/Tailwind | Aplicar skill `hallmark` (anti-AI-slop, design de páginas/auditoria/redesign/study) **em conjunto com** skill `responsive-design` automaticamente |
| Antes de considerar qualquer tarefa "concluída"/pronta para merge | Sempre, como último passo | Skill `open-code-review` (`ocr review` ou `ocr delegate`) + agente de review (`web-code-reviewer`, `backend-code-reviewer` ou `advpl-code-reviewer` conforme a camada) + `/gsd-verify-work` + `/gsd-ship` |

Regra de desempate: prefira sempre a opção mais leve (`/gsd-quick` antes do fluxo completo de fase) — só escale se o escopo real aparecer maior durante a execução.

## Framework principal: GSD
- Fonte oficial: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core).
- **Instalado no OpenCode:** 76 comandos (`~/.config/opencode/commands/gsd-*.md`), 76 skills (`~/.config/opencode/skills/gsd-*`), agents GSD (`~/.config/opencode/agents/gsd-*.md`) e core (`~/.config/opencode/gsd-core/`). Usar esses, não os do harness.
- **Cópia local vendorizada** em `vendor/get-shit-done/` como referência/backup.
- **Reinstalar (se quebrar):** `npx @opengsd/gsd-core@latest` (escolher runtime OpenCode). Não copiar arquivos de `agents/`/`commands/` manualmente.
- Loop principal: `/gsd-new-project` → `/gsd-discuss-phase N` → `/gsd-plan-phase N` → `/gsd-execute-phase N` → `/gsd-verify-work N` → `/gsd-ship N` → `/gsd-complete-milestone` / `/gsd-new-milestone`.
- Atalho rápido para tarefas ad-hoc: `/gsd-quick` (flags `--discuss`, `--research`, `--validate`, `--full`).
- Objetivo: manter contexto limpo por tarefa (evitar "context rot"), sem o overhead de specs formais pesadas.
- **Limitação conhecida:** os agents GSD (`gsd-project-researcher`, `gsd-research-synthesizer`, `gsd-roadmapper`, `gsd-debugger`, etc.) existem em `~/.config/opencode/agents/` e são referenciados pelos workflows GSD. Confirmar no runtime que estão carregados antes de delegar; se não estiverem, fazer o fallback inline previsto no workflow.

## Disciplina de código: karpathy-guidelines
Regras obrigatórias em toda alteração (carregar a skill `karpathy-guidelines`):
- Alterações cirúrgicas: toque apenas no que for necessário.
- Não tente "melhorar" código ou comentários adjacentes não relacionados ao pedido.
- Não refatore o que não está quebrado.
- Adapte-se ao estilo existente do código, mesmo que você faria diferente.
- Se notar código morto não relacionado, **mencione**, não apague sem avisar.

## Revisão de código: Open Code Review (OCR)
Referência: skill `open-code-review` (modo `ocr review`) e `references/delegate.md` (modo `ocr delegate`). Instalar via `npm install -g @alibaba-group/open-code-review` (comando `ocr`).

- CLI que combina engenharia determinística (seleção/agrupamento de arquivos) com um agente LLM para revisão.
- **Delegation Mode** (`ocr delegate`): deixa o próprio agente fazer a revisão, sem precisar configurar API key separada para o OCR.
- **Regra do harness:** nenhum merge sem passar por `ocr review`/`ocr delegate` primeiro (triagem) e depois revisão via agente de review (`web-code-reviewer`/`backend-code-reviewer`/`advpl-code-reviewer` conforme a camada) como gate final.

## Skills de capacidade (ferramentas)
Carregar conforme a necessidade durante a execução, não como roteamento de processo:
- `python-interpreter` — rodar snippets Python (cálculo, prototipagem, dados).
- `firecrawl-skill` — scrape/busca/mapa de sites em markdown LLM-ready (requer auth firecrawl).
- `web-browse-enhanced` — navegação DOM + screenshot via playwright (mais robusto que webfetch).

## Regras do harness (traduzidas de `.claude/rules/`)

### Coding (de `.claude/rules/coding.md`)
- Siga `karpathy-guidelines`: alterações cirúrgicas, sem refatoração não solicitada, sem "melhorias" adjacentes.
- Adapte-se ao estilo existente do arquivo antes de aplicar preferências pessoais.
- Código morto não relacionado: mencione no resumo da mudança, não apague sem avisar.
- TypeScript estrito; sem `any` sem justificativa em comentário.
- Nomes de variáveis/funções em português ou inglês, mas consistente dentro do mesmo arquivo.

### Testing (de `.claude/rules/testing.md`)
- TDD: RED-GREEN-REFACTOR para toda mudança de comportamento.
- Testes cobrem o caminho feliz e pelo menos um caso de borda por função pública.
- Nenhum merge com testes quebrados ou pulados (`skip`) sem justificativa registrada em `docs/DECISIONS.md`.

### Deploy (de `.claude/rules/deploy.md`) — Go-Live (Supabase + Vercel)
- Ordem: 1) Supabase (banco+segurança) → 2) Vercel (deploy) → 3) Domínio → 4) Verificação final.
- Migrations via CLI (`supabase db push`); nunca alterar schema manualmente em produção.
- RLS em **todas** as tabelas com dados de negócio; policies SELECT usam `auth.uid()`; nunca `USING (true)` em tabela não-pública; `service_role` key só em variáveis server-side; Storage buckets privados por padrão; MFA + Security Advisor sem críticos.
- Vercel: variáveis de ambiente no dashboard (nunca commitadas); headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- Verificação final: bundle sem `service_role` key; HTTPS ativo; Security Advisor re-executado pós-deploy.

## Onde cada coisa mora
- `projects/<nome>/` — cada projeto real, autocontido (próprio `package.json`, `src/`, `docs/`).
- `docs/` — specs GSD do próprio harness (não dos projetos individuais, que têm os próprios `docs/`).
- `~/.config/opencode/commands/gsd-*.md` — comandos GSD (OpenCode).
- `~/.config/opencode/skills/gsd-*` — skills GSD (OpenCode).
- `~/.config/opencode/agents/gsd-*.md` — agents GSD (OpenCode).
- `~/.config/opencode/gsd-core/workflows/*.md` — workflows GSD (OpenCode).
- `.claude/skills/` — skills vendorizadas do harness (karpathy-guidelines, open-code-review, responsive-design, hallmark).
- `.claude/rules/` — regras vendorizadas (coding, testing, deploy).
- `.claude/agents/` — agentes vendorizados (code-reviewer).
- `vendor/get-shit-done/` — backup da instalação GSD.

## Stack padrão
React + Next.js + TypeScript + Tailwind CSS, com shadcn/ui (componentes), Lucide React (ícones), Framer Motion (animações). HTML/JS puro sem framework **apenas** quando pedido explicitamente no prompt.

## Fluxo recomendado
1. Classificar o pedido pela tabela de "Roteamento automático" e escolher o comando certo, sem perguntar ao usuário.
2. Se for projeto/fase nova: registrar em `docs/PROJECT.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md` antes de codar.
3. Implementar seguindo a skill `karpathy-guidelines` e, se envolver UI, skills `hallmark` + `responsive-design`.
4. `open-code-review` (`ocr review`/`ocr delegate`) + agente de review — antes do merge.
5. `/gsd-verify-work` + `/gsd-ship` — checklist final (inclui `/run-tests`).
