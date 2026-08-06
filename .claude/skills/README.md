# Skills deste harness

Estrutura no formato oficial Anthropic Agent Skills: pasta própria por skill, com `SKILL.md` contendo frontmatter YAML (`name` + `description`) no topo.

```
.claude/skills/
  karpathy-guidelines/
    SKILL.md
  open-code-review/
    SKILL.md
    references/
      delegate.md   (modo `ocr delegate`, material de apoio do skill)
  responsive-design/
    SKILL.md
```

- **get-shit-done (GSD)** — framework completo (plugin) vendorizado em `vendor/get-shit-done/` a partir de `gsd-build/get-shit-done`. Inclui `commands/`, `agents/`, `hooks/`, `workflows/`, `templates/`, `references/`, `contexts/`, `bin/` e `sdk/`. Instalação normal via `npx @opengsd/gsd-core@latest` (ver `CLAUDE.md`); o conteúdo vendorizado serve de referência e backup local.
- **karpathy-guidelines** — vendorizada com conteúdo completo em `.claude/skills/karpathy-guidelines/SKILL.md` (fonte: `szkocot/andrej-karpathy-skills`). Instalar a skill completa também via `npx skills add https://github.com/szkocot/andrej-karpathy-skills --skill karpathy-guidelines`.
- **open-code-review** — vendorizada com conteúdo completo em `.claude/skills/open-code-review/SKILL.md` (modo `ocr review`) e material de apoio em `.claude/skills/open-code-review/references/delegate.md` (modo `ocr delegate`, sem LLM próprio). Fonte: `alibaba/open-code-review`. Instalar a ferramenta via `npm install -g @alibaba-group/open-code-review`.
- **responsive-design** — vendorizada em `.claude/skills/responsive-design/SKILL.md`, adaptada de `mindrally/skills` e `manutej/luxor-claude-marketplace`.