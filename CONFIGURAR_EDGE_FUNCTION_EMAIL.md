# 📧 Configuração da Edge Function de Email

## ✅ O que foi implementado

1. **Edge Function criada**: `supabase/functions/send-email`
   - Recebe HTML já formatado dos templates
   - Envia via Resend API
   - Mantém todos os templates bonitos intactos

2. **EmailService atualizado**:
   - **Desenvolvimento**: Usa `/api/send-email` local (vite-plugin-api-routes)
   - **Produção**: Usa Supabase Edge Function `/functions/v1/send-email`

## 🔧 Configuração no Supabase

### Passo 1: Fazer deploy da Edge Function

```bash
# No terminal, na raiz do projeto
supabase functions deploy send-email
```

### Passo 2: Configurar variável de ambiente

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** → **send-email** → **Settings**
4. Na seção **Environment Variables**, adicione:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Sua chave da API do Resend (ex: `re_xxxxxxxxxxxxx`)

### Passo 3: Verificar variáveis de ambiente do frontend

Certifique-se de que estas variáveis estão configuradas no seu ambiente de produção:

- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## 🧪 Testar

1. **Em desenvolvimento**: 
   - Acesse `http://localhost:5176/#/test-email`
   - Envie um email de teste
   - Deve usar `/api/send-email` local

2. **Em produção**:
   - Após fazer deploy, teste enviando um email
   - Deve usar a Edge Function do Supabase
   - Verifique os logs no dashboard do Supabase

## 📋 Checklist

- [ ] Edge Function `send-email` criada
- [ ] Deploy da Edge Function feito
- [ ] Variável `RESEND_API_KEY` configurada no Supabase
- [ ] `VITE_SUPABASE_URL` configurado no ambiente de produção
- [ ] `VITE_SUPABASE_ANON_KEY` configurado no ambiente de produção
- [ ] Teste em desenvolvimento funcionando
- [ ] Teste em produção funcionando

## 🎨 Templates

✅ **Todos os templates HTML estão intactos e funcionando!**
- Os templates em `src/services/emailTemplates.ts` não foram alterados
- Apenas o mecanismo de envio foi atualizado
- Emails continuam bonitos com logos, cores e formatação

## 🔍 Troubleshooting

### Erro: "RESEND_API_KEY not found"
- Verifique se a variável está configurada no Supabase Dashboard
- Certifique-se de que o nome está exatamente: `RESEND_API_KEY`

### Erro: "VITE_SUPABASE_URL não configurado"
- Verifique se a variável está no arquivo `.env` ou nas configurações do Vercel
- Formato esperado: `https://xxxxx.supabase.co`

### Erro de CORS
- A Edge Function já inclui headers CORS
- Se ainda houver problemas, verifique se está chamando a URL correta

### Email não chega
- Verifique os logs da Edge Function no Supabase Dashboard
- Verifique se o domínio está verificado no Resend
- Verifique se o email não foi para spam

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend API Docs](https://resend.com/docs/api-reference/emails/send-email)




