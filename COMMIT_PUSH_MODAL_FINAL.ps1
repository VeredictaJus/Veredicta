# Script para fazer commit e push das melhorias do modal
# Execute no PowerShell a partir do diretório workspace (raiz do repositório git)

$token = "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"

Write-Host "=== Fazendo commit e push das melhorias do modal ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto (deve ter .git aqui)
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Não foi encontrado um repositório git neste diretório." -ForegroundColor Red
    Write-Host ""
    Write-Host "O repositório git está em: workspace (raiz)" -ForegroundColor Yellow
    Write-Host "Por favor, navegue até lá primeiro:" -ForegroundColor Yellow
    Write-Host "cd 'C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Repositório git encontrado!" -ForegroundColor Green
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar status
Write-Host "1. Verificando alterações..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Adicionar arquivo modificado (caminho relativo ao workspace)
Write-Host "2. Adicionando arquivo modificado..." -ForegroundColor Yellow
git add veredicta/src/pages/client/ClientDashboard.tsx

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro ao adicionar arquivo. Verificando se o arquivo existe..." -ForegroundColor Yellow
    if (Test-Path "veredicta/src/pages/client/ClientDashboard.tsx") {
        Write-Host "✅ Arquivo existe. Tentando novamente..." -ForegroundColor Green
        git add veredicta/src/pages/client/ClientDashboard.tsx
    } else {
        Write-Host "❌ Arquivo não encontrado em: veredicta/src/pages/client/ClientDashboard.tsx" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Arquivo adicionado!" -ForegroundColor Green
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
    Write-Host "Execute 'git status' para ver o que está pendente." -ForegroundColor Cyan
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
    Write-Host "O deploy automático no Vercel deve iniciar em breve." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique a saída acima." -ForegroundColor Red
    exit 1
}



