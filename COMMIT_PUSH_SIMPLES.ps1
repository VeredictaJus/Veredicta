# Script simples para commit e push
# Execute a partir do diretório workspace (raiz do git)

Write-Host "=== Commit e Push ===" -ForegroundColor Cyan
Write-Host ""

# Navegar para workspace (raiz do git)
$workspacePath = Split-Path -Parent $PSScriptRoot
Set-Location $workspacePath

Write-Host "Diretório: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Adicionar tudo
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "Atualização: melhorias e correções"

# Push
Write-Host "Fazendo push..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    git push origin master
}

Write-Host ""
Write-Host "✅ Pronto!" -ForegroundColor Green



