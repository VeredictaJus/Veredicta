# Script para inicializar o repositório Git e configurar o remote
# Execute este script a partir da pasta workspace

Write-Host "=== Inicializando Repositório Git ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se já existe um repositório Git
if (Test-Path ".git") {
    Write-Host "⚠️  Já existe um repositório Git neste diretório." -ForegroundColor Yellow
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
    git status
    exit 0
}

# Inicializar repositório Git
Write-Host "1. Inicializando repositório Git..." -ForegroundColor Yellow
git init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao inicializar repositório Git." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
Write-Host ""

# Configurar branch principal como 'main'
Write-Host "2. Configurando branch principal como 'main'..." -ForegroundColor Yellow
git branch -M main

Write-Host "✅ Branch configurada!" -ForegroundColor Green
Write-Host ""

# Adicionar remote (se ainda não existir)
Write-Host "3. Configurando repositório remoto..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/VeredictaJus/Veredicta.git"

# Verificar se o remote já existe
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Remote 'origin' já existe: $existingRemote" -ForegroundColor Yellow
    Write-Host "Deseja atualizar? (S/N): " -NoNewline
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        git remote set-url origin $remoteUrl
        Write-Host "✅ Remote atualizado!" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote 'origin' adicionado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Configuração Concluída ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Adicione os arquivos: git add ." -ForegroundColor Cyan
Write-Host "2. Faça o primeiro commit: git commit -m 'Initial commit'" -ForegroundColor Cyan
Write-Host "3. Faça push: git push -u origin main" -ForegroundColor Cyan
Write-Host ""

