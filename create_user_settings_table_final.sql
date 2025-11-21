-- SCRIPT FINAL PARA CRIAR TABELA user_settings
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela user_settings se não existir
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    document TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    
    -- Configurações de notificação
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    sms_notifications BOOLEAN DEFAULT true,
    
    -- Configurações de segurança
    two_factor_enabled BOOLEAN DEFAULT false,
    login_alerts BOOLEAN DEFAULT true,
    last_password_change TIMESTAMPTZ DEFAULT NULL,
    
    -- Endereço de cobrança
    billing_street TEXT DEFAULT NULL,
    billing_city TEXT DEFAULT NULL,
    billing_state TEXT DEFAULT NULL,
    billing_zip_code TEXT DEFAULT NULL,
    billing_country TEXT DEFAULT 'Brasil',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_created_at ON public.user_settings(created_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para permitir que usuários vejam apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid()::text = UPPER(user_id));

-- 5. Criar política RLS para permitir que usuários atualizem apenas seus próprios dados
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid()::text = UPPER(user_id));

-- 6. Criar política RLS para permitir que usuários insiram apenas seus próprios dados
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = UPPER(user_id));

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- 9. Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela user_settings criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM public.user_settings;

-- 10. Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;





















