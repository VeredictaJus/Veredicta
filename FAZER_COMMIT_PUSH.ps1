# Script para fazer commit e push
# Execute este script a partir da pasta workspace

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FAZER COMMIT E PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta no diretorio correto
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Execute este script a partir da pasta 'workspace'" -ForegroundColor Red
    Write-Host "Diretorio atual: $(Get-Location)" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Repositorio Git encontrado!" -ForegroundColor Green
Write-Host "Diretorio: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar status
Write-Host "[1/4] Verificando alteracoes..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host $status
    Write-Host ""
} else {
    Write-Host "Nenhuma alteracao pendente para commit" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 0
}

# 2. Adicionar arquivos
Write-Host "[2/4] Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "Arquivos adicionados!" -ForegroundColor Green
} else {
    Write-Host "Erro ao adicionar arquivos" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 3. Fazer commit
Write-Host "[3/4] Fazendo commit..." -ForegroundColor Yellow
Write-Host "Digite a mensagem do commit:" -ForegroundColor Cyan
$mensagem = Read-Host "Mensagem"

if ([string]::IsNullOrWhiteSpace($mensagem)) {
    $mensagem = "Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "Usando mensagem padrao: $mensagem" -ForegroundColor Yellow
}

git commit -m $mensagem

if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro ao fazer commit" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 4. Push (deve acontecer automaticamente pelo hook, mas vamos verificar)
Write-Host "[4/4] Verificando push automatico..." -ForegroundColor Yellow
Write-Host "O push deve acontecer automaticamente pelo hook configurado!" -ForegroundColor Cyan
Write-Host ""

# Aguardar um pouco para o hook executar
Start-Sleep -Seconds 2

# Verificar se o push foi feito
$statusAfter = git status
if ($statusAfter -match "Your branch is ahead") {
    Write-Host "Push pode nao ter acontecido automaticamente." -ForegroundColor Yellow
    Write-Host "Fazendo push manual..." -ForegroundColor Yellow
    $token = "SEU_TOKEN_AQUI"  # Removido por segurança
    git push "https://${token}@github.com/VeredictaJus/Veredicta.git" main
} else {
    Write-Host "Push realizado automaticamente pelo hook!" -ForegroundColor Green
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCESSO! COMMIT E PUSH REALIZADOS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push pode ter falhado. Tente manualmente:" -ForegroundColor Yellow
    Write-Host "git push origin main" -ForegroundColor White
}

Write-Host ""
pause



