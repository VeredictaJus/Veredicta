# Script para restaurar Git E configurar push automático
# Este script restaura o repositório e configura push automático após cada commit

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTAURAR GIT + PUSH AUTOMÁTICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tentar encontrar workspace
$workspacePath = $null

# Opção 1: Diretório atual se tiver .gitignore
if (Test-Path ".gitignore") {
    $workspacePath = Get-Location
}

# Opção 2: Caminho conhecido
if (-not $workspacePath) {
    $knownPath = Join-Path $env:USERPROFILE "OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"
    if (Test-Path $knownPath) {
        $workspacePath = $knownPath
        Set-Location $workspacePath
    }
}

if (-not $workspacePath -or -not (Test-Path ".gitignore")) {
    Write-Host "❌ ERRO: Execute este script a partir da pasta 'workspace'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute:" -ForegroundColor Yellow
    Write-Host 'cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"' -ForegroundColor Cyan
    Write-Host ".\configurar_git_automatico.ps1" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host "✅ Diretório encontrado: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Remover .git se existir
if (Test-Path ".git") {
    Write-Host "Removendo repositório Git antigo..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 1. Inicializar Git
Write-Host "[1/7] Inicializando Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao inicializar Git" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 2. Configurar branch
Write-Host "[2/7] Configurando branch 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 3. Configurar remote
Write-Host "[3/7] Configurando remote GitHub..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/VeredictaJus/Veredicta.git
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 4. Criar Git hook para push automático
Write-Host "[4/7] Configurando push automático..." -ForegroundColor Yellow

$hooksDir = Join-Path ".git" "hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Criar hook post-commit
$postCommitHook = @"
#!/bin/sh
# Hook para fazer push automático após commit
# Este hook é executado automaticamente após cada commit

# Obter branch atual
branch=`$(git rev-parse --abbrev-ref HEAD)

# Token do GitHub (substitua se necessário)
token="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"

# Fazer push automaticamente
git push https://`${token}@github.com/VeredictaJus/Veredicta.git `$branch

# Se falhar, não bloquear o commit (opcional)
exit 0
"@

# Criar hook para Windows (PowerShell)
$postCommitHookPS1 = @"
# Hook PowerShell para push automático após commit
`$branch = git rev-parse --abbrev-ref HEAD
`$token = "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"
git push "https://`${token}@github.com/VeredictaJus/Veredicta.git" `$branch
exit 0
"@

# Salvar hook post-commit (bash/sh)
$hookPath = Join-Path $hooksDir "post-commit"
$postCommitHook | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline

# Também criar versão PowerShell
$hookPathPS1 = Join-Path $hooksDir "post-commit.ps1"
$postCommitHookPS1 | Out-File -FilePath $hookPathPS1 -Encoding UTF8

# Tornar executável (no Windows, isso não é necessário, mas ajuda)
if (Get-Command chmod -ErrorAction SilentlyContinue) {
    chmod +x $hookPath
}

Write-Host "✅ Hook de push automático configurado!" -ForegroundColor Green
Write-Host ""

# 5. Adicionar arquivos
Write-Host "[5/7] Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 6. Fazer commit inicial
Write-Host "[6/7] Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "Restore repository with auto-push configuration"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração ou commit já existe" -ForegroundColor Yellow
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}
Write-Host ""

# 7. Fazer push inicial
Write-Host "[7/7] Fazendo push inicial..." -ForegroundColor Yellow
$token = "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"
$pushUrl = "https://${token}@github.com/VeredictaJus/Veredicta.git"

git push $pushUrl main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ SUCESSO! TUDO CONFIGURADO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora, sempre que você fizer um commit," -ForegroundColor Cyan
    Write-Host "o push será feito AUTOMATICAMENTE!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Teste fazendo:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Teste push automático'" -ForegroundColor White
    Write-Host ""
    Write-Host "O push acontecerá automaticamente! 🚀" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Push inicial pode ter falhado." -ForegroundColor Yellow
    Write-Host "Mas o hook automático está configurado!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tente manualmente:" -ForegroundColor Yellow
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
Write-Host ""
pause



