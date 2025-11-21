# 📁 Configuração do Armazenamento de Arquivos de Petições

## 🎯 Objetivo
Configurar o sistema de armazenamento de arquivos de apoio para petições no Supabase Storage.

## 📋 Passos para Configuração

### 1. Criar Bucket no Supabase Storage

1. Acesse o **Supabase Dashboard**
2. Vá para **Storage** no menu lateral
3. Clique em **"New bucket"**
4. Configure o bucket:
   - **Nome**: `petition_files`
   - **Public**: ❌ **NÃO** (bucket privado)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     image/jpeg
     image/jpg
     image/png
     image/gif
     image/webp
     ```

### 2. Executar Script SQL

Execute o script `setup_petition_files_storage.sql` no **SQL Editor** do Supabase:

1. Vá para **SQL Editor** no Supabase Dashboard
2. Cole o conteúdo do arquivo `setup_petition_files_storage.sql`
3. Clique em **"Run"**

### 3. Configurar Políticas de Storage

Após criar o bucket, configure as políticas de segurança:

1. Vá para **Storage** > **policies** > **petition_files**
2. Clique em **"New policy"**

#### Política 1: Upload de Arquivos
- **Nome**: "Allow authenticated users to upload files"
- **Definição**:
  ```sql
  (bucket_id = 'petition_files'::text) AND (auth.role() = 'authenticated'::text)
  ```

#### Política 2: Leitura de Arquivos
- **Nome**: "Allow users to read their own petition files"
- **Definição**:
  ```sql
  (bucket_id = 'petition_files'::text) AND (
    EXISTS (
      SELECT 1 FROM petition_files pf
      JOIN petitions p ON pf.petition_id = p.id
      WHERE pf.file_url = (storage.foldername(name))[1] || '/' || (storage.filename(name))
      AND (p.client_id = auth.uid()::text OR p.assigned_writer_id = auth.uid()::text)
    )
  )
  ```

#### Política 3: Exclusão de Arquivos
- **Nome**: "Allow users to delete their own petition files"
- **Definição**:
  ```sql
  (bucket_id = 'petition_files'::text) AND (
    EXISTS (
      SELECT 1 FROM petition_files pf
      JOIN petitions p ON pf.petition_id = p.id
      WHERE pf.file_url = (storage.foldername(name))[1] || '/' || (storage.filename(name))
      AND p.client_id = auth.uid()::text
    )
  )
  ```

## 🔧 Funcionalidades Implementadas

### ✅ Serviço de Upload (`PetitionFileService`)
- Upload de arquivos para Supabase Storage
- Validação de tipo e tamanho de arquivo
- Metadados salvos na tabela `petition_files`
- Funções de exclusão e listagem
- Formatação de tamanho de arquivo

### ✅ Interface Atualizada
- Status de upload em tempo real
- Indicadores visuais (carregando, sucesso, erro)
- Validação de arquivos antes do upload
- Botão de remoção de arquivos
- Feedback visual durante o processo

### ✅ Integração com Nova Petição
- Upload de arquivos durante a criação da petição
- Armazenamento de URLs na tabela `petitions`
- Tratamento de erros e sucessos
- Interface responsiva e intuitiva

## 📊 Estrutura do Banco de Dados

### Tabela `petition_files`
```sql
CREATE TABLE petition_files (
  id uuid PRIMARY KEY,
  petition_id uuid REFERENCES petitions(id),
  file_name varchar NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  file_type varchar NOT NULL,
  uploaded_by text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Campo `files` na tabela `petitions`
```sql
files text[] -- Array de URLs dos arquivos
```

## 🚀 Como Usar

1. **Upload de Arquivos**: 
   - Selecione arquivos na página "Nova Petição"
   - Os arquivos são validados automaticamente
   - Status de upload é mostrado em tempo real

2. **Visualização de Arquivos**:
   - Arquivos são listados na página "Minhas Petições"
   - URLs são armazenadas no campo `files` da petição

3. **Exclusão de Arquivos**:
   - Use o botão "X" ao lado de cada arquivo
   - Arquivo é removido do storage e banco de dados

## ⚠️ Limitações Atuais

- **Tamanho máximo**: 10MB por arquivo
- **Tipos permitidos**: PDF, Word, imagens
- **Upload simultâneo**: Um arquivo por vez
- **Armazenamento**: Bucket privado (não público)

## 🔄 Próximos Passos

1. Implementar upload em lote
2. Adicionar preview de arquivos
3. Implementar compressão de imagens
4. Adicionar histórico de versões
5. Implementar backup automático

## 📝 Notas Importantes

- O bucket deve ser **privado** por segurança
- Arquivos são organizados por `petition_id`
- Metadados são sempre salvos no banco de dados
- Políticas RLS garantem acesso seguro aos arquivos
- Sistema suporta múltiplos arquivos por petição
