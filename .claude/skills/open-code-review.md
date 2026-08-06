# open-code-review / OCR (skill vendorizada — referência)

> Fonte: `alibaba/open-code-review`. Instalar via `npx skills add alibaba/open-code-review --skill open-code-review` (ou plugin `/plugin install open-code-review@open-code-review`).

## O que é
CLI em Go que combina regras determinísticas (engenharia clássica) com revisão via LLM para as partes que exigem julgamento.

## Regras determinísticas prontas
- NPE (null pointer / referências nulas)
- Thread-safety / condições de corrida
- XSS
- SQL injection

## Requisito de configuração
Exige um endpoint de LLM próprio (Anthropic ou OpenAI-compatível) configurado com API key — cada execução gera custo de tokens.

## Regra do harness
Nenhum merge sem passar por OCR (triagem automática) primeiro, seguido de revisão humana ou do agente `code-reviewer` (gate final). Ver `.claude/agents/code-reviewer.md`.
