# 🔧 Como Editar CORS no Render

## ❌ NÃO CRIE UM NOVO ENVIRONMENT GROUP!

Você precisa **editar as variáveis do serviço que já existe**, não criar um novo grupo.

---

## ✅ PASSO A PASSO CORRETO

### 1. Voltar para o Serviço "Veredicta"

1. No Render, clique em **"VeredictaJus"** (canto superior esquerdo)
2. OU vá em **"Projects"** no menu lateral
3. Clique no serviço **"Veredicta"** (o que você acabou de criar)

### 2. Editar Environment Variables

1. No menu lateral esquerdo, clique em **"Environment"** (ícone de pasta)
2. Você verá as variáveis que já configurou:
   - `PORT`
   - `FRONTEND_URL`
   - `ALLOWED_ORIGINS`
   - `STRIPE_SECRET_KEY`

### 3. Atualizar ALLOWED_ORIGINS

1. Encontre a variável **`ALLOWED_ORIGINS`**
2. Clique no **ícone de lápis** (edit) ou clique na variável
3. Atualize o valor para:
   ```
   https://veredicta-certo-bteoy7uoe-natalias-projects-649eefbe.vercel.app,https://www.veredictajus.com.br,https://veredictajus.com.br
   ```
4. Clique em **"Save"** ou **"Update"**
5. O Render vai fazer redeploy automaticamente

---

## 📋 RESUMO

**NÃO crie um novo Environment Group!**

**FAÇA:**
1. Vá no serviço "Veredicta" que já existe
2. Clique em "Environment" no menu lateral
3. Edite a variável `ALLOWED_ORIGINS`
4. Adicione `https://www.veredictajus.com.br`
5. Salve

---

## ⚠️ IMPORTANTE

Você está na tela de criar um **novo grupo**. Feche essa tela e vá para o **serviço existente** "Veredicta"!


















