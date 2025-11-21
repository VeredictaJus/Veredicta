# Deploy da Edge Function upload-invoice

## ✅ Mudanças Realizadas

A Edge Function foi atualizada para incluir o nome do redator ao registrar a nota fiscal na tabela.

### Campos agora preenchidos:
- ✅ `writer_id`: Firebase UID do redator
- ✅ `writer_name`: Nome completo do redator (ou email como fallback)
- ✅ `file_path`: Caminho do arquivo no storage
- ✅ `amount`: 0 (para ser preenchido pelo admin)
- ✅ `status`: 'pending'
- ✅ `submitted_at`: Data/hora do envio

## 🚀 Como fazer o Deploy

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# Navegar até o diretório do projeto
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"

# Fazer login no Supabase (se ainda não estiver logado)
supabase login

# Fazer o deploy da função
supabase functions deploy upload-invoice

# Verificar se o deploy foi bem-sucedido
supabase functions list
```

### Opção 2: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/dmsodonmkffyvbuxtxec/functions
2. Clique em "upload-invoice"
3. Cole o código atualizado do arquivo `supabase/functions/upload-invoice/index.ts`
4. Clique em "Deploy"

## 🧪 Testando após o deploy

1. **Vá para a aplicação** (localhost:5174)
2. **Faça login como redator**
3. **Vá para Pagamentos** (#/writer/payments)
4. **Envie uma nova nota fiscal**
5. **Verifique no Console** se não há erros
6. **Faça login como admin**
7. **Vá para Relatórios** (#/admin/relatorios)
8. **A nota fiscal deve aparecer com o nome do redator!** 🎉

## 📝 Verificar no Banco de Dados

Execute no Supabase SQL Editor:

```sql
SELECT 
  id,
  writer_id,
  writer_name,
  file_path,
  amount,
  status,
  submitted_at,
  created_at
FROM app_2d8133c678_invoices
ORDER BY submitted_at DESC
LIMIT 10;
```

Você deve ver o campo `writer_name` preenchido nas novas notas fiscais!










