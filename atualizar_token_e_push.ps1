# Script para atualizar token do GitHub e fazer push
# Execute este script após criar um novo token no GitHub

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZAR TOKEN E FAZER PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path ".git")) {
    Write-Host "❌ ERRO: Você precisa estar na pasta 'workspace' com Git inicializado" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ Repositório Git encontrado!" -ForegroundColor Green
Write-Host ""

# Solicitar novo token
Write-Host "Para criar um novo token do GitHub:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Clique em 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "3. Dê um nome (ex: 'Veredicta Local')" -ForegroundColor Cyan
Write-Host "4. Marque a opção 'repo' (todas as permissões de repositório)" -ForegroundColor Cyan
Write-Host "5. Clique em 'Generate token'" -ForegroundColor Cyan
Write-Host "6. COPIE O TOKEN (você só verá uma vez!)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cole o novo token abaixo:" -ForegroundColor Yellow
Write-Host ""

$newToken = Read-Host "Token do GitHub" -AsSecureString
$newTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($newToken)
)

if ([string]::IsNullOrWhiteSpace($newTokenPlain)) {
    Write-Host "❌ Token não pode estar vazio!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Atualizando token..." -ForegroundColor Yellow

# 1. Atualizar remote com novo token
Write-Host "[1/4] Configurando remote com novo token..." -ForegroundColor Yellow
git remote remove origin
git remote add origin "https://${newTokenPlain}@github.com/VeredictaJus/Veredicta.git"
Write-Host "✅ Remote atualizado!" -ForegroundColor Green
Write-Host ""

# 2. Atualizar hook post-commit
Write-Host "[2/4] Atualizando hook de push automático..." -ForegroundColor Yellow
$hookPath = Join-Path ".git" "hooks" "post-commit"

if (Test-Path $hookPath) {
    $hookContent = Get-Content $hookPath -Raw
    $hookContent = $hookContent -replace 'token="[^"]*"', "token=`"$newTokenPlain`""
    $hookContent | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline
    Write-Host "✅ Hook atualizado!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Hook não encontrado, criando novo..." -ForegroundColor Yellow
    $hooksDir = Join-Path ".git" "hooks"
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }
    
    $newHook = @"
#!/bin/sh
branch=`$(git rev-parse --abbrev-ref HEAD)
token="$newTokenPlain"
git push https://`${token}@github.com/VeredictaJus/Veredicta.git `$branch
exit 0
"@
    $newHook | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline
    Write-Host "✅ Hook criado!" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar status
Write-Host "[3/4] Verificando status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# 4. Fazer push
Write-Host "[4/4] Fazendo push para GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅✅✅ SUCESSO! PUSH REALIZADO! ✅✅✅" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seu código está no GitHub!" -ForegroundColor Cyan
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Agora o push automático está configurado!" -ForegroundColor Green
    Write-Host "Sempre que você fizer commit, o push acontecerá automaticamente! 🚀" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push falhou. Verifique:" -ForegroundColor Red
    Write-Host "1. O token está correto?" -ForegroundColor Yellow
    Write-Host "2. O token tem permissão 'repo'?" -ForegroundColor Yellow
    Write-Host "3. Você tem acesso ao repositório VeredictaJus/Veredicta?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tente novamente com:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
pause



