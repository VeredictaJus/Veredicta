@echo off
chcp 65001 >nul
echo === Fazendo commit e push das correções ===
echo.

cd /d "%~dp0"

if not exist ".git" (
    echo ERRO: Não foi encontrado um repositório git neste diretório.
    echo Por favor, navegue até o diretório do repositório git e execute este script novamente.
    echo Diretório atual: %CD%
    pause
    exit /b 1
)

echo Diretório do repositório: %CD%
echo.

echo Status do repositório:
git status --short

echo.
echo Adicionando arquivos modificados...
git add src/components/Auth/ProtectedRoute.tsx
git add src/contexts/NewAuthContext.tsx
git add src/pages/client/ClientDashboard.tsx

echo.
echo Arquivos adicionados:
git status --short

echo.
echo Fazendo commit...
git commit -m "Corrige flash de 'não autorizado' após cadastro e modal de boas-vindas

- Adiciona detecção de cadastro recente no ProtectedRoute para evitar flash de 'não autorizado'
- Melhora sincronização após cadastro no NewAuthContext com delays apropriados
- Corrige lógica do modal de boas-vindas para novos clientes com retry e verificação de cliente novo
- Adiciona verificação baseada em created_at do perfil para detectar clientes novos"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Commit realizado com sucesso!
    echo.
    echo Fazendo push...
    git push
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Push realizado com sucesso!
        echo.
        echo Todas as alterações foram enviadas para o repositório remoto.
    ) else (
        echo.
        echo ❌ ERRO ao fazer push.
        echo Verifique sua conexão e configuração do repositório remoto.
        echo Execute 'git push' manualmente quando estiver pronto.
        pause
        exit /b 1
    )
) else (
    echo.
    echo ❌ ERRO ao fazer commit.
    echo Verifique se há alterações para commitar.
    pause
    exit /b 1
)

pause




