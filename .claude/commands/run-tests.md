# /run-tests

Roda a suite de testes definida no `package.json` do projeto atual (dentro de `projects/<nome>/`) e resume falhas.

## Uso
- `/run-tests` — roda a suite completa.
- `/run-tests <arquivo-ou-padrão>` — roda só um subconjunto.

## Pré-requisito
O projeto precisa ter `npm test` definido antes da primeira feature real (ver `.claude/rules/testing.md`).

## Integração com o fluxo GSD
Rodar `/run-tests` é parte obrigatória do `/gsd-verify-work` antes de qualquer tarefa ser considerada concluída.
