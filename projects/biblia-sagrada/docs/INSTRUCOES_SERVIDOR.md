# Como Rodar o Servidor Localhost

Projeto: Bíblia Sagrada (Next.js 16 + Serwist PWA)

Para evitar problemas de porta ocupada, travamentos e 500, siga esta ordem:

## 1. Gerar o build de produção

```powershell
npm run build
```

## 2. Matar qualquer processo na porta 3000

```powershell
$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conns) { $conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }
```

## 3. Iniciar o servidor em background

```powershell
# Ajuste o nome da pasta do harness se a sua for diferente (ex: claude-code-gsd-harness)
$proj = Join-Path $HOME "claude-code-gsd-harness-main\projects\biblia-sagrada"
Start-Process "npm.cmd" -ArgumentList "start" -WorkingDirectory $proj -WindowStyle Hidden
```

> Atenção: use `npm.cmd` (não `npm`) no Start-Process do Windows — `npm` resolve como script e falha.

## 4. Verificar se está rodando (HTTP 200)

```powershell
try { $r = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 10; "HTTP $($r.StatusCode)" } catch { "ERRO: $($_.Exception.Message)" }
```

## Modo desenvolvimento (porta 3001 se 3000 ocupada)

```powershell
npm run dev
```

## Se travar ou der erro 500 — rodar em foreground para ver o erro real

```powershell
# 1. Mate o processo na porta 3000
$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conns) { $conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }

# 2. Rode em foreground (o erro real aparece no terminal)
npm start
```

## Causa raiz que já foi corrigida (11/08/2026)

- A pasta `src/app` não era reconhecida pelo Next.js como App Router — movida para `app/` na raiz.
- Coexistência de configs: `next.config.ts` (novo, ativo, com `collectPublicFiles`) e `next.config.js` (antigo, deletado) causavam precache incompleto. Manter APENAS `next.config.ts`.
- O script de tema antecipado no `layout.tsx` usava `LayoutProps<"/">` — trocado por `{ children: React.ReactNode }`.
- Service worker do Serwist NÃO registra automaticamente — `SerwistProvider` de `@serwist/next/react` foi adicionado ao `app/layout.tsx` com `swUrl="/sw.js"`.
- `history.replaceState` recebia `URL` object em vez de string — causava `DataCloneError` no `messageSW` e quebrava o cache de navegação offline. Corrigido com `url.toString()` em `src/components/reader.tsx`.
- Dados `/data/**` (ALM1911 + TB) são precacheados via `collectPublicFiles()` em `next.config.ts` — sem isso o leitor offline falha.
