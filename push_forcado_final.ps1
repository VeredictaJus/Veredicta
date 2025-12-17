# Script para fazer push forcado e finalizar configuracao
# Este script sobrescreve o repositorio remoto com o codigo local

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH FORCADO - RESTAURAR REPOSITORIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta no diretorio correto
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Execute este script a partir da pasta 'workspace'" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Repositorio Git encontrado!" -ForegroundColor Green
Write-Host ""

# Token
$token = "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"

# Configurar remote
Write-Host "[1/3] Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://${token}@github.com/VeredictaJus/Veredicta.git"
Write-Host "Remote configurado!" -ForegroundColor Green
Write-Host ""

# Fazer push forcado
Write-Host "[2/3] Fazendo push forcado (sobrescrevendo remoto)..." -ForegroundColor Yellow
Write-Host "Isso vai sobrescrever o repositorio no GitHub com seu codigo local" -ForegroundColor Yellow
Write-Host ""

git push -f origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Push forcado realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push forcado falhou" -ForegroundColor Red
    Write-Host "Tente manualmente: git push -f origin main" -ForegroundColor Yellow
    pause
    exit 1
}

# Configurar hook automatico
Write-Host ""
Write-Host "[3/3] Configurando hook de push automatico..." -ForegroundColor Yellow
$hooksDir = Join-Path ".git" "hooks"
$hookPath = Join-Path $hooksDir "post-commit"

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Criar hook sem caracteres especiais problemáticos
$newHook = "#!/bin/sh`n"
$newHook += "branch=`$(git rev-parse --abbrev-ref HEAD)`n"
$newHook += "token=`"$token`"`n"
$newHook += "git push https://`${token}@github.com/VeredictaJus/Veredicta.git `$branch`n"
$newHook += "exit 0`n"

$newHook | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline
Write-Host "Hook configurado!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TUDO CONFIGURADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Seu codigo esta no GitHub!" -ForegroundColor Cyan
Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
Write-Host ""
Write-Host "Push automatico configurado!" -ForegroundColor Green
Write-Host "Agora, sempre que voce fizer commit, o push acontecera automaticamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Teste fazendo:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Teste push automatico'" -ForegroundColor White
Write-Host ""
Write-Host "O push acontecera automaticamente!" -ForegroundColor Cyan
Write-Host ""
pause
