# 🚀 Deploy da Edge Function Firebase Auth

## 📋 Requisitos

1. Supabase CLI instalado
2. Acesso ao projeto Supabase
3. Variáveis de ambiente configuradas

## 🔧 Passos para Deploy

### 1. Configurar secrets no Supabase

Execute no Supabase Dashboard > Edge Functions > Secrets:

```bash
# Via CLI
supabase secrets set SUPABASE_URL=https://dmsodonmkffyvbuxtxec.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
supabase secrets set SUPABASE_JWT_SECRET=<seu_jwt_secret>
```

**OU via Dashboard:**
1. Acesse: `https://supabase.com/dashboard/project/dmsodonmkffyvbuxtxec/functions`
2. Vá em "Secrets"
3. Adicione:
   - `SUPABASE_URL` = `https://dmsodonmkffyvbuxtxec.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (sua service role key)
   - `SUPABASE_JWT_SECRET` = (seu JWT secret - encontre em Settings > API)

### 2. Deploy da Edge Function

```bash
cd workspace/veredicta
supabase functions deploy firebase-auth
```

### 3. Verificar o Deploy

Teste a função:

```bash
curl -X POST \
  'https://dmsodonmkffyvbuxtxec.supabase.co/functions/v1/firebase-auth' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{"idToken": "seu_firebase_token_aqui"}'
```

## ✅ Resultado Esperado

A função retornará:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🌐 Como Funciona

1. **Frontend** obtém idToken do Firebase
2. **Frontend** chama a Edge Function `firebase-auth`
3. **Edge Function** valida o token Firebase e retorna token Supabase
4. **Frontend** usa o token Supabase para autenticar requisições ao Storage

## 🎯 Benefícios

- ✅ **Público**: Funciona para todos os usuários na internet
- ✅ **Seguro**: Executa no ambiente do Supabase
- ✅ **Escalável**: Gerenciado automaticamente pelo Supabase
- ✅ **Sem custos extras**: Edge Functions gratuitas até certo limite

## 🔍 Troubleshooting

### Erro: "Function not found"
Execute o deploy novamente:
```bash
supabase functions deploy firebase-auth --no-verify-jwt
```

### Erro: "Missing secrets"
Verifique se todas as secrets foram configuradas corretamente.

### Erro: "Invalid token"
Certifique-se de que o idToken do Firebase está sendo enviado corretamente.










