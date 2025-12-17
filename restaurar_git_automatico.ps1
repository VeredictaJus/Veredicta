# Script para restaurar repositório Git automaticamente
# Execute este script a partir da pasta workspace OU de qualquer lugar

$ErrorActionPreference = "Continue"

Write-Host "=== Restaurando Repositório Git ===" -ForegroundColor Cyan
Write-Host ""

# Tentar encontrar o diretório workspace
$workspacePath = $null

# Opção 1: Se o script está em workspace/, usar o diretório atual
if ($PSScriptRoot) {
    $possiblePath = Join-Path $PSScriptRoot "."
    if (Test-Path (Join-Path $possiblePath ".gitignore")) {
        $workspacePath = $possiblePath
    }
}

# Opção 2: Tentar caminho conhecido
if (-not $workspacePath) {
    $knownPath = Join-Path $env:USERPROFILE "OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace"
    if (Test-Path $knownPath) {
        $workspacePath = $knownPath
    }
}

# Opção 3: Procurar por diretório workspace com .gitignore
if (-not $workspacePath) {
    $searchPath = Join-Path $env:USERPROFILE "OneDrive\Documentos"
    if (Test-Path $searchPath) {
        $found = Get-ChildItem -Path $searchPath -Directory -Recurse -Depth 3 -Filter "workspace" -ErrorAction SilentlyContinue | 
            Where-Object { Test-Path (Join-Path $_.FullName ".gitignore") } | 
            Select-Object -First 1
        if ($found) {
            $workspacePath = $found.FullName
        }
    }
}

# Opção 4: Usar diretório atual se tiver .gitignore
if (-not $workspacePath) {
    $currentDir = Get-Location
    if (Test-Path (Join-Path $currentDir ".gitignore")) {
        $workspacePath = $currentDir
    }
}

if (-not $workspacePath) {
    Write-Host "❌ Não foi possível encontrar o diretório workspace." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, execute este script a partir da pasta workspace:" -ForegroundColor Yellow
    Write-Host "cd 'C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace'" -ForegroundColor Cyan
    Write-Host ".\restaurar_git_automatico.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Diretório encontrado: $workspacePath" -ForegroundColor Green
Set-Location $workspacePath
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Remover .git existente se houver
if (Test-Path ".git") {
    Write-Host "⚠️  Removendo repositório Git existente..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 1. Inicializar Git
Write-Host "1. Inicializando repositório Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao inicializar Git" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git inicializado!" -ForegroundColor Green
Write-Host ""

# 2. Configurar branch
Write-Host "2. Configurando branch principal como 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch configurada!" -ForegroundColor Green
Write-Host ""

# 3. Configurar remote
Write-Host "3. Configurando repositório remoto..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/VeredictaJus/Veredicta.git
Write-Host "✅ Remote configurado: https://github.com/VeredictaJus/Veredicta.git" -ForegroundColor Green
Write-Host ""

# 4. Adicionar arquivos
Write-Host "4. Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# 5. Fazer commit
Write-Host "5. Fazendo commit inicial..." -ForegroundColor Yellow
$commitMessage = "Restore repository - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração para commitar ou commit já existe." -ForegroundColor Yellow
} else {
    Write-Host "✅ Commit realizado!" -ForegroundColor Green
}
Write-Host ""

# 6. Fazer push
Write-Host "6. Fazendo push para o GitHub..." -ForegroundColor Yellow
$token = "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"
$pushUrl = "https://${token}@github.com/VeredictaJus/Veredicta.git"

Write-Host "Tentando push..." -ForegroundColor Cyan
$pushOutput = git push $pushUrl main --force 2>&1

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅✅✅ PUSH REALIZADO COM SUCESSO! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seu repositório foi restaurado e enviado para o GitHub!" -ForegroundColor Cyan
    Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Push pode ter falhado. Saída:" -ForegroundColor Yellow
    Write-Host $pushOutput
    Write-Host ""
    Write-Host "Tente manualmente:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou com token:" -ForegroundColor Cyan
    Write-Host '$token = "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"' -ForegroundColor White
    Write-Host 'git push https://${token}@github.com/VeredictaJus/Veredicta.git main' -ForegroundColor White
}

Write-Host ""
Write-Host "=== Concluído ===" -ForegroundColor Cyan

