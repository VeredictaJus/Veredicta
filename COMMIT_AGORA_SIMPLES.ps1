# Script simples para fazer commit e push
# Execute na pasta workspace

git add veredicta/vercel.json veredicta/.npmrc veredicta/SOLUCAO_ERRO_VERCEL.md workspace/.gitignore veredicta/.gitignore
git commit -m "Fix Vercel build configuration and update gitignore"
Write-Host ""
Write-Host "Commit realizado! Push automatico em andamento..." -ForegroundColor Green
Write-Host "Verifique em: https://github.com/VeredictaJus/Veredicta" -ForegroundColor Cyan



