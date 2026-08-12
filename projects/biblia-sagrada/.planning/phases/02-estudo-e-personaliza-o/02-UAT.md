---
status: complete
phase: 02-estudo-e-personaliza-o
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md]
started: "2026-08-11T12:55:00Z"
updated: "2026-08-11T19:58:00Z"
---

## Current Test

[testing complete]

## Tests

### 1. Troca de tradução tb↔alm1911 sem reload
expected: Abrir João 3 (?b=42&c=2) → clicar no botão de tradução no header → selecionar ALM 1911 → texto do capítulo muda para Almeida 1911 → URL contém v=alm1911 → localStorage bs-version === "alm1911" → trocar de volta para TB → bs-version === "tb" → recarregar página → versão persiste
result: pass

### 2. BLIVRE baixável sob demanda com leitura offline
expected: Abrir seletor de tradução → BLIVRE mostra botão "Baixar" → clicar → modal com progresso N/66 → chega a 66/66 → badge "Baixada" aparece → selecionar BLIVRE → capítulo carrega → desligar rede (modo offline) → recarregar página → capítulo BLIVRE ainda legível
result: pass

### 3. Busca FTS offline com MiniSearch
expected: Clicar na aba "Busca" → digitar "amor" → resultados aparecem em <1s com termos destacados em <mark> → clicar no primeiro resultado → leitor abre no capítulo correto com ?b=&c= → trocar filtro para ALM 1911 → resultados refletem o índice alm1911
result: pass

### 4. Shell single-page com tab bar Leitura/Busca/Estudo
expected: Navegar entre as 3 abas (Leitura, Busca, Estudo) → cada aba carrega sua view (Reader, SearchView, StudyView) → abas têm aria-current indicando a ativa → conteúdo de cada aba é funcional (leitor, busca, estudo)
result: pass

### 5. Marcadores 5 cores por versículo persistidos em IDB
expected: Abrir Gênesis 1 → clicar no versículo 1 → bottom sheet abre com 5 cores → tocar amarelo → versículo ganha backgroundColor amarelo → recarregar página → destaque persiste → repetir com outras cores → remover marcador → destaque some
result: pass

### 6. Anotações por versículo (painel + aba Notas)
expected: Clicar em versículo → bottom sheet abre → digitar anotação "teste" → Salvar → ícone ✎ aparece no versículo → navegar para aba Estudo → aba Notas → anotação aparece na lista com abbrev cap:versículo → clicar na anotação → leitor abre no capítulo correto
result: pass

### 7. Planos de leitura com progresso persistido
expected: Navegar para aba Estudo → aba Planos → card "Bíblia em 1 ano" mostra progresso 0/298 (0%) → expandir → dia 1 com leituras (Gn 1, Gn 2, Gn 3) → clicar "Marcar dia 1 concluído" → progresso atualiza para 1/298 → recarregar página → progresso persiste → clicar numa leitura do dia → leitor abre no capítulo correto → abrir/ler capítulo NÃO marca dia automaticamente
result: pass

### 8. Dicionário bíblico offline (~167 verbetes)
expected: Dicionário bíblico offline (~167 verbetes)
result: pass
source: automated
coverage_id: D2

### 9. Temas 'O que a Bíblia diz' (12 temas com versículos embarcados)
expected: Temas 'O que a Bíblia diz' (12 temas com versículos embarcados)
result: pass
source: automated
coverage_id: D3

### 10. Hinário ~49 hinos PD offline
expected: Hinário ~49 hinos PD offline
result: pass
source: automated
coverage_id: D3

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
