# Script para restaurar o repositório Git e reconectar ao GitHub
# Execute este script a partir da pasta workspace

Write-Host "=== Restaurando Repositório Git ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se já existe um repositório Git
if (Test-Path ".git") {
    Write-Host "⚠️  Já existe um repositório Git neste diretório." -ForegroundColor Yellow
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
    git status
    Write-Host ""
    Write-Host "Deseja continuar mesmo assim? (S/N): " -NoNewline
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        exit 0
    }
}

# Inicializar repositório Git (se não existir)
if (-not (Test-Path ".git")) {
    Write-Host "1. Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao inicializar repositório Git." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git já existe!" -ForegroundColor Green
}

Write-Host ""

# Configurar branch principal como 'main'
Write-Host "2. Configurando branch principal como 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch configurada!" -ForegroundColor Green
Write-Host ""

# Configurar remote
Write-Host "3. Configurando repositório remoto..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/VeredictaJus/Veredicta.git"

# Verificar se o remote já existe
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Remote 'origin' já existe: $existingRemote" -ForegroundColor Yellow
    Write-Host "Deseja atualizar para: $remoteUrl ? (S/N): " -NoNewline
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        git remote set-url origin $remoteUrl
        Write-Host "✅ Remote atualizado!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Mantendo remote existente." -ForegroundColor Cyan
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote 'origin' adicionado: $remoteUrl" -ForegroundColor Green
}

Write-Host ""

# Verificar status
Write-Host "4. Verificando status do repositório..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Mostrar informações do remote
Write-Host "5. Informações do repositório remoto:" -ForegroundColor Yellow
git remote -v
Write-Host ""

Write-Host "=== Restauração Concluída ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para fazer commit e push:" -ForegroundColor Cyan
Write-Host "1. Adicione os arquivos: git add ." -ForegroundColor White
Write-Host "2. Faça commit: git commit -m 'Sua mensagem aqui'" -ForegroundColor White
Write-Host "3. Faça push: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "OU use o token do script:" -ForegroundColor Cyan
Write-Host '$token = "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"' -ForegroundColor White
Write-Host 'git push https://${token}@github.com/VeredictaJus/Veredicta.git main' -ForegroundColor White
Write-Host ""

