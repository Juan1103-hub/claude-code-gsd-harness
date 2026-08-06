# DECISIONS.md — claude-code-gsd-harness (ADR simplificado)

## ADR-001 — GSD como framework principal (substitui gstack+GSD+Superpowers combinados)
**Contexto:** o harness anterior (`claude-code-harness-webstack`) combinava três frameworks (gstack, GSD, Superpowers), com overhead de contexto.
**Decisão:** este harness usa apenas GSD (`open-gsd/gsd-core`) como framework de processo, mais leve.
**Consequência:** menos camadas de perspectiva formal (sem papéis gstack); compensado por `karpathy-guidelines` (disciplina de código) e `open-code-review` (revisão).

## ADR-002 — Guardrails para vibe coding
**Contexto:** o usuário trabalha em estilo vibe coding (pede em linguagem natural, sem spec formal).
**Decisão:** compensar isso com `karpathy-guidelines` (evita diffs destrutivos) e `open-code-review` (triagem automática antes do merge).
**Consequência:** menos rigor na etapa de especificação, mais rigor na etapa de revisão/execução.
