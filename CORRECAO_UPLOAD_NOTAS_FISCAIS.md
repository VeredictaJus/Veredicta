# 🔧 Correção: Upload de Notas Fiscais

## 🐛 **Problema Identificado:**

### **Erro no Console:**
```
POST https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/invoices/undefined/...
400 (Bad Request)
StorageApiError: Bucket not found
```

### **Causas:**
1. ❌ **`user.id` estava undefined** - O componente usava `user.id` mas o contexto retorna `user.uid`
2. ❌ **Bucket 'invoices' pode não existir** no Supabase Storage

---

## ✅ **Soluções Implementadas:**

### **1. Correção do ID do Usuário**

**Arquivo:** `src/components/Writer/InvoiceUpload.tsx`

**Antes:**
```tsx
const { user } = useNewAuth();

const fetchInvoices = async () => {
  if (!user) return;
  const { data, error } = await supabase
    .storage
    .from('invoices')
    .list(`${user.id}`, ...); // ❌ user.id estava undefined
```

**Depois:**
```tsx
const { user } = useNewAuth();

// Obter o ID correto do usuário (pode ser uid ou id)
const userId = user?.uid || user?.id;

const fetchInvoices = async () => {
  if (!userId) return;
  const { data, error } = await supabase
    .storage
    .from('invoices')
    .list(`${userId}`, ...); // ✅ userId correto
```

### **2. Todas as referências atualizadas:**
- ✅ `fetchInvoices()` - lista notas fiscais
- ✅ `handleUpload()` - faz upload
- ✅ Links de download - gera URLs corretas
- ✅ `useEffect` dependency - recarrega quando userId muda

---

## 🗄️ **Criar Bucket no Supabase:**

### **Passo 1: Verificar se o bucket existe**

Execute no **SQL Editor do Supabase**:

```sql
SELECT * FROM storage.buckets WHERE name = 'invoices';
```

Se retornar **0 linhas**, o bucket não existe e precisa ser criado.

### **Passo 2: Executar script SQL**

Use o arquivo: `verificar_criar_bucket_invoices.sql`

1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole todo o conteúdo do arquivo
4. Execute (**Run**)

O script vai:
- ✅ Criar o bucket 'invoices'
- ✅ Configurar políticas RLS
- ✅ Permitir apenas PDFs
- ✅ Limite de 50MB por arquivo

### **Passo 3: Verificar criação (Alternativa via Interface)**

Ou crie manualmente pela interface:

1. Vá em **Storage** no menu lateral
2. Clique em **Create bucket**
3. Nome: `invoices`
4. Public: **desmarcado** (privado)
5. File size limit: `52428800` (50MB)
6. Allowed MIME types: `application/pdf`
7. Clique em **Create bucket**

---

## 🔐 **Políticas RLS (Row Level Security):**

As políticas criadas garantem:

### **Writers (Redatores):**
- ✅ Podem fazer **upload** de suas próprias notas
- ✅ Podem **ler** suas próprias notas
- ✅ Podem **atualizar** suas próprias notas
- ✅ Podem **deletar** suas próprias notas
- ❌ **NÃO** podem acessar notas de outros writers

### **Admins:**
- ✅ Podem **ver** todas as notas fiscais
- ✅ Acesso total para gerenciamento

### **Estrutura de Pastas:**
```
invoices/
  └─ {user_uid}/
      ├─ 2025-10-nota1.pdf
      ├─ 2025-11-nota2.pdf
      └─ 2025-12-nota3.pdf
```

Cada writer tem sua própria pasta identificada pelo seu `uid`.

---

## 🧪 **Testar Agora:**

### **1. Recarregar a Página:**
```
http://localhost:5174/#/writer/payments
```

### **2. Verificar Console (F12):**
Deve aparecer:
```
📄 InvoiceUpload - User: {objeto com dados}
📄 InvoiceUpload - userId: nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2
```

Se `userId` ainda estiver `undefined`, há um problema no contexto de autenticação.

### **3. Fazer Upload:**
1. Selecione **Mês** e **Ano**
2. Clique em **Escolher arquivo**
3. Selecione um PDF
4. Clique em **Enviar Nota Fiscal**

### **4. Resultado Esperado:**
- ✅ Mensagem: "Nota fiscal enviada com sucesso!"
- ✅ Arquivo aparece na lista "Notas Enviadas"
- ✅ Clicando no nome, abre o PDF em nova aba

---

## ❌ **Troubleshooting:**

### **Problema: `userId` ainda está undefined**

**Verificar contexto:**
```tsx
// No console, verificar estrutura do user
console.log('User completo:', user);
```

O user pode ter propriedades diferentes dependendo do provider (Firebase/Supabase).

**Possíveis soluções:**
```tsx
// Tentar diferentes propriedades
const userId = user?.uid || user?.id || user?.user_id || user?.firebase_uid;
```

### **Problema: "Bucket not found"**

**Verificar se o bucket foi criado:**
1. Supabase Dashboard → **Storage**
2. Deve aparecer um bucket chamado `invoices`

**Se não aparecer:**
- Execute o SQL de criação novamente
- Ou crie manualmente pela interface

### **Problema: "Forbidden" ou "Unauthorized"**

**Verificar políticas RLS:**
```sql
-- Ver políticas do storage
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%invoice%';
```

**Recriar políticas se necessário:**
- Execute novamente a parte de políticas do script SQL

### **Problema: "File too large"**

**Aumentar limite:**
```sql
UPDATE storage.buckets 
SET file_size_limit = 104857600  -- 100MB
WHERE name = 'invoices';
```

---

## 📊 **Logs de Debug:**

Com os logs adicionados, você verá no console:

```javascript
📄 InvoiceUpload - User: {
  uid: "nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2",
  email: "nataliayamao@gmail.com",
  role: "writer",
  ...
}
📄 InvoiceUpload - userId: nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2
```

Se ver `undefined`, o problema está no contexto de autenticação.

---

## ✅ **Checklist Final:**

Antes de testar, confirme:

- [ ] Código atualizado com `userId = user?.uid || user?.id`
- [ ] Bucket 'invoices' criado no Supabase Storage
- [ ] Políticas RLS configuradas
- [ ] Página recarregada (Ctrl+Shift+R)
- [ ] Console aberto (F12) para ver logs

---

## 🎯 **Resultado Final:**

Após essas correções:

✅ **Upload funciona** - PDFs são enviados corretamente  
✅ **Lista carrega** - Notas enviadas aparecem  
✅ **Download funciona** - Clicando abre o PDF  
✅ **Segurança** - Cada writer vê apenas suas notas  
✅ **Logs claros** - Fácil debug se houver problemas  

---

## 📝 **Arquivos Modificados:**

1. ✅ `src/components/Writer/InvoiceUpload.tsx` - Correção do userId
2. ✅ `verificar_criar_bucket_invoices.sql` - Script de criação do bucket
3. ✅ `CORRECAO_UPLOAD_NOTAS_FISCAIS.md` - Esta documentação

---

**Teste agora e me avise se funcionou!** 🚀












