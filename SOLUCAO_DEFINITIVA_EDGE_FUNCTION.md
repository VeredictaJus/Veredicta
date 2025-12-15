# 🚀 Solução Definitiva: Edge Function para Upload com Firebase Auth

## ✅ **Esta é a Solução Correta para Produção!**

### **Arquitetura:**

```
Frontend (Firebase Auth)
    ↓
Edge Function (Supabase)
    ↓ valida Firebase UID
    ↓ usa Service Key
    ↓
Storage (Supabase) ✅
```

---

## 📁 **Arquivos Criados:**

### **1. Edge Function:**
- `supabase/functions/upload-invoice/index.ts`

### **2. Cliente Atualizado:**
- `src/components/Writer/InvoiceUpload.tsx`

---

## 🔧 **Setup da Edge Function:**

### **Passo 1: Instalar Supabase CLI**

```bash
# Windows (com Chocolatey)
choco install supabase

# Ou baixar de: https://github.com/supabase/cli/releases
```

### **Passo 2: Fazer Login no Supabase**

```bash
supabase login
```

### **Passo 3: Link com seu Projeto**

```bash
cd workspace/veredicta
supabase link --project-ref dmsodonmkffyvbuxtxec
```

### **Passo 4: Deploy da Edge Function**

```bash
supabase functions deploy upload-invoice
```

### **Passo 5: Configurar Secrets**

```bash
# Service Role Key (encontre em: Settings > API > service_role)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL do projeto
supabase secrets set SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
```

---

## 🔐 **Como Funciona:**

### **1. Frontend envia arquivo:**
```typescript
const formData = new FormData();
formData.append('file', file);

fetch(`${SUPABASE_URL}/functions/v1/upload-invoice`, {
  method: 'POST',
  headers: {
    'x-firebase-uid': userId,  // UID do Firebase
    'x-file-name': fileName,
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: formData
});
```

### **2. Edge Function valida:**
```typescript
// Verifica se o usuário existe
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('id, role')
  .eq('firebase_uid', firebaseUid)
  .single()

// Verifica se é writer
if (userProfile.role !== 'writer') {
  return { error: 'Unauthorized' }
}
```

### **3. Edge Function faz upload:**
```typescript
// Usa SERVICE KEY (bypassa RLS!)
const supabaseAdmin = createClient(url, SERVICE_KEY)

await supabaseAdmin.storage
  .from('invoices')
  .upload(filePath, file)
```

---

## ✅ **Vantagens:**

1. ✅ **Seguro** - Valida Firebase UID no servidor
2. ✅ **Produção Ready** - Service Key nunca exposta ao cliente
3. ✅ **RLS Correto** - Não precisa desabilitar RLS
4. ✅ **Validações** - Tipo de arquivo, tamanho, permissões
5. ✅ **Auditável** - Logs no Supabase
6. ✅ **Escalável** - Edge Functions são auto-scaling

---

## 🧪 **Testar Localmente:**

### **1. Rodar Edge Function Local:**

```bash
supabase functions serve upload-invoice --env-file .env.local
```

### **2. Atualizar URL no código:**

```typescript
// Para desenvolvimento local
const EDGE_FUNCTION_URL = 'http://localhost:54321/functions/v1/upload-invoice'

// Para produção
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/upload-invoice`
```

---

## 🔐 **Segurança Implementada:**

### **Validações na Edge Function:**

1. ✅ Firebase UID obrigatório
2. ✅ Usuário existe em `user_profiles`
3. ✅ Usuário tem role `writer`
4. ✅ Arquivo é PDF
5. ✅ Arquivo < 50MB
6. ✅ Nome de arquivo sanitizado

### **Não Precisa Mais:**

- ❌ RLS permissivo
- ❌ Bucket público
- ❌ Service Key no frontend
- ❌ Workarounds temporários

---

## 📊 **Monitoramento:**

Ver logs da Edge Function:

```bash
supabase functions logs upload-invoice
```

Ou no Dashboard:
- Functions → upload-invoice → Logs

---

## 🚀 **Deploy Final:**

### **1. Deploy da Edge Function:**
```bash
supabase functions deploy upload-invoice --no-verify-jwt
```

### **2. Configurar Secrets:**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set SUPABASE_URL=...
```

### **3. Testar:**
```bash
curl -X POST \
  https://dmsodonmkffyvbuxtxec.supabase.co/functions/v1/upload-invoice \
  -H "x-firebase-uid: nUI3YU8WJQgsUvkVsmGkvR8ZN2Q2" \
  -H "x-file-name: 2025-10-teste.pdf" \
  -F "file=@teste.pdf"
```

---

## 📝 **Checklist de Deploy:**

- [ ] Instalar Supabase CLI
- [ ] Fazer login no Supabase
- [ ] Link com o projeto
- [ ] Revisar código da Edge Function
- [ ] Deploy da Edge Function
- [ ] Configurar secrets (SERVICE_KEY, URL)
- [ ] Atualizar frontend para usar Edge Function
- [ ] Testar upload
- [ ] Verificar logs
- [ ] Confirmar que funciona

---

## 🎯 **Resultado:**

### **Antes (Problema):**
```
Frontend → Storage
           ↓
        RLS bloqueia ❌
```

### **Depois (Solução):**
```
Frontend → Edge Function → Storage
           ↓ valida        ↓
           ✅              ✅
```

---

## 💡 **Benefícios vs Outras Soluções:**

| Solução | Segurança | Complexidade | Produção |
|---------|-----------|--------------|----------|
| **Edge Function** | ✅✅✅ | ⚠️ Média | ✅ SIM |
| Desabilitar RLS | ❌ | ✅ Baixa | ❌ NÃO |
| Backend Proxy | ✅✅ | ⚠️⚠️ Alta | ✅ SIM |
| Bucket Público | ❌ | ✅ Baixa | ❌ NÃO |

---

## 🔄 **Próximos Passos:**

1. **Instalar CLI:** `choco install supabase`
2. **Deploy:** `supabase functions deploy upload-invoice`
3. **Configurar Secrets**
4. **Testar upload**
5. **Monitorar logs**

---

## 📚 **Documentação Oficial:**

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)
- [Storage + Edge Functions](https://supabase.com/docs/guides/storage/uploads/standard-uploads#uploading-via-edge-functions)

---

**Esta é a solução correta, segura e escalável!** 🎉

**Quer que eu te ajude com o deploy?** 🚀












