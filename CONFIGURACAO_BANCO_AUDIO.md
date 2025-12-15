# 🎵 CONFIGURAÇÃO DO BANCO DE DADOS PARA ÁUDIO

## ✅ **SCRIPTS CRIADOS:**

### **1. `audio_database_setup.sql`**
- ✅ **Atualiza tabela messages** - Adiciona suporte a arquivos de áudio
- ✅ **Função upload_audio_file** - Simula upload de áudio
- ✅ **Função get_messages_with_files** - Busca mensagens com arquivos
- ✅ **Função send_message_with_audio** - Envia mensagens com áudio
- ✅ **Políticas RLS** - Segurança para arquivos de áudio

### **2. `audio_storage_setup.sql`**
- ✅ **Bucket chat-audio** - Configuração do Supabase Storage
- ✅ **Políticas de upload** - Permite upload para usuários autenticados
- ✅ **Políticas de leitura** - Acesso apenas às conversas do usuário
- ✅ **Funções de URL** - Geração de URLs de upload/download
- ✅ **Verificação de arquivos** - Função para verificar existência

## 🚀 **COMO CONFIGURAR:**

### **PASSO 1: Executar Scripts SQL**

#### **1.1. Configurar Banco de Dados:**
```sql
-- Execute no Supabase SQL Editor:
-- 1. Copie e cole o conteúdo de audio_database_setup.sql
-- 2. Clique em "Run" para executar
```

#### **1.2. Configurar Storage:**
```sql
-- Execute no Supabase SQL Editor:
-- 1. Copie e cole o conteúdo de audio_storage_setup.sql
-- 2. Clique em "Run" para executar
```

### **PASSO 2: Verificar Configuração**

#### **2.1. Verificar Tabela Messages:**
```sql
-- Execute para verificar se as colunas foram adicionadas:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('file_type', 'attachment_url', 'file_name', 'file_size');
```

#### **2.2. Verificar Bucket Storage:**
```sql
-- Execute para verificar se o bucket foi criado:
SELECT * FROM storage.buckets WHERE id = 'chat-audio';
```

#### **2.3. Verificar Funções:**
```sql
-- Execute para verificar se as funções foram criadas:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'upload_audio_file', 
    'get_messages_with_files', 
    'send_message_with_audio',
    'get_audio_upload_url',
    'get_audio_download_url'
);
```

## 🔍 **ESTRUTURA DO BANCO:**

### **Tabela Messages (Atualizada):**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    sender_id TEXT, -- Firebase UID
    content TEXT,
    message_type VARCHAR(20), -- 'text', 'file', 'image', 'system'
    attachment_url TEXT, -- URL do arquivo no Supabase Storage
    file_name VARCHAR(255), -- Nome do arquivo
    file_size BIGINT, -- Tamanho em bytes
    file_type VARCHAR(50), -- Tipo MIME (audio/wav, etc.)
    reply_to_id UUID REFERENCES messages(id),
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Bucket Storage:**
```sql
-- Bucket: chat-audio
-- Estrutura: conversations/{conversation_id}/{timestamp}_{filename}
-- Exemplo: conversations/uuid-123/1703123456789_audio.wav
```

### **Políticas RLS:**
- ✅ **Upload**: Apenas usuários autenticados podem fazer upload
- ✅ **Leitura**: Apenas participantes da conversa podem ver arquivos
- ✅ **Atualização**: Usuários podem atualizar seus próprios arquivos
- ✅ **Exclusão**: Usuários podem excluir seus próprios arquivos

## 📋 **FUNÇÕES DISPONÍVEIS:**

### **1. Upload de Áudio:**
```sql
-- Função: upload_audio_file
-- Parâmetros: p_file_name, p_file_size, p_file_type, p_conversation_id, p_sender_id, p_content
-- Retorna: UUID da mensagem criada
```

### **2. Buscar Mensagens com Arquivos:**
```sql
-- Função: get_messages_with_files
-- Parâmetros: p_conversation_id
-- Retorna: Mensagens com informações de arquivos e tipo de áudio
```

### **3. Enviar Mensagem com Áudio:**
```sql
-- Função: send_message_with_audio
-- Parâmetros: conversation_id, sender_id, content, message_type, file_url, file_name, file_size, file_type
-- Retorna: UUID da mensagem criada
```

### **4. URLs de Storage:**
```sql
-- Função: get_audio_upload_url
-- Parâmetros: p_conversation_id, p_file_name
-- Retorna: URL para upload

-- Função: get_audio_download_url
-- Parâmetros: p_conversation_id, p_file_name
-- Retorna: URL pública para download
```

## ⚠️ **IMPORTANTE:**

### **Pré-requisitos:**
- **Supabase Storage** - Deve estar habilitado no projeto
- **RLS Policies** - Devem estar configuradas corretamente
- **Firebase Auth** - Integração com Supabase configurada
- **Permissões** - Usuários devem ter acesso ao storage

### **Limitações:**
- **Tamanho máximo**: 10MB por arquivo de áudio
- **Formatos suportados**: WAV, MP3, MPEG, OGG, WEBM
- **Estrutura de pastas**: conversations/{conversation_id}/{filename}
- **Políticas**: Apenas participantes da conversa podem acessar

## 🧪 **TESTE DA CONFIGURAÇÃO:**

### **1. Teste de Upload:**
```sql
-- Execute para testar upload:
SELECT upload_audio_file(
    'test_audio.wav',
    1024000,
    'audio/wav',
    'uuid-da-conversa',
    'firebase-uid-do-usuario',
    'Mensagem de teste'
);
```

### **2. Teste de Busca:**
```sql
-- Execute para testar busca:
SELECT * FROM get_messages_with_files('uuid-da-conversa');
```

### **3. Teste de Storage:**
```sql
-- Execute para testar URLs:
SELECT get_audio_upload_url('uuid-da-conversa', 'test.wav');
SELECT get_audio_download_url('uuid-da-conversa', 'test.wav');
```

## 🎯 **RESULTADO ESPERADO:**

Após executar os scripts, você deve ter:

- ✅ **Tabela messages** atualizada com suporte a arquivos
- ✅ **Bucket chat-audio** criado no Supabase Storage
- ✅ **Políticas RLS** configuradas para segurança
- ✅ **Funções SQL** para gerenciar áudios
- ✅ **Sistema completo** de upload/download de áudios

---

**Execute os scripts SQL no Supabase para configurar o banco de dados para áudio!** 🎵🗄️

**Depois teste a funcionalidade de áudio no chat!**
