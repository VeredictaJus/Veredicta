# 📋 Como Configurar FIREBASE_PRIVATE_KEY no Supabase

## 🎯 Passo a Passo Visual

### 1️⃣ Acesse o Supabase Dashboard
- Abra: https://supabase.com/dashboard/project/dmsodonmkffyvbuxtxec/functions
- Faça login se necessário

### 2️⃣ Encontre a Edge Function
- Na lista de funções, procure por: **`generate-password-reset-link`**
- Clique nela

### 3️⃣ Acesse as Configurações
- Você verá várias abas: **Overview**, **Logs**, **Settings**, etc.
- Clique na aba **Settings** (ou "Configurações")

### 4️⃣ Encontre a Seção de Secrets/Variáveis
- Role a página para baixo
- Procure por uma seção chamada:
  - **"Secrets"** ou
  - **"Environment Variables"** ou
  - **"Variáveis de Ambiente"**

### 5️⃣ Adicione ou Edite FIREBASE_PRIVATE_KEY
- Procure na lista por: **`FIREBASE_PRIVATE_KEY`**
- Se **NÃO existir**:
  - Clique em **"Add new secret"** ou **"Adicionar nova variável"**
  - Nome: `FIREBASE_PRIVATE_KEY`
  - Valor: Cole o texto do arquivo `FIREBASE_PRIVATE_KEY_VALUE.txt`
- Se **JÁ existir**:
  - Clique para editar
  - Substitua o valor pelo texto do arquivo `FIREBASE_PRIVATE_KEY_VALUE.txt`

### 6️⃣ Salve
- Clique em **"Save"** ou **"Salvar"**

## 📄 Onde está o valor para copiar?

Abra o arquivo: **`FIREBASE_PRIVATE_KEY_VALUE.txt`** (na raiz do projeto)

Copie **TODO** o conteúdo desse arquivo e cole no campo `FIREBASE_PRIVATE_KEY`.

## ⚠️ Importante

- O texto deve começar com: `-----BEGIN PRIVATE KEY-----\n`
- O texto deve terminar com: `\n-----END PRIVATE KEY-----\n`
- Mantenha os `\n` (não substitua por quebras de linha reais)
- Não adicione espaços extras no início ou fim

## 🔍 Se não encontrar a seção "Secrets"

Algumas versões do Supabase Dashboard podem ter nomes diferentes:
- Procure por: **"Environment Variables"**
- Ou: **"Config"**
- Ou: **"Settings"** → Role para baixo até encontrar variáveis de ambiente

## ✅ Verificar outras variáveis necessárias

Certifique-se de que estas também estão configuradas:
- `FIREBASE_PROJECT_ID` = `veredicta-85b8c`
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@veredicta-85b8c.iam.gserviceaccount.com`
- `RESEND_API_KEY` = (sua chave do Resend)
- `APP_PUBLIC_URL` = `https://www.veredictajus.com.br`

