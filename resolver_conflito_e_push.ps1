# Script para resolver conflito e fazer push
# Este script faz pull primeiro e depois push, ou força o push se necessário

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESOLVER CONFLITO E FAZER PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path ".git")) {
    Write-Host "❌ ERRO: Execute este script a partir da pasta 'workspace'" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ Repositório Git encontrado!" -ForegroundColor Green
Write-Host ""

# Token
$token = "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"

# Configurar remote
Write-Host "[1/5] Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://${token}@github.com/VeredictaJus/Veredicta.git"
Write-Host "✅ Remote configurado!" -ForegroundColor Green
Write-Host ""

# Buscar informações do remoto
Write-Host "[2/5] Buscando informações do repositório remoto..." -ForegroundColor Yellow
git fetch origin main 2>&1 | Out-Null
Write-Host "✅ Informações buscadas!" -ForegroundColor Green
Write-Host ""

# Verificar se há diferenças
Write-Host "[3/5] Verificando diferenças..." -ForegroundColor Yellow
$localCommit = git rev-parse HEAD 2>$null
$remoteCommit = git rev-parse origin/main 2>$null

if ($remoteCommit -and $localCommit -ne $remoteCommit) {
    Write-Host "⚠️  O repositório remoto tem commits diferentes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Escolha uma opção:" -ForegroundColor Cyan
    Write-Host "1. Fazer pull e mesclar (recomendado)" -ForegroundColor White
    Write-Host "2. Forçar push (sobrescreve o remoto)" -ForegroundColor White
    Write-Host ""
    $opcao = Read-Host "Digite 1 ou 2"
    
    if ($opcao -eq "2") {
        Write-Host ""
        Write-Host "[4/5] Fazendo push forçado..." -ForegroundColor Yellow
        git push -f origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅✅✅ PUSH FORÇADO REALIZADO COM SUCESSO! ✅✅✅" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Push forçado falhou" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "[4/5] Fazendo pull e mesclando..." -ForegroundColor Yellow
        git pull origin main --allow-unrelated-histories --no-edit
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "⚠️  Pode haver conflitos. Resolva manualmente e depois faça:" -ForegroundColor Yellow
            Write-Host "git add ." -ForegroundColor White
            Write-Host "git commit -m 'Merge remote changes'" -ForegroundColor White
            Write-Host "git push origin main" -ForegroundColor White
            pause
            exit 1
        }
        
        Write-Host ""
        Write-Host "[5/5] Fazendo push..." -ForegroundColor Yellow
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅✅✅ PUSH REALIZADO COM SUCESSO! ✅✅✅" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Push falhou" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "[4/5] Fazendo push..." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅✅✅ PUSH REALIZADO COM SUCESSO! ✅✅✅" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Push falhou" -ForegroundColor Red
        exit 1
    }
}

# Configurar hook automático
Write-Host ""
Write-Host "Configurando hook de push automático..." -ForegroundColor Yellow
$hooksDir = Join-Path ".git" "hooks"
$hookPath = Join-Path $hooksDir "post-commit"

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
Write-Host "✅ Hook configurado!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 TUDO CONFIGURADO COM SUCESSO! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Seu código está no GitHub!" -ForegroundColor Cyan
Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Push automático configurado!" -ForegroundColor Green
Write-Host "Agora, sempre que você fizer commit, o push acontecerá automaticamente! 🚀" -ForegroundColor Green
Write-Host ""
pause



