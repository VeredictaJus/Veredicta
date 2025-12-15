# Script para restaurar o repositório Git automaticamente
# Este script será executado automaticamente

$ErrorActionPreference = "Stop"

Write-Host "=== Restaurando Repositório Git ===" -ForegroundColor Cyan
Write-Host ""

# Obter o diretório atual do workspace
$workspacePath = Split-Path -Parent $PSScriptRoot
if (-not $workspacePath) {
    $workspacePath = Get-Location
}

Write-Host "Diretório do workspace: $workspacePath" -ForegroundColor Yellow
Set-Location $workspacePath

# Verificar se já existe .git
if (Test-Path ".git") {
    Write-Host "⚠️  Já existe um repositório Git. Removendo..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 1. Inicializar repositório Git
Write-Host "1. Inicializando repositório Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    throw "Erro ao inicializar repositório Git"
}
Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
Write-Host ""

# 2. Configurar branch principal
Write-Host "2. Configurando branch principal como 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch configurada!" -ForegroundColor Green
Write-Host ""

# 3. Remover remote existente (se houver) e adicionar novo
Write-Host "3. Configurando repositório remoto..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/VeredictaJus/Veredicta.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl
Write-Host "✅ Remote 'origin' configurado: $remoteUrl" -ForegroundColor Green
Write-Host ""

# 4. Adicionar todos os arquivos
Write-Host "4. Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# 5. Fazer commit inicial
Write-Host "5. Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "Restore repository - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração para commitar ou commit já existe." -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit realizado!" -ForegroundColor Green
}
Write-Host ""

# 6. Configurar token e fazer push
Write-Host "6. Fazendo push para o GitHub..." -ForegroundColor Yellow
$token = "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"
$pushUrl = "https://${token}@github.com/VeredictaJus/Veredicta.git"

# Tentar push
git push $pushUrl main --force 2>&1 | ForEach-Object {
    if ($_ -match "error|fatal|denied") {
        Write-Host $_ -ForegroundColor Red
    } else {
        Write-Host $_
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Push pode ter falhado. Verifique a saída acima." -ForegroundColor Yellow
    Write-Host "Você pode tentar manualmente com:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Restauração Concluída ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifique no GitHub: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan

