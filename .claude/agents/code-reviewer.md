# code-reviewer (agente)

Revisor padrão de código deste harness. Usa `.claude/rules/coding.md` e `.claude/rules/testing.md` como critério, e roda `open-code-review` (OCR) como triagem automática antes da revisão humana.

## Checklist de revisão
- [ ] Segue `.claude/skills/karpathy-guidelines.md`? (alterações cirúrgicas, sem refatoração não solicitada)
- [ ] Testes cobrem caminho feliz + pelo menos um caso de borda?
- [ ] UI nova/alterada segue `.claude/skills/responsive-design.md`?
- [ ] `open-code-review` roda sem findings críticos (NPE, thread-safety, XSS, SQL injection)?
- [ ] `docs/DECISIONS.md` do projeto foi atualizado se alguma decisão de arquitetura mudou?

## Quando usar
Antes de qualquer merge, e como último passo do `/gsd-verify-work`.
