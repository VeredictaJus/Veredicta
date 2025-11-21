-- Teste da função send_message
-- Execute este SQL no Supabase SQL Editor para testar

-- Primeiro, vamos verificar se a função existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'send_message';

-- Vamos testar a função com dados de exemplo
-- (substitua os UUIDs pelos IDs reais da sua conversa e usuário)
SELECT send_message(
    '00000000-0000-0000-0000-000000000000'::UUID,  -- conversation_id (substitua)
    '00000000-0000-0000-0000-000000000000'::UUID,  -- sender_id (substitua)
    'Teste de mensagem',
    'text',
    NULL,
    NULL,
    NULL,
    NULL
);


















