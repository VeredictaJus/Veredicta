# 🔧 CORREÇÃO - Aba de Revisões do Admin

## 🐛 **Problema Identificado:**

A aba de "Revisões" no painel admin estava exibindo erro:
```
column corrections.text does not exist
400 Bad Request
```

## ✅ **Soluções Aplicadas:**

### 1. **Correção no Código TypeScript** ✅

**Arquivo:** `src/pages/admin/Revisoes.tsx`

**Mudanças:**
- ❌ `text` → ✅ `original_text` (nome correto da coluna)
- Adicionado campo `status` no tipo e na query
- Alterado filtro de `.is('corrected_text', null)` para `.eq('status', 'pending')`

**Status:** ✅ **APLICADO AUTOMATICAMENTE**

---

### 2. **Correção nas Políticas RLS (Row Level Security)**

**Arquivo:** `fix_corrections_rls.sql`

**Problema:**
As políticas RLS estavam mal configuradas e não permitiam que o admin visualizasse as correções corretamente.

**Solução:**
- Criada função helper `get_firebase_uid()` para obter o Firebase UID do JWT
- Corrigidas todas as políticas para usar a função correta
- Admins agora podem ver e atualizar TODAS as correções
- Redatores podem ver apenas suas próprias correções

**Status:** ⚠️ **PRECISA SER EXECUTADO NO BANCO DE DADOS**

---

## 📋 **Como Aplicar a Correção no Banco de Dados:**

### **Opção 1: Via Supabase Dashboard (Recomendado)**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `fix_corrections_rls.sql`
5. Clique em **Run** para executar

### **Opção 2: Via CLI do Supabase**

```bash
cd workspace/veredicta
supabase db push fix_corrections_rls.sql
```

---

## 🧪 **Teste Após Aplicar:**

1. Faça login como **Admin** (nataliayamao@gmail.com)
2. Acesse **Revisões** no menu lateral
3. A página deve carregar sem erros
4. Se houver pendências, elas aparecerão na tabela
5. Se não houver pendências, deve exibir "Nenhuma pendência no momento."

---

## 📊 **Estrutura Correta da Tabela `corrections`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único |
| `petition_id` | UUID | Referência à petição |
| `user_id` | TEXT | Firebase UID do redator |
| `mode` | TEXT | Modo de correção (abnt, etc) |
| `original_text` | TEXT | ✅ Texto original |
| `corrected_text` | TEXT | Texto corrigido pelo admin |
| `status` | TEXT | pending, in_progress, completed, cancelled |
| `corrector_id` | TEXT | Firebase UID do corretor |
| `notes` | TEXT | Observações |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

---

## ✅ **Checklist de Correções:**

- [x] Corrigir tipo `Correction` no TypeScript
- [x] Corrigir query `loadPending()` para usar `original_text`
- [x] Adicionar campo `status` na query
- [x] Criar arquivo SQL para corrigir políticas RLS
- [ ] **Executar SQL no banco de dados Supabase** ⚠️

---

## 🔄 **Próximos Passos:**

Após executar o SQL no Supabase:
1. Recarregue a página no navegador (Ctrl + Shift + R)
2. Verifique se o erro desapareceu
3. Teste criar uma correção como redator
4. Verifique se aparece na aba de Revisões do admin

---

**Data da Correção:** 2025-11-01  
**Arquivos Modificados:**
- ✅ `src/pages/admin/Revisoes.tsx`
- 📝 `fix_corrections_rls.sql` (criado)







