-- Script para configurar Supabase Storage para áudios
-- Este script configura buckets e políticas para armazenamento de áudios

-- 1. Criar bucket para áudios (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-audio',
    'chat-audio',
    true,
    10485760, -- 10MB limit
    ARRAY['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir upload de áudios para usuários autenticados
CREATE POLICY "Users can upload audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-audio' 
        AND auth.uid()::TEXT IS NOT NULL
        AND (storage.foldername(name))[1] = 'conversations'
    );

-- 3. Política para permitir leitura de áudios das conversas do usuário
CREATE POLICY "Users can view audio files from their conversations" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat-audio'
        AND EXISTS (
            SELECT 1 FROM conversations c
            JOIN conversation_participants cp ON c.id = cp.conversation_id
            WHERE cp.user_id = auth.uid()::TEXT
            AND (storage.foldername(name))[2] = c.id::TEXT
        )
    );

-- 4. Política para permitir atualização de áudios (se necessário)
CREATE POLICY "Users can update their own audio files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'chat-audio'
        AND auth.uid()::TEXT IS NOT NULL
        AND (storage.foldername(name))[1] = 'conversations'
    );

-- 5. Política para permitir exclusão de áudios (se necessário)
CREATE POLICY "Users can delete their own audio files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'chat-audio'
        AND auth.uid()::TEXT IS NOT NULL
        AND (storage.foldername(name))[1] = 'conversations'
    );

-- 6. Função para gerar URL de upload de áudio
CREATE OR REPLACE FUNCTION get_audio_upload_url(
    p_conversation_id UUID,
    p_file_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_path TEXT;
    upload_url TEXT;
BEGIN
    -- Gerar caminho do arquivo
    file_path := 'conversations/' || p_conversation_id || '/' || p_file_name;
    
    -- Gerar URL de upload (em produção, usar Supabase Storage API)
    upload_url := 'https://storage.supabase.co/object/' || file_path;
    
    RETURN upload_url;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para gerar URL de download de áudio
CREATE OR REPLACE FUNCTION get_audio_download_url(
    p_conversation_id UUID,
    p_file_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_path TEXT;
    download_url TEXT;
BEGIN
    -- Gerar caminho do arquivo
    file_path := 'conversations/' || p_conversation_id || '/' || p_file_name;
    
    -- Gerar URL de download público
    download_url := 'https://storage.supabase.co/object/public/chat-audio/' || file_path;
    
    RETURN download_url;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para verificar se arquivo de áudio existe
CREATE OR REPLACE FUNCTION audio_file_exists(
    p_conversation_id UUID,
    p_file_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'chat-audio'
        AND name = 'conversations/' || p_conversation_id || '/' || p_file_name
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Comentários para documentação
COMMENT ON FUNCTION get_audio_upload_url(UUID, TEXT) IS 'Gera URL para upload de arquivo de áudio';
COMMENT ON FUNCTION get_audio_download_url(UUID, TEXT) IS 'Gera URL pública para download de arquivo de áudio';
COMMENT ON FUNCTION audio_file_exists(UUID, TEXT) IS 'Verifica se arquivo de áudio existe no storage';

-- 10. Verificação final
SELECT 
    'Storage de áudio configurado' AS status,
    'Bucket chat-audio criado com políticas de segurança' AS description;
