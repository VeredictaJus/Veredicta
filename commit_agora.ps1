# Script para fazer commit agora
# Execute este script a partir da pasta workspace

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FAZENDO COMMIT E PUSH" -ForegroundColor Cyan
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
Write-Host "[1/3] Verificando alteracoes..." -ForegroundColor Yellow
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
Write-Host "[2/3] Adicionando arquivos ao staging..." -ForegroundColor Yellow
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
Write-Host "[3/3] Fazendo commit..." -ForegroundColor Yellow
$mensagem = "Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Mensagem: $mensagem" -ForegroundColor Cyan
Write-Host ""

git commit -m $mensagem

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  COMMIT REALIZADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "O push esta sendo feito automaticamente pelo hook..." -ForegroundColor Cyan
    Write-Host "Aguarde alguns segundos..." -ForegroundColor Yellow
    Write-Host ""
    
    # Aguardar um pouco para o hook executar
    Start-Sleep -Seconds 3
    
    # Verificar se o push foi feito
    $statusAfter = git status
    if ($statusAfter -match "Your branch is ahead") {
        Write-Host "Push pode nao ter acontecido automaticamente." -ForegroundColor Yellow
        Write-Host "Fazendo push manual..." -ForegroundColor Yellow
        $token = "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"
        git push "https://${token}@github.com/VeredictaJus/Veredicta.git" main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Push realizado com sucesso!" -ForegroundColor Green
        }
    } else {
        Write-Host "Push realizado automaticamente pelo hook!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Erro ao fazer commit" -ForegroundColor Red
    Write-Host "Verifique se ha alteracoes para commitar" -ForegroundColor Yellow
}

Write-Host ""
pause

