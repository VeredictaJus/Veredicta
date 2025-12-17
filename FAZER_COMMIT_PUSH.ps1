# Script para fazer commit e push para o Vercel
# Execute este script a partir do diretório workspace (raiz do repositório git)

Write-Host "=== Fazendo commit e push para o Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório workspace (raiz do repositório git)
$workspacePath = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $workspacePath

Write-Host "Navegando para: $workspaceRoot\workspace" -ForegroundColor Yellow
Set-Location "$workspaceRoot\workspace"

if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Não foi encontrado um repositório git em workspace" -ForegroundColor Red
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, certifique-se de que está na pasta workspace (raiz do git)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Repositório git encontrado!" -ForegroundColor Green
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar status
Write-Host "1. Verificando alterações..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Verificar se há alterações
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "⚠️  Nenhuma alteração para commitar." -ForegroundColor Yellow
    Write-Host "Tudo está atualizado!" -ForegroundColor Green
    exit 0
}

# Adicionar todas as alterações
Write-Host "2. Adicionando todas as alterações..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao adicionar arquivos." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Fazer commit
Write-Host "3. Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Atualização: melhorias e correções diversas"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro no commit. Verifique se há alterações para commitar." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Verificar remote
Write-Host "4. Verificando repositório remoto..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Remote 'origin' não configurado. Configurando..." -ForegroundColor Yellow
    git remote add origin https://github.com/VeredictaJus/Veredicta.git
    $remote = git remote get-url origin
}

Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

# Fazer push
Write-Host "5. Fazendo push para o GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Tentando push para branch master..." -ForegroundColor Yellow
    git push origin master
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "As alterações foram enviadas para o GitHub!" -ForegroundColor Cyan
    Write-Host "O deploy automático no Vercel deve iniciar em breve." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique:" -ForegroundColor Red
    Write-Host "   - Se você tem permissão no repositório" -ForegroundColor Yellow
    Write-Host "   - Se a branch está correta (main ou master)" -ForegroundColor Yellow
    Write-Host "   - Se há alterações remotas que precisam ser puxadas primeiro" -ForegroundColor Yellow
    exit 1
}



