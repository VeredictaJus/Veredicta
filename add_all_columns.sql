-- Script para adicionar TODAS as colunas necessárias na tabela plans
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plans' 
ORDER BY ordinal_position;

-- 2. Adicionar todas as colunas que faltam
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_code TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE plans ADD COLUMN IF NOT EXISTS petitions_limit INTEGER DEFAULT 50;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS api_access BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'basic';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Verificar estrutura após adicionar colunas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plans' 
ORDER BY ordinal_position;

























