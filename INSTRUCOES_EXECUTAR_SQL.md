# 📋 INSTRUÇÕES: EXECUTAR SCRIPTS SQL NO SUPABASE

## 🎯 **PROBLEMA IDENTIFICADO:**

A tabela `user_profiles` existe e tem a estrutura correta, mas provavelmente:
1. **Não há redatores** na tabela
2. **Políticas RLS** podem estar bloqueando o acesso
3. **Usuário atual** pode não ter permissão para ver redatores

## 🚀 **SOLUÇÃO: EXECUTAR SCRIPTS SQL**

### **Passo 1: Criar Redatores de Teste**

#### **1.1. Abra o Supabase Dashboard:**
- ✅ Acesse: https://supabase.com/dashboard
- ✅ Entre no seu projeto Veredicta
- ✅ Vá em **SQL Editor** (ícone de código)

#### **1.2. Execute o Script de Redatores:**
```sql
-- Copie e cole este código no SQL Editor:

-- 1. Verificar redatores existentes
SELECT 
    COUNT(*) as total_writers,
    firebase_uid,
    full_name,
    email,
    role,
    is_active
FROM user_profiles 
WHERE role = 'writer'
GROUP BY firebase_uid, full_name, email, role, is_active;

-- 2. Criar redatores de teste
INSERT INTO user_profiles (firebase_uid, email, role, full_name, is_active)
VALUES 
    ('writer-joao-silva', 'joao.silva@veredictajus.com', 'writer', 'João Silva', true),
    ('writer-maria-santos', 'maria.santos@veredictajus.com', 'writer', 'Maria Santos', true),
    ('writer-pedro-costa', 'pedro.costa@veredictajus.com', 'writer', 'Pedro Costa', true),
    ('writer-ana-oliveira', 'ana.oliveira@veredictajus.com', 'writer', 'Ana Oliveira', true),
    ('writer-carlos-rodrigues', 'carlos.rodrigues@veredictajus.com', 'writer', 'Carlos Rodrigues', true)
ON CONFLICT (firebase_uid) DO NOTHING;

-- 3. Verificar redatores criados
SELECT 
    firebase_uid,
    full_name,
    email,
    role,
    is_active
FROM user_profiles 
WHERE role = 'writer'
ORDER BY full_name;
```

#### **1.3. Clique em "Run":**
- ✅ Clique no botão **"Run"** ou pressione **Ctrl+Enter**
- ✅ Verifique se apareceu a mensagem de sucesso
- ✅ Confirme se os redatores foram criados

### **Passo 2: Corrigir Políticas RLS**

#### **2.1. Execute o Script de RLS:**
```sql
-- Copie e cole este código no SQL Editor:

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 4. Criar políticas básicas
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

#### **2.2. Clique em "Run":**
- ✅ Clique no botão **"Run"** ou pressione **Ctrl+Enter**
- ✅ Verifique se as políticas foram criadas
- ✅ Confirme se não há erros

### **Passo 3: Testar o Chat**

#### **3.1. Abra o Modal "Nova Conversa":**
- ✅ Vá para a página de Chat
- ✅ Clique no botão **"+"** para nova conversa
- ✅ Verifique se aparece **"Carregando redatores..."**

#### **3.2. Verifique o Console:**
- ✅ Abra **DevTools** (F12)
- ✅ Vá na aba **Console**
- ✅ Procure pelos logs:
  ```
  🔄 Carregando redatores para usuário: [UID]
  📝 Redatores com petições do cliente: []
  👥 Redatores finais carregados: [Array com redatores]
  ```

#### **3.3. Verifique o Dropdown:**
- ✅ Clique no campo **"Tipo de Conversa"**
- ✅ Deve aparecer:
  - 📞 **Suporte**
  - 👤 **João Silva**
  - 👤 **Maria Santos**
  - 👤 **Pedro Costa**
  - 👤 **Ana Oliveira**
  - 👤 **Carlos Rodrigues**

## 🔍 **VERIFICAÇÕES:**

### **✅ Se os scripts executaram com sucesso:**
- ✅ **5 redatores criados** - João, Maria, Pedro, Ana, Carlos
- ✅ **Políticas RLS configuradas** - Permite acesso aos redatores
- ✅ **Chat funcionando** - Dropdown mostra redatores

### **❌ Se ainda não funcionar:**
- ❌ **Verifique logs no console** - Procure por erros
- ❌ **Verifique Network tab** - Se há requisições falhando
- ❌ **Verifique autenticação** - Se user.uid está disponível

## 🎯 **RESULTADO ESPERADO:**

### **Antes (Problema):**
```
Tipo de Conversa
┌─────────────────────────────┐
│ 📞 Suporte                  │
│ 📄 Petição                  │
│ 👥 Geral                    │
└─────────────────────────────┘
```

### **Depois (Corrigido):**
```
Tipo de Conversa
┌─────────────────────────────┐
│ 📞 Suporte                  │
│ 👤 João Silva               │
│ 👤 Maria Santos             │
│ 👤 Pedro Costa              │
│ 👤 Ana Oliveira             │
│ 👤 Carlos Rodrigues         │
└─────────────────────────────┘
```

---

**Execute os scripts SQL no Supabase e teste o chat!** ✅

**Me informe se funcionou ou se ainda há algum problema!** 🎯
