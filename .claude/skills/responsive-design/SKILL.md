---
name: responsive-design
description: Diretrizes de design responsivo mobile-first para Next.js + Tailwind + shadcn/ui. Use ao criar ou alterar qualquer componente, tela ou layout, para garantir que funcione bem em telas pequenas (breakpoints, touch targets, drawer em mobile, imagens responsivas).
---

# responsive-design (skill vendorizada)

> Adaptada de `mindrally/skills:responsive-design` e `manutej/luxor-claude-marketplace:mobile-design`, para Next.js + Tailwind + shadcn/ui.

## Princípios
- Mobile-first: estilos base para mobile; `md:`/`lg:`/`xl:` só para melhorias em telas maiores.
- Breakpoints Tailwind: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
- Touch targets ≥44×44px; espaçamento mínimo 8px entre elementos clicáveis.
- `Drawer` (shadcn/ui) em vez de `Dialog` centralizado em telas pequenas.
- Imagens com `loading="lazy"` e `width`/`height` definidos.

## Checklist antes de finalizar uma tela
- [ ] Funciona em 375px sem scroll horizontal
- [ ] Botões/links com ≥44px de área de toque
- [ ] Modais viram `Drawer` em mobile quando fizer sentido
- [ ] Texto legível sem zoom (mínimo 16px em inputs)
