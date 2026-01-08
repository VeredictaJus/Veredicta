@echo off
chcp 65001 >nul
echo === Commit e Push ===
echo.

cd /d "%~dp0\.."

if not exist ".git" (
    echo ERRO: Git nao encontrado em workspace
    pause
    exit /b 1
)

echo Diretorio: %CD%
echo.

echo Adicionando arquivos...
git add .

echo Fazendo commit...
git commit -m "Atualizacao: melhorias e correcoes"

echo Fazendo push...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    git push origin master
)

echo.
echo Pronto!
pause


