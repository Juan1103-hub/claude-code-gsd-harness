# DECISIONS.md — claude-code-gsd-harness (ADR simplificado)

## ADR-001 — GSD como framework principal (substitui gstack+GSD+Superpowers combinados)
**Contexto:** o harness anterior (`claude-code-harness-webstack`) combinava três frameworks (gstack, GSD, Superpowers), com overhead de contexto.
**Decisão:** este harness usa apenas GSD (`open-gsd/gsd-core`) como framework de processo, mais leve.
**Consequência:** menos camadas de perspectiva formal (sem papéis gstack); compensado por `karpathy-guidelines` (disciplina de código) e `open-code-review` (revisão).

## ADR-002 — Guardrails para vibe coding
**Contexto:** o usuário trabalha em estilo vibe coding (pede em linguagem natural, sem spec formal).
**Decisão:** compensar isso com `karpathy-guidelines` (evita diffs destrutivos) e `open-code-review` (triagem automática antes do merge).
**Consequência:** menos rigor na etapa de especificação, mais rigor na etapa de revisão/execução.

## ADR-004 — AGENTS.md como fonte de instruções do OpenCode (tradução do CLAUDE.md)
**Contexto:** o harness tem `CLAUDE.md` como fonte canônica, mas as referências são de Claude Code (`/gsd-*` como comando, `.claude/skills/`, agente `code-reviewer`), que no runtime OpenCode vivem em outros lugares (`~/.config/opencode/commands/`, `~/.config/opencode/skills/`, agents `web-code-reviewer`/`backend-code-reviewer`/`advpl-code-reviewer`).
**Decisão:** criar `AGENTS.md` na raiz do harness como versão OpenCode do `CLAUDE.md`, com mapa de correspondência Claude Code → OpenCode (comandos, skills, agents, `/run-tests`) e as regras do harness incorporadas. `CLAUDE.md` segue sendo a fonte canônica para Claude Code (vence em divergência).
**Consequência:** o OpenCode lê as instruções nativamente (AGENTS.md); o fluxo GSD no OpenCode usa os 76 comandos/agents/skills já instalados em `~/.config/opencode/`.
**Arquivos:** `AGENTS.md` (novo, raiz do harness); `~/.config/opencode/commands/run-tests.md` (novo, equivalente ao `.claude/commands/run-tests.md`).

## ADR-005 — Seção "Skills de capacidade" no AGENTS.md
**Contexto:** skills de ferramenta (`python-interpreter`, `firecrawl-skill`, `web-browse-enhanced`) foram integradas ao workflow, mas não pertencem à tabela de roteamento de processo (que decide qual comando GSD usar).
**Decisão:** adicionar seção própria no AGENTS.md listando as skills de capacidade, acionadas por demanda durante a execução. Não referenciar `9router`/`9router-chat` na seção.
**Consequência:** o agente sabe que essas skills existem e quando usá-las, sem poluir a tabela de roteamento nem carregar contexto extra.
**Arquivo:** `AGENTS.md` (seção "Skills de capacidade (ferramentas)").

## ADR-003 — Modelo principal fixo no 9router (não usar combo auto)
**Contexto:** turnos do agente morriam no meio da resposta ("socket connection was closed unexpectedly" no `opencode.log`). Causa raiz: `model: 9router/claude-claudecode2` era combo automático (~100 modelos via failover entre provedores), e a troca de provedor no meio da geração derrubava a stream.
**Decisão:** fixar `model` em `9router/gemini/gemini-3-flash-preview` (200 OK, finish_reason stop, ~3s nos testes diretos via `/v1/chat/completions`). Candidatos descartados: `oc/big-pickle`/`oc/deepseek-v4-flash-free` (funcionam mas 24–40s), `gemini/gemini-2.5-flash` (429, quota 20 req/dia), `ds/deepseek-chat` (402 sem saldo), `groq/qwen/qwen3-32b`/`ollama/*` (404), `kr/claude-sonnet-5` (402 kiro mensal).
**Consequência:** falha passa a ocorrer no início da requisição (retry limpo) em vez de no meio da geração. Backup do config antigo em `opencode.json.bak-pre-fix`. Risco: quota diária free-tier Gemini → se ocorrer 429, voltar ao combo ou usar `oc/big-pickle`.
**Arquivo:** `C:\Users\VCM37\.config\opencode\opencode.json` (campo `model`).
