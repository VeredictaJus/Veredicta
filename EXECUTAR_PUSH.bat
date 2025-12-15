@echo off
chcp 65001 >nul
echo ========================================
echo   FAZENDO PUSH COM NOVO TOKEN
echo ========================================
echo.

cd /d "%~dp0"
echo Diretorio: %CD%
echo.

set token=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

echo [1/4] Atualizando remote...
git remote remove origin 2>nul
git remote add origin https://%token%@github.com/VeredictaJus/Veredicta.git
echo OK!
echo.

echo [2/4] Atualizando hook automático...
if exist ".git\hooks\post-commit" (
    powershell -Command "(Get-Content '.git\hooks\post-commit' -Raw) -replace 'token=\"[^\"]*\"', 'token=\"%token%\"' | Set-Content '.git\hooks\post-commit' -NoNewline"
    echo OK!
) else (
    echo Criando hook...
    (
        echo #!/bin/sh
        echo branch=^$(git rev-parse --abbrev-ref HEAD^)
        echo token="%token%"
        echo git push https://^${token}@github.com/VeredictaJus/Veredicta.git ^$branch
        echo exit 0
    ) > ".git\hooks\post-commit"
    echo OK!
)
echo.

echo [3/4] Verificando status...
git status --short
echo.

echo [4/4] Fazendo push...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERRO: Push falhou!
    echo Verifique o token e tente novamente.
) else (
    echo.
    echo ========================================
    echo   SUCESSO! PUSH REALIZADO!
    echo ========================================
    echo.
    echo Verifique em: https://github.com/VeredictaJus/Veredicta
    echo.
    echo Push automatico configurado!
)

echo.
pause

