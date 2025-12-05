-- ========================================
-- REMOVER NOTIFICAÇÃO DE DISPUTA
-- ========================================
-- Este script remove a função e trigger de notificação
-- de disputa, já que essa funcionalidade não existe no sistema

-- Remover trigger de disputa
DROP TRIGGER IF EXISTS trigger_notify_admins_dispute ON petitions;

-- Remover função de notificação de disputa
DROP FUNCTION IF EXISTS notify_admins_dispute();

-- ========================================
-- ✅ CONCLUSÃO
-- ========================================
-- A notificação de disputa foi removida do sistema.
-- O trigger e a função foram deletados.





















