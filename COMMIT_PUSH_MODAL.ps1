# Script para fazer commit e push das melhorias do modal
# Execute no PowerShell a partir do diretório workspace

$token = "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"

Write-Host "=== Fazendo commit e push das melhorias do modal ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Não foi encontrado um repositório git neste diretório." -ForegroundColor Red
    Write-Host "Por favor, navegue até o diretório do repositório git (workspace) e execute este script novamente." -ForegroundColor Yellow
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "1. Verificando alterações..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Adicionar arquivos modificados
Write-Host "2. Adicionando arquivos..." -ForegroundColor Yellow
git add src/pages/client/ClientDashboard.tsx

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro ao adicionar arquivos." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Fazer commit
Write-Host "3. Fazendo commit..." -ForegroundColor Yellow
git commit -m "Melhora tratamento de erros 400 e lógica do modal de boas-vindas

- Aumenta janela de detecção de cliente novo de 5 para 30 minutos
- Aumenta número de tentativas de verificação de plano de 3 para 5
- Melhora tratamento específico para erros 400 (Bad Request)
- Adiciona fallback para mostrar modal mesmo com erros de query
- Melhora logs de debug para facilitar identificação de problemas"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro no commit. Verifique se há alterações para commitar." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Fazer push
Write-Host "4. Fazendo push..." -ForegroundColor Yellow
git push https://${token}@github.com/VeredictaJus/Veredicta.git master:main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "As alterações foram enviadas para o GitHub!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique a saída acima." -ForegroundColor Red
    exit 1
}
