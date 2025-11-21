# 🧪 Guia de Teste de Notificações

## 📋 Visão Geral

Este guia explica como testar o sistema de notificações da Veredicta, incluindo **Email**, **Push** e **SMS**.

## 🚀 Como Testar

### 1. **Via Interface (Mais Fácil)**

1. **Acesse**: Configurações → Aba "Notificações"
2. **Role para baixo** até ver o card "🧪 Teste de Notificações"
3. **Clique nos botões**:
   - 📧 **Testar Email** - Testa envio por email
   - 🔔 **Testar Push** - Testa notificações do navegador
   - 📱 **Testar SMS** - Testa envio por SMS
   - 🧪 **Testar Todas** - Testa todos os canais ativos

### 2. **Via Console do Navegador**

1. **Abra o console** (F12)
2. **Execute**:
```javascript
// Testar notificação específica
const service = NotificationService.getInstance();
await service.sendTestNotification('SEU_USER_ID', 'email'); // ou 'push' ou 'sms'

// Testar notificação completa
await service.sendNotification('SEU_USER_ID', {
  title: 'Teste Manual',
  message: 'Esta é uma notificação de teste manual',
  type: 'info'
});
```

### 3. **Via SQL (Para Admin)**

Execute o script `test_notification_system.sql` no Supabase SQL Editor.

## 📊 O que Esperar

### ✅ **Logs de Sucesso**

```javascript
// Email
📧 [SIMULADO] Enviando email: { userId: "...", title: "🧪 Notificação de Teste", ... }
✅ Email enviado com sucesso

// Push
🔔 Enviando push notification: { userId: "...", title: "🧪 Notificação de Teste", ... }
✅ Push notification enviada

// SMS
📱 [SIMULADO] Enviando SMS: { userId: "...", title: "🧪 Notificação de Teste", ... }
📱 SMS seria enviado para: +5511999999999
✅ SMS enviado com sucesso
```

### ❌ **Logs de Erro**

```javascript
// Permissão negada para push
⚠️ Permissão para notificações negada

// Telefone não cadastrado para SMS
⚠️ Usuário não tem telefone cadastrado para SMS

// Erro de conexão
❌ Erro ao enviar notificações: [erro detalhado]
```

## 🔧 Configurações Necessárias

### **Para Push Notifications:**
1. **Permissão do navegador** deve ser concedida
2. **Página não deve estar em foco** (minimize a janela)
3. **Navegador deve suportar** a API de Notificações

### **Para SMS:**
1. **Telefone deve estar cadastrado** em `user_settings.phone`
2. **SMS notifications deve estar ativo** (`sms_notifications = true`)

### **Para Email:**
1. **Email notifications deve estar ativo** (`email_notifications = true`)
2. **Integração com provedor** (SendGrid, AWS SES, etc.) - atualmente simulado

## 🎯 Cenários de Teste

### **Cenário 1: Apenas Email**
```sql
UPDATE user_settings 
SET email_notifications = true, push_notifications = false, sms_notifications = false
WHERE user_id = 'SEU_USER_ID';
```

### **Cenário 2: Apenas Push**
```sql
UPDATE user_settings 
SET email_notifications = false, push_notifications = true, sms_notifications = false
WHERE user_id = 'SEU_USER_ID';
```

### **Cenário 3: Apenas SMS**
```sql
UPDATE user_settings 
SET email_notifications = false, push_notifications = false, sms_notifications = true, phone = '+5511999999999'
WHERE user_id = 'SEU_USER_ID';
```

### **Cenário 4: Todos Ativos**
```sql
UPDATE user_settings 
SET email_notifications = true, push_notifications = true, sms_notifications = true, phone = '+5511999999999'
WHERE user_id = 'SEU_USER_ID';
```

## 🔍 Troubleshooting

### **Push não aparece:**
- ✅ Verifique se deu permissão ao navegador
- ✅ Minimize a janela (não pode estar em foco)
- ✅ Verifique se `push_notifications = true`

### **SMS não funciona:**
- ✅ Verifique se tem telefone cadastrado
- ✅ Verifique se `sms_notifications = true`
- ✅ Lembre-se que é simulado (não envia SMS real)

### **Email não funciona:**
- ✅ Verifique se `email_notifications = true`
- ✅ Lembre-se que é simulado (não envia email real)

## 🚀 Próximos Passos

Para implementar **envio real**:

### **Email Real:**
```javascript
// Integrar com SendGrid
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: userEmail,
  from: 'noreply@veredicta.com',
  subject: data.title,
  text: data.message
});
```

### **SMS Real:**
```javascript
// Integrar com Twilio
import twilio from 'twilio';
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: `${data.title}: ${data.message}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone
});
```

## 📝 Notas Importantes

- **Atualmente é simulado** - não envia emails/SMS reais
- **Push funciona realmente** - aparece como notificação do navegador
- **Logs detalhados** no console para debug
- **Sistema respeita preferências** do usuário
- **Tratamento de erros** implementado

---

**🎉 Agora você pode testar completamente o sistema de notificações!**

























