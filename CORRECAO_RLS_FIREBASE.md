# 🔧 Correção: RLS do Storage com Firebase Auth

## 🐛 **Problema:**

```
StorageApiError: new row violates row-level security policy
```

### **Causa:**
As políticas RLS usam `auth.uid()` do **Supabase Auth**, mas você está usando **Firebase Auth**. 

O Supabase não reconhece o usuário do Firebase, então bloqueia todos os uploads.

---

## ✅ **Solução:**

### **Opção 1: Políticas Permissivas (Temporária - Para Testar)**

Permitir **qualquer usuário autenticado** fazer upload:

```sql
-- Permite qualquer usuário logado fazer upload
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');
```

**Prós:**
- ✅ Simples e rápida
- ✅ Funciona imediatamente
- ✅ Ótima para testar

**Contras:**
- ⚠️ Menos seguro (qualquer usuário pode acessar qualquer nota)
- ⚠️ Não recomendado para produção

---

### **Opção 2: Políticas com Verificação via `user_profiles` (Recomendada)**

Usar a tabela `user_profiles` como ponte entre Firebase e Supabase:

```sql
CREATE POLICY "Writers can upload their own invoices via firebase"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] IN (
    SELECT firebase_uid FROM user_profiles 
    WHERE id = auth.uid()
  )
);
```

**Prós:**
- ✅ Seguro
- ✅ Cada writer vê apenas suas notas
- ✅ Pronto para produção

**Contras:**
- ⚠️ Requer que `user_profiles` tenha coluna `firebase_uid`
- ⚠️ Mais complexo

---

## 🚀 **Passo a Passo:**

### **1. Executar o Script de Correção:**

**Arquivo:** `fix_storage_rls_firebase.sql`

1. Abra Supabase → **SQL Editor**
2. Copie todo o conteúdo de `fix_storage_rls_firebase.sql`
3. Execute (**Run**)

Isso vai:
- ❌ Deletar as políticas antigas
- ✅ Criar políticas que aceitam usuários autenticados
- 📊 Mostrar as novas políticas

### **2. Recarregar a Aplicação:**

```
Ctrl+Shift+R
```

### **3. Testar o Upload:**

1. Selecione mês e ano
2. Escolha um PDF
3. Clique em "Enviar Nota Fiscal"

---

## 🎯 **Resultado Esperado:**

### **Sucesso:**
```
✅ Alert: "Nota fiscal enviada com sucesso!"
✅ Arquivo aparece na lista
✅ Console limpo (sem erros RLS)
```

### **Se Ainda Der Erro:**

Execute no SQL Editor:
```sql
-- Ver usuário atual do Supabase
SELECT auth.uid() as supabase_uid;

-- Ver usuários do Firebase na tabela
SELECT id, firebase_uid, email FROM user_profiles LIMIT 5;
```

Me envie o resultado para eu ajustar!

---

## 🔐 **Segurança:**

### **Temporária (Agora):**
- Qualquer usuário autenticado pode fazer upload
- OK para desenvolvimento/teste

### **Produção (Depois):**
- Descomente as políticas alternativas no script
- Certifique-se que `user_profiles.firebase_uid` existe
- Cada writer só acessa suas próprias notas

---

## 📝 **Checklist:**

- [ ] Executar `fix_storage_rls_firebase.sql`
- [ ] Verificar que 4 novas políticas foram criadas
- [ ] Recarregar a aplicação
- [ ] Testar upload de PDF
- [ ] Confirmar que funciona

---

## 💡 **Por Que Aconteceu:**

```
Firebase Auth ≠ Supabase Auth
```

Você está usando:
- **Frontend:** Firebase Auth (user.uid)
- **Backend:** Supabase Storage (auth.uid())

Eles não se comunicam automaticamente!

**Solução:** Usar políticas que não dependem de `auth.uid()` ou fazer a ponte via `user_profiles`.

---

**Execute o script e teste novamente!** 🚀












