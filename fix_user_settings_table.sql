-- Verificar se a tabela user_settings existe
DO $$
BEGIN
    -- Criar tabela user_settings se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        CREATE TABLE user_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            full_name TEXT,
            phone TEXT,
            company TEXT,
            document TEXT,
            avatar_url TEXT,
            email_notifications BOOLEAN DEFAULT true,
            push_notifications BOOLEAN DEFAULT false,
            sms_notifications BOOLEAN DEFAULT true,
            two_factor_enabled BOOLEAN DEFAULT false,
            login_alerts BOOLEAN DEFAULT true,
            last_password_change TIMESTAMP WITH TIME ZONE,
            billing_street TEXT,
            billing_city TEXT,
            billing_state TEXT,
            billing_zip_code TEXT,
            billing_country TEXT DEFAULT 'Brasil',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
        
        -- Habilitar RLS
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Políticas RLS
        CREATE POLICY "Users can view their own settings" ON user_settings
            FOR SELECT USING (user_id = auth.uid()::text);
            
        CREATE POLICY "Users can insert their own settings" ON user_settings
            FOR INSERT WITH CHECK (user_id = auth.uid()::text);
            
        CREATE POLICY "Users can update their own settings" ON user_settings
            FOR UPDATE USING (user_id = auth.uid()::text);
            
        CREATE POLICY "Users can delete their own settings" ON user_settings
            FOR DELETE USING (user_id = auth.uid()::text);
        
        RAISE NOTICE 'Tabela user_settings criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela user_settings já existe';
    END IF;
END $$;

-- Verificar se as colunas de billing existem
DO $$
BEGIN
    -- Adicionar colunas de billing se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'billing_street') THEN
        ALTER TABLE user_settings ADD COLUMN billing_street TEXT;
        RAISE NOTICE 'Coluna billing_street adicionada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'billing_city') THEN
        ALTER TABLE user_settings ADD COLUMN billing_city TEXT;
        RAISE NOTICE 'Coluna billing_city adicionada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'billing_state') THEN
        ALTER TABLE user_settings ADD COLUMN billing_state TEXT;
        RAISE NOTICE 'Coluna billing_state adicionada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'billing_zip_code') THEN
        ALTER TABLE user_settings ADD COLUMN billing_zip_code TEXT;
        RAISE NOTICE 'Coluna billing_zip_code adicionada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'billing_country') THEN
        ALTER TABLE user_settings ADD COLUMN billing_country TEXT DEFAULT 'Brasil';
        RAISE NOTICE 'Coluna billing_country adicionada';
    END IF;
END $$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
    AND table_schema = 'public'
    AND column_name LIKE '%billing%'
ORDER BY ordinal_position;





















