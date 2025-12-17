@echo off
chcp 65001 >nul
echo ========================================
echo   RESTAURAR REPOSITORIO GIT
echo ========================================
echo.

cd /d "%~dp0"
echo Diretorio atual: %CD%
echo.

echo [1/6] Inicializando Git...
git init
if errorlevel 1 (
    echo ERRO ao inicializar Git!
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/6] Configurando branch main...
git branch -M main
echo OK!
echo.

echo [3/6] Configurando remote GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/VeredictaJus/Veredicta.git
echo OK!
echo.

echo [4/6] Adicionando arquivos...
git add .
echo OK!
echo.

echo [5/6] Fazendo commit...
git commit -m "Restore repository - %date% %time%"
if errorlevel 1 (
    echo Aviso: Nenhuma alteracao ou commit ja existe
) else (
    echo OK!
)
echo.

echo [6/6] Fazendo push para GitHub...
set token=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
git push https://%token%@github.com/VeredictaJus/Veredicta.git main --force

if errorlevel 1 (
    echo.
    echo AVISO: Push pode ter falhado.
    echo Tente manualmente: git push -u origin main
) else (
    echo.
    echo ========================================
    echo   SUCESSO! REPOSITORIO RESTAURADO!
    echo ========================================
    echo.
    echo Verifique em: https://github.com/VeredictaJus/Veredicta
)

echo.
pause



