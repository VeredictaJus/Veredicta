# Script para fazer commit e push para o Vercel
# Execute este script a partir do diretório raiz do projeto
# C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)

Write-Host "=== Fazendo commit e push para o Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório correto (deve ter .git aqui ou em workspace)
if (-not (Test-Path ".git") -and -not (Test-Path "workspace\.git")) {
    Write-Host "⚠️  Repositório git não encontrado." -ForegroundColor Yellow
    Write-Host "Tentando inicializar repositório git..." -ForegroundColor Yellow
    
    # Tentar inicializar git na raiz
    git init
    git remote add origin https://github.com/VeredictaJus/Veredicta.git 2>$null
    Write-Host "✅ Repositório git inicializado!" -ForegroundColor Green
    Write-Host ""
}

# Verificar onde está o .git
$gitDir = if (Test-Path ".git") { "." } elseif (Test-Path "workspace\.git") { "workspace" } else { $null }

if ($null -eq $gitDir) {
    Write-Host "❌ Não foi possível encontrar ou criar repositório git." -ForegroundColor Red
    exit 1
}

if ($gitDir -ne ".") {
    Write-Host "Git encontrado em: $gitDir" -ForegroundColor Yellow
    Set-Location $gitDir
}

Write-Host "✅ Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar status
Write-Host "1. Verificando alterações..." -ForegroundColor Yellow
$status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "⚠️  Nenhuma alteração para commitar." -ForegroundColor Yellow
    Write-Host "Tudo está atualizado!" -ForegroundColor Green
    
    # Verificar se há commits
    $hasCommits = git rev-parse --verify HEAD 2>$null
    if (-not $hasCommits) {
        Write-Host ""
        Write-Host "⚠️  Repositório sem commits. Você precisa fazer o primeiro commit." -ForegroundColor Yellow
        Write-Host "Execute: git add . && git commit -m 'Initial commit'" -ForegroundColor Cyan
    }
    exit 0
}

git status --short
Write-Host ""

# Adicionar todas as alterações
Write-Host "2. Adicionando todas as alterações..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao adicionar arquivos." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivos adicionados!" -ForegroundColor Green
Write-Host ""

# Fazer commit
Write-Host "3. Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Atualização: melhorias e correções diversas"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro no commit. Verifique se há alterações para commitar." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Verificar remote
Write-Host "4. Verificando repositório remoto..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Remote 'origin' não configurado. Configurando..." -ForegroundColor Yellow
    git remote add origin https://github.com/VeredictaJus/Veredicta.git
    $remote = git remote get-url origin
}

Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

# Verificar branch atual
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Branch atual: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Fazer push
Write-Host "5. Fazendo push para o GitHub..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erro ao fazer push. Tentando push com upstream..." -ForegroundColor Yellow
    git push -u origin $currentBranch
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "As alterações foram enviadas para o GitHub!" -ForegroundColor Cyan
    Write-Host "O deploy automático no Vercel deve iniciar em breve." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique:" -ForegroundColor Red
    Write-Host "   - Se você tem permissão no repositório" -ForegroundColor Yellow
    Write-Host "   - Se há alterações remotas que precisam ser puxadas primeiro" -ForegroundColor Yellow
    Write-Host "   - Execute: git pull origin $currentBranch --rebase" -ForegroundColor Cyan
    exit 1
}





