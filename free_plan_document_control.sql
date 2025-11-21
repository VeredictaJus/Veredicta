-- Script para controlar CPFs/CNPJs únicos no plano Free
-- Este script cria uma tabela para armazenar CPFs/CNPJs que já utilizaram o plano gratuito

-- Criar tabela para controlar CPFs/CNPJs do plano Free
CREATE TABLE IF NOT EXISTS free_plan_document_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document VARCHAR(18) NOT NULL UNIQUE, -- CPF (XXX.XXX.XXX-XX) ou CNPJ (XX.XXX.XXX/XXXX-XX)
    document_type VARCHAR(4) NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')), -- Tipo do documento
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por documento
CREATE INDEX IF NOT EXISTS idx_free_plan_document_control_document ON free_plan_document_control(document);
CREATE INDEX IF NOT EXISTS idx_free_plan_document_control_type ON free_plan_document_control(document_type);

-- Função para verificar se documento já foi usado no plano Free
CREATE OR REPLACE FUNCTION check_free_plan_document_usage(document_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o documento já existe na tabela de controle
    IF EXISTS (
        SELECT 1 FROM free_plan_document_control 
        WHERE document = document_input
    ) THEN
        RETURN TRUE; -- Documento já foi usado
    ELSE
        RETURN FALSE; -- Documento pode usar o plano Free
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar uso do plano Free por documento
CREATE OR REPLACE FUNCTION register_free_plan_document_usage(
    document_input TEXT,
    document_type_input VARCHAR(4),
    user_id_input UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se documento já foi usado
    IF check_free_plan_document_usage(document_input) THEN
        RETURN FALSE; -- Documento já foi usado, não pode registrar novamente
    END IF;
    
    -- Inserir novo registro
    INSERT INTO free_plan_document_control (document, document_type, user_id)
    VALUES (document_input, document_type_input, user_id_input);
    
    RETURN TRUE; -- Registro realizado com sucesso
END;
$$ LANGUAGE plpgsql;

-- RLS Policies para a tabela
ALTER TABLE free_plan_document_control ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Users can read their own document records" ON free_plan_document_control
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir inserção apenas para usuários autenticados
CREATE POLICY "Users can insert their own document records" ON free_plan_document_control
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para administradores (leitura completa)
CREATE POLICY "Admins can read all document records" ON free_plan_document_control
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Comentários para documentação
COMMENT ON TABLE free_plan_document_control IS 'Controla CPFs/CNPJs que já utilizaram o plano Free (uma vez por documento)';
COMMENT ON COLUMN free_plan_document_control.document IS 'CPF ou CNPJ formatado do usuário';
COMMENT ON COLUMN free_plan_document_control.document_type IS 'Tipo do documento: CPF ou CNPJ';
COMMENT ON COLUMN free_plan_document_control.user_id IS 'ID do usuário que utilizou o plano Free';
COMMENT ON COLUMN free_plan_document_control.used_at IS 'Data/hora em que o plano Free foi utilizado';
COMMENT ON FUNCTION check_free_plan_document_usage(TEXT) IS 'Verifica se um documento já foi usado no plano Free';
COMMENT ON FUNCTION register_free_plan_document_usage(TEXT, VARCHAR(4), UUID) IS 'Registra o uso do plano Free por um documento';
