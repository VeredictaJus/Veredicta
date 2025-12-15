# 📧 Configuração do Resend - Envio de Emails

## 🚀 Passo a Passo

### 1. Criar conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Clique em "Sign Up"
3. Crie sua conta (gratuita - 100 emails/dia)

### 2. Obter API Key

1. Faça login no Resend
2. Acesse **API Keys** no menu
3. Clique em **Create API Key**
4. Dê um nome (ex: "Veredicta Production")
5. Copie a key (começa com `re_`)

### 3. Configurar no Projeto

Adicione no seu arquivo `.env` ou `.env.local`:

```bash
VITE_RESEND_API_KEY=re_sua_chave_aqui
VITE_APP_URL=http://localhost:5176
```

### 4. Configurar Domínio (Opcional mas Recomendado)

Por padrão, os emails serão enviados de `onboarding@resend.dev`. Para usar seu próprio domínio:

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `veredicta.com`)
4. Adicione os registros DNS no seu provedor:
   - SPF
   - DKIM
   - DMARC
5. Aguarde verificação (~24h)

Depois, atualize o código em `src/services/emailService.ts`:

```typescript
private static defaultFrom = 'Veredicta <noreply@seudominio.com>';
```

## 📝 Uso no Código

### Email de Boas-vindas

```typescript
import { EmailService } from '@/services/emailService';

await EmailService.sendWelcomeEmail(
  'usuario@email.com',
  'Nome do Usuário'
);
```

### Email de Nova Petição

```typescript
await EmailService.sendNewPetitionEmail(
  'usuario@email.com',
  'Nome do Usuário',
  'Título da Petição',
  'petition-id-123'
);
```

### Email de Petição Concluída

```typescript
await EmailService.sendPetitionCompletedEmail(
  'usuario@email.com',
  'Nome do Usuário',
  'Título da Petição'
);
```

### Email Personalizado

```typescript
await EmailService.sendEmail({
  to: 'usuario@email.com',
  subject: 'Assunto do Email',
  html: '<h1>Conteúdo HTML</h1>'
});
```

## 🔄 Integração com Notificações

O sistema já está integrado com as preferências de notificação do usuário. Antes de enviar um email, verifique se o usuário tem `email_notifications` ativado.

Exemplo:

```typescript
// Verificar se o usuário quer receber emails
if (user.email_notifications) {
  await EmailService.sendNewPetitionEmail(
    user.email,
    user.full_name,
    petition.title,
    petition.id
  );
}
```

## 📊 Limites do Plano Gratuito

- **100 emails por dia** (3.000/mês)
- Domínio verificado gratuito
- Analytics incluído
- Suporte por email

## 🎨 Templates Disponíveis

1. **Welcome Email** - Email de boas-vindas
2. **New Petition** - Notificação de nova petição
3. **Petition Completed** - Petição concluída
4. **Password Reset** - Redefinição de senha

Todos os templates são responsivos e com design moderno!

## 🔐 Segurança

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` com suas chaves! Sempre use `.env.local` ou variáveis de ambiente na produção.

## 📞 Suporte

- Documentação Resend: https://resend.com/docs
- Suporte: support@resend.com







