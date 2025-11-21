# 🎯 INSTRUÇÕES PARA CORREÇÃO DA PETIÇÃO

## ✅ O QUE FOI CORRIGIDO

1. **Código de criação de petições** (`NewPetition.tsx`):
   - Agora remove automaticamente caracteres NULL do `client_id`
   - Linha 331: `client_id: user.uid.trim().replace(/\0/g, '')`

## 📋 PRÓXIMOS PASSOS

### 1. Execute o script SQL para deletar a petição problemática

No **Supabase SQL Editor**, execute:

```sql
-- Deletar a petição problemática com caractere NULL
DELETE FROM public.petitions 
WHERE id = '245921a8-8707-4d55-b559-527bc33edd9b';

-- Verificar se foi deletada
SELECT COUNT(*) as total_petitions FROM public.petitions;
```

**Arquivo:** `workspace/veredicta/delete_broken_petition.sql`

### 2. Teste a aplicação

1. Abra a aplicação no navegador
2. Faça login como cliente
3. Crie uma **NOVA PETIÇÃO**
4. Verifique se ela aparece em:
   - Régua de "Uso de Petições"
   - Lista de "Suas Petições" no dashboard
   - Aba "Minhas Petições"

## ✅ RESULTADO ESPERADO

- ✅ A nova petição será criada **SEM caractere NULL**
- ✅ Aparecerá normalmente em todas as listas
- ✅ A régua de uso será atualizada corretamente

## 🔧 SE AINDA NÃO FUNCIONAR

Execute este SQL para verificar se há RLS ativo:

```sql
-- Verificar status do RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'petitions';
```

Se `rowsecurity = true`, execute:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE public.petitions DISABLE ROW LEVEL SECURITY;
```

## 📝 NOTAS IMPORTANTES

- A petição antiga (`gfjdhgjdhg`) tinha um caractere NULL no `client_id` que não podia ser removido
- Deletá-la é a melhor solução
- O código agora está corrigido para prevenir o problema em novas petições

















