# Open Code Review / OCR (referência vendorizada)

> Fonte oficial: [alibaba/open-code-review](https://github.com/alibaba/open-code-review) (Apache-2.0). Nasceu como ferramenta interna da Alibaba, usada por milhares de devs, depois open-source. Documentação completa: [open-codereview.ai/docs](https://open-codereview.ai/docs).

## O que é
CLI de code review com IA (comando `ocr`). Lê o diff do Git, envia os arquivos alterados para um LLM configurável via um agente com uso de ferramentas, e gera comentários de revisão com precisão de linha. Também faz `ocr scan` (revisa arquivos inteiros, sem precisar de diff — bom para auditar código legado).

## Por que não é "só mais um agente genérico revisando código"
Combina **engenharia determinística** (garante o que não pode falhar: seleção exata de quais arquivos revisar, agrupamento inteligente de arquivos relacionados em uma única unidade de revisão, casamento fino de regras por tipo de arquivo, módulos externos de posicionamento/reflexão do comentário) com um **agente LLM** (decisões dinâmicas, prompts e toolset otimizados para revisão). Isso resolve os 3 problemas clássicos de agentes genéricos fazendo review: cobertura incompleta em changesets grandes, comentários na linha errada, e qualidade instável entre execuções.

## Instalação
```bash
npm install -g @alibaba-group/open-code-review
```
Depois disso o comando `ocr` fica disponível globalmente. Requer **Git >= 2.41**.

## Uso básico
```bash
ocr config provider   # escolhe provider de LLM (built-in ou custom)
ocr config model       # escolhe o modelo

ocr review                                   # revisa mudanças staged/unstaged/untracked
ocr review --from main --to feature-branch   # revisa um range de branches
ocr review --commit abc123                    # revisa um commit específico
ocr scan                                      # revisa arquivos inteiros (sem git history)
```

## Delegation Mode (importante para quem já usa Claude Code)
```bash
ocr delegate preview
ocr delegate rule src/arquivo1.ts src/arquivo2.ts
```
Nesse modo, o **Claude Code faz a revisão usando sua própria sessão/LLM** — o OCR só cuida da seleção de arquivos e das regras. **Não precisa configurar/pagar uma API key separada para o OCR** nesse caso (correção da versão anterior deste arquivo, que dizia que era obrigatório configurar um LLM próprio).

## Integração com Claude Code
Existe um plugin oficial com slash commands de review (`plugins/open-code-review/README.md` no repositório) e uma skill portátil compatível com agentes que suportam Agent Skills.

## Regra do harness
Nenhum merge sem passar por `ocr review` (ou `ocr delegate` via Claude Code) primeiro, seguido de revisão humana ou do agente `code-reviewer` (gate final). Ver `.claude/agents/code-reviewer.md`.
