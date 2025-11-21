# Script para desbloquear arquivos .env
# Execute este script no PowerShell: .\desbloquear-env.ps1

Write-Host "Desbloqueando arquivos .env..." -ForegroundColor Yellow

# Desbloquear todos os arquivos .env existentes
Get-ChildItem -Path . -Filter ".env*" -Force -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Unblock-File -Path $_.FullName -ErrorAction Stop
        $file = Get-Item $_.FullName
        $file.IsReadOnly = $false
        Write-Host "Desbloqueado: $($_.Name)" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao desbloquear $($_.Name): $_" -ForegroundColor Red
    }
}

# Criar .env.production se não existir
if (-not (Test-Path ".env.production")) {
    Write-Host ""
    Write-Host "Criando arquivo .env.production..." -ForegroundColor Yellow
    
    if (Test-Path "env.production.template") {
        Copy-Item "env.production.template" ".env.production"
        Unblock-File -Path ".env.production" -ErrorAction SilentlyContinue
        $envFile = Get-Item ".env.production"
        $envFile.IsReadOnly = $false
        
        Write-Host "Arquivo .env.production criado!" -ForegroundColor Green
        Write-Host "IMPORTANTE: Edite o arquivo .env.production e preencha suas chaves reais!" -ForegroundColor Yellow
    } else {
        Write-Host "Arquivo env.production.template nao encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Arquivo .env.production ja existe" -ForegroundColor Green
}

# Verificar status final
Write-Host ""
Write-Host "Status dos arquivos .env:" -ForegroundColor Cyan
Get-ChildItem -Path . -Filter ".env*" -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $file = Get-Item $_.FullName
    $status = if ($file.IsReadOnly) { "ReadOnly" } else { "Editable" }
    Write-Host "   $($_.Name): $status" -ForegroundColor White
}

Write-Host ""
Write-Host "Processo concluido!" -ForegroundColor Green
Write-Host "Dica: Se ainda tiver problemas, mova o projeto para fora do OneDrive" -ForegroundColor Yellow
