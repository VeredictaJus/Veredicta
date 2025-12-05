# 🔧 Como Corrigir Variáveis de Ambiente no Vercel

## ❌ Problema

A página está carregando em branco porque as variáveis de ambiente do Supabase não estão configuradas no Vercel.

Erro no console: `supabaseKey is required`

## ✅ Solução Rápida: Configurar Variáveis no Painel do Vercel

### Passo 1: Acessar Configurações

1. Acesse: https://vercel.com/natalias-projects-649eefbe/client/settings
2. Clique em **"Environment Variables"** (à esquerda)

### Passo 2: Adicionar Variáveis

Adicione estas variáveis uma por uma (clique em "Add New"):

#### 1. VITE_SUPABASE_URL
```
Valor: https://dmsodonmkffyvbuxtxec.supabase.co
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### 2. VITE_SUPABASE_ANON_KEY
```
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### 3. VITE_APP_URL
```
Valor: https://client-q3zgxuzhn-natalias-projects-649eefbe.vercel.app
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### 4. VITE_RESEND_API_KEY (Opcional - se você tiver)
```
Valor: (sua chave Resend aqui, se tiver)
Ambientes: ✅ Production ✅ Preview ✅ Development
```

#### 5. VITE_STRIPE_PUBLISHABLE_KEY (Opcional - se você tiver)
```
Valor: pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd
Ambientes: ✅ Production ✅ Preview ✅ Development
```

> 💡 **IMPORTANTE**: Marque todas como **Production**, **Preview** e **Development**!

### Passo 3: Fazer Novo Deploy

Após adicionar as variáveis, você precisa fazer um novo deploy. Duas opções:

#### Opção A: Via CLI (Recomendado)

Na raiz do projeto (não na pasta dist/client):

```powershell
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"
vercel --prod
```

Isso vai:
1. Fazer o build com as variáveis configuradas
2. Fazer upload do build
3. Substituir o deploy anterior

#### Opção B: Via Painel Web

1. No painel do Vercel, vá em **"Deployments"**
2. Clique nos **3 pontinhos** (...) do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o novo deploy

---

## 🎯 Método Alternativo: Deploy da Raiz do Projeto

Se quiser que o Vercel faça o build automaticamente:

### Passo 1: Deletar Deploy Anterior (Opcional)

Ou simplesmente fazer um novo deploy da raiz que vai substituir.

### Passo 2: Deploy da Raiz

```powershell
cd "C:\Users\natal\OneDrive\Documentos\Veredicta Software Jurídico\Veredicta_ Legal Petition Hub correto (5)\workspace\veredicta"
vercel --prod
```

O Vercel vai:
- Detectar que é um projeto Vite
- Fazer o build automaticamente
- Usar as variáveis de ambiente configuradas no painel
- Fazer deploy

---

## ✅ Checklist

Antes de fazer o deploy:

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Todas as variáveis marcadas para Production, Preview e Development
- [ ] Estou na raiz do projeto (não em dist/client)
- [ ] Comando `vercel --prod` executado

Após o deploy:

- [ ] Aguardei o build completar
- [ ] Testei o site no navegador
- [ ] Console do navegador não mostra mais erros de Supabase
- [ ] Página carrega corretamente

---

## 🆘 Troubleshooting

### Erro continua aparecendo

1. Verifique se as variáveis foram salvas corretamente no Vercel
2. Verifique se marcou para Production
3. Faça um novo deploy após configurar as variáveis
4. Limpe o cache do navegador (Ctrl + Shift + R)

### Build falha

1. Verifique se está na raiz do projeto
2. Verifique se tem um `package.json` na raiz
3. Verifique os logs de build no Vercel

### Variáveis não estão sendo usadas

1. Certifique-se de que as variáveis começam com `VITE_`
2. Faça um novo build (não apenas redeploy)
3. Verifique o `vite.config.ts` se está lendo as variáveis corretamente

---

## 📝 URLs Importantes

- **Configurações do Projeto**: https://vercel.com/natalias-projects-649eefbe/client/settings
- **Variáveis de Ambiente**: https://vercel.com/natalias-projects-649eefbe/client/settings/environment-variables
- **Deployments**: https://vercel.com/natalias-projects-649eefbe/client/deployments

---

Pronto! Siga esses passos e seu site vai funcionar! 🚀
























