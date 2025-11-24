# 🌐 Como Configurar o Domínio Personalizado no Vercel

## 🎯 Objetivo

Conectar o domínio `www.veredictajus.com.br` (que está na Hostinger) ao seu site no Vercel.

---

## 📋 Passo a Passo Completo

### **Passo 1: Adicionar Domínio no Vercel**

1. Acesse o painel do Vercel:
   https://vercel.com/natalias-projects-649eefbe/client/settings

2. Clique na aba **"Domains"** (à esquerda)

3. Clique no botão **"Add Domain"** ou **"Add"**

4. Digite o domínio: `www.veredictajus.com.br`

5. Clique em **"Add"** ou **"Continue"**

6. **O Vercel vai mostrar as configurações de DNS necessárias!** ⚠️ **Anote essas informações!**

---

### **Passo 2: Configurar DNS na Hostinger**

Agora você precisa configurar o DNS na Hostinger para apontar para o Vercel.

#### 2.1 Acessar o Painel da Hostinger

1. Acesse: https://hpanel.hostinger.com.br
2. Faça login na sua conta
3. Vá em **"Domínios"** → Selecione `veredictajus.com.br`
4. Clique em **"Gerenciar DNS"** ou **"DNS Zone Editor"**

#### 2.2 Configurar os Registros DNS

O Vercel vai pedir que você crie um registro tipo **CNAME**. Você precisa:

**Opção A: Usar subdomínio www (Recomendado)**

1. Encontre o registro `www` (ou crie um novo se não existir)
2. Configure assim:
   - **Tipo**: `CNAME`
   - **Nome/Host**: `www`
   - **Valor/Valor do Ponto**: O valor que o Vercel forneceu (algo como `cname.vercel-dns.com`)
   - **TTL**: `3600` (ou deixe padrão)

**Opção B: Usar domínio raiz (sem www)**

Se você quiser que `veredictajus.com.br` (sem www) também funcione:

1. O Vercel vai pedir um registro tipo **A** ou **ALIAS**
2. Crie um registro:
   - **Tipo**: `ALIAS` ou `A` (se não tiver ALIAS)
   - **Nome/Host**: `@` (ou deixe vazio para domínio raiz)
   - **Valor**: O IP que o Vercel forneceu
   - **TTL**: `3600`

**⚠️ IMPORTANTE**: Use EXATAMENTE os valores que o Vercel mostrará na tela de configuração de domínio!

---

### **Passo 3: Aguardar Propagação DNS**

Após configurar o DNS:

1. ⏰ **Aguarde 5 minutos a 24 horas** para a propagação DNS
   - Normalmente leva **15-30 minutos**
   - Pode demorar até 24 horas em casos raros

2. ✅ **O Vercel vai verificar automaticamente**
   - No painel do Vercel, o status do domínio vai mudar de "Pending" para "Valid"
   - Quando aparecer ✅ verde, está funcionando!

3. 🌐 **Teste no navegador**
   - Acesse: `https://www.veredictajus.com.br`
   - Deve carregar seu site!

---

## 🔍 Verificar Status do DNS

### Verificação Rápida:

Você pode verificar se o DNS está propagado usando:

1. **Ferramenta online**: https://www.whatsmydns.net/#CNAME/www.veredictajus.com.br
2. **No terminal** (PowerShell):
   ```powershell
   nslookup www.veredictajus.com.br
   ```

---

## ⚙️ Configurações Avançadas (Opcional)

### Redirecionar domínio raiz para www

Se quiser que `veredictajus.com.br` redirecione para `www.veredictajus.com.br`:

1. No Vercel, adicione também o domínio `veredictajus.com.br` (sem www)
2. Nas configurações do domínio, marque a opção de redirecionar para www

### SSL/HTTPS

✅ **O Vercel configura SSL automático e gratuito!**
- Não precisa fazer nada
- O certificado SSL é emitido automaticamente quando o DNS está configurado

---

## 🆘 Troubleshooting

### Problema: "DNS not configured" ou "Pending"

**Solução**:
1. Verifique se digitou os valores corretos na Hostinger
2. Aguarde mais tempo (propagação DNS pode demorar)
3. Limpe o cache do navegador
4. Verifique se não há outros registros DNS conflitantes

### Problema: Site não carrega após configurar DNS

**Solução**:
1. Verifique se o DNS está propagado (use whatsmydns.net)
2. Verifique se o domínio está marcado como "Valid" no Vercel
3. Tente acessar com `https://` (não `http://`)
4. Aguarde até 24 horas para propagação completa

### Problema: Erro 404 ou página em branco

**Solução**:
1. Verifique se o deploy está completo no Vercel
2. Verifique se a URL está correta
3. Limpe o cache do navegador (Ctrl + Shift + R)

---

## 📝 Checklist

Antes de começar:

- [ ] Tenho acesso ao painel da Hostinger (hPanel)
- [ ] Tenho acesso ao painel do Vercel
- [ ] Domínio está ativo e renovado na Hostinger
- [ ] Tenho anotado o domínio exato: `www.veredictajus.com.br`

Após configurar:

- [ ] Domínio adicionado no Vercel
- [ ] Registros DNS configurados na Hostinger
- [ ] Aguardei propagação DNS
- [ ] Domínio mostra status "Valid" no Vercel
- [ ] Site carrega corretamente no navegador
- [ ] HTTPS funciona (cadeado verde no navegador)

---

## 💡 Dicas Importantes

1. ⏱️ **Propagação DNS**: Leva tempo! Não desista nas primeiras horas.

2. 🔒 **HTTPS Automático**: O Vercel configura SSL automaticamente após o DNS propagar.

3. 🔄 **Redirecionamentos**: Você pode configurar `veredictajus.com.br` → `www.veredictajus.com.br` no Vercel.

4. 📊 **Monitoramento**: O Vercel mostra o status do domínio em tempo real no painel.

5. 🆘 **Suporte**: Se tiver problemas, verifique os logs do Vercel e os registros DNS na Hostinger.

---

## 🎯 URLs Importantes

- **Vercel Dashboard**: https://vercel.com/natalias-projects-649eefbe/client
- **Configurações do Projeto**: https://vercel.com/natalias-projects-649eefbe/client/settings
- **Domínios**: https://vercel.com/natalias-projects-649eefbe/client/settings/domains
- **Hostinger hPanel**: https://hpanel.hostinger.com.br
- **Verificar DNS**: https://www.whatsmydns.net

---

## ✅ Pronto!

Depois de seguir esses passos, seu domínio estará funcionando! 🎉

Se tiver alguma dúvida ou problema durante a configuração, me avise! 😊





