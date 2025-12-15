# Script corrigido para fazer push com o novo token
# Execute este script a partir da pasta workspace

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FAZENDO PUSH COM NOVO TOKEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path ".git")) {
    Write-Host "❌ ERRO: Execute este script a partir da pasta 'workspace'" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute:" -ForegroundColor Yellow
    Write-Host 'cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"' -ForegroundColor Cyan
    Write-Host ".\corrigir_e_fazer_push.ps1" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host "✅ Repositório Git encontrado!" -ForegroundColor Green
Write-Host "Diretório: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Token fornecido
$token = "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"

# 1. Atualizar remote
Write-Host "[1/4] Atualizando remote com novo token..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://${token}@github.com/VeredictaJus/Veredicta.git"
Write-Host "✅ Remote atualizado!" -ForegroundColor Green
Write-Host ""

# 2. Atualizar hook automático (CORRIGIDO)
Write-Host "[2/4] Atualizando hook de push automático..." -ForegroundColor Yellow
$hooksDir = Join-Path ".git" "hooks"
$hookPath = Join-Path $hooksDir "post-commit"

if (Test-Path $hookPath) {
    $hookContent = Get-Content $hookPath -Raw
    $hookContent = $hookContent -replace 'token="[^"]*"', "token=`"$token`""
    $hookContent | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline
    Write-Host "✅ Hook atualizado!" -ForegroundColor Green
} else {
    Write-Host "Criando hook automático..." -ForegroundColor Yellow
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }
    
    $newHook = @"
#!/bin/sh
branch=`$(git rev-parse --abbrev-ref HEAD)
token="$token"
git push https://`${token}@github.com/VeredictaJus/Veredicta.git `$branch
exit 0
"@
    $newHook | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline
    Write-Host "✅ Hook criado!" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar status
Write-Host "[3/4] Verificando alterações..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host $status
} else {
    Write-Host "Nenhuma alteração pendente" -ForegroundColor Cyan
}
Write-Host ""

# 4. Fazer push
Write-Host "[4/4] Fazendo push para GitHub..." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅✅✅ SUCESSO! PUSH REALIZADO! ✅✅✅" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Seu código está no GitHub!" -ForegroundColor Cyan
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Push automático configurado!" -ForegroundColor Green
    Write-Host "Agora, sempre que você fizer commit, o push acontecerá automaticamente! 🚀" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push falhou. Verifique:" -ForegroundColor Red
    Write-Host "1. O token está correto?" -ForegroundColor Yellow
    Write-Host "2. Você tem acesso ao repositório?" -ForegroundColor Yellow
    Write-Host "3. Tente novamente:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor White
}

Write-Host ""
pause

