# ============================================
# SCRIPT PARA RESTAURAR REPOSITÓRIO GIT
# Execute este script no PowerShell
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTAURAR REPOSITÓRIO GIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path ".gitignore")) {
    Write-Host "❌ ERRO: Você precisa estar na pasta 'workspace'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute:" -ForegroundColor Yellow
    Write-Host "cd 'C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace'" -ForegroundColor Cyan
    Write-Host ".\EXECUTAR_AGORA.ps1" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Diretório correto detectado!" -ForegroundColor Green
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Remover .git se existir
if (Test-Path ".git") {
    Write-Host "Removendo repositório Git antigo..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 1. Inicializar Git
Write-Host "[1/6] Inicializando Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Erro!" -ForegroundColor Red; pause; exit 1 }
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 2. Configurar branch
Write-Host "[2/6] Configurando branch 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 3. Configurar remote
Write-Host "[3/6] Configurando remote GitHub..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/VeredictaJus/Veredicta.git
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 4. Adicionar arquivos
Write-Host "[4/6] Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ OK" -ForegroundColor Green
Write-Host ""

# 5. Fazer commit
Write-Host "[5/6] Fazendo commit..." -ForegroundColor Yellow
git commit -m "Restore repository - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração ou commit já existe" -ForegroundColor Yellow
} else {
    Write-Host "✅ OK" -ForegroundColor Green
}
Write-Host ""

# 6. Fazer push
Write-Host "[6/6] Fazendo push para GitHub..." -ForegroundColor Yellow
$token = "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"
$pushUrl = "https://${token}@github.com/VeredictaJus/Veredicta.git"

git push $pushUrl main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ SUCESSO! REPOSITÓRIO RESTAURADO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Push pode ter falhado. Tente manualmente:" -ForegroundColor Yellow
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
pause



