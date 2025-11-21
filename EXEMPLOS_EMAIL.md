# 📧 Exemplos de Uso - Sistema de Email

## 1. Email de Boas-Vindas no Registro

No arquivo `src/components/Auth/NewRegisterForm.tsx` ou onde faz o registro:

```typescript
import { useEmail } from '@/hooks/useEmail';

export default function NewRegisterForm() {
  const { sendWelcomeEmail } = useEmail();

  const handleRegister = async (formData: any) => {
    try {
      // Criar usuário no Firebase/Supabase
      const user = await createUser(formData);
      
      // Enviar email de boas-vindas
      await sendWelcomeEmail(
        formData.email,
        formData.name || formData.email.split('@')[0]
      );
      
      toast.success('Conta criada! Verifique seu email.');
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  // ... resto do componente
}
```

## 2. Email de Nova Petição

No arquivo onde cria a petição (ex: `src/pages/client/NewPetition.tsx`):

```typescript
import { useEmail } from '@/hooks/useEmail';
import { useNewAuth } from '@/contexts/NewAuthContext';

export default function NewPetition() {
  const { user } = useNewAuth();
  const { sendNewPetitionEmail } = useEmail();

  const handleSubmit = async (petitionData: any) => {
    try {
      // Criar petição no banco
      const petition = await createPetition(petitionData);
      
      // Enviar email de confirmação
      if (user?.email) {
        await sendNewPetitionEmail(
          user.email,
          user.profile?.full_name || user.email,
          petition.title,
          petition.id
        );
      }
      
      toast.success('Petição criada com sucesso!');
      navigate('/client/petitions');
    } catch (error) {
      console.error('Erro ao criar petição:', error);
    }
  };

  // ... resto do componente
}
```

## 3. Email de Petição Concluída

No arquivo do redator onde marca como concluída (ex: `src/pages/writer/MyPetitions.tsx`):

```typescript
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/lib/supabaseClient';

export default function MyPetitions() {
  const { sendPetitionCompletedEmail } = useEmail();

  const handleMarkAsCompleted = async (petition: Petition) => {
    try {
      // Atualizar status no banco
      await supabase
        .from('petitions')
        .update({ status: 'completed' })
        .eq('id', petition.id);
      
      // Buscar dados do cliente
      const { data: client } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('firebase_uid', petition.client_id)
        .single();
      
      // Enviar email para o cliente
      if (client) {
        await sendPetitionCompletedEmail(
          client.email,
          client.full_name || client.email,
          petition.title
        );
      }
      
      toast.success('Petição marcada como concluída!');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // ... resto do componente
}
```

## 4. Email Personalizado

Para casos específicos, use o `sendCustomEmail`:

```typescript
import { useEmail } from '@/hooks/useEmail';

function MyComponent() {
  const { sendCustomEmail, sending, error } = useEmail();

  const sendNotification = async () => {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Notificação Importante</h2>
        <p>Seu plano está prestes a vencer!</p>
        <a href="https://veredicta.com/plans" style="
          background: #ea580c;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        ">
          Renovar Agora
        </a>
      </div>
    `;

    await sendCustomEmail(
      'cliente@email.com',
      '⚠️ Seu plano está expirando',
      html
    );
  };

  return (
    <button onClick={sendNotification} disabled={sending}>
      {sending ? 'Enviando...' : 'Enviar Notificação'}
    </button>
  );
}
```

## 5. Verificar Preferências do Usuário

Antes de enviar emails, sempre verifique as preferências:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { EmailService } from '@/services/emailService';

async function sendEmailIfEnabled(userId: string, emailData: any) {
  // Buscar preferências
  const { data: settings } = await supabase
    .from('user_settings')
    .select('email_notifications')
    .eq('user_id', userId)
    .single();
  
  // Só enviar se estiver habilitado
  if (settings?.email_notifications) {
    await EmailService.sendEmail(emailData);
  } else {
    console.log('📧 Email não enviado: notificações desabilitadas pelo usuário');
  }
}
```

## 6. Envio em Massa (Cuidado com o Limite!)

```typescript
import { EmailService } from '@/services/emailService';

async function sendBulkEmails(users: User[]) {
  // Lembrete: Plano gratuito tem limite de 100 emails/dia
  
  for (const user of users) {
    if (user.email_notifications) {
      await EmailService.sendEmail({
        to: user.email,
        subject: 'Atualização Importante',
        html: `<h1>Olá ${user.name}!</h1>`
      });
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

## 7. Tratamento de Erros

```typescript
import { useEmail } from '@/hooks/useEmail';
import { toast } from 'sonner';

function MyComponent() {
  const { sendWelcomeEmail, error } = useEmail();

  const handleSend = async () => {
    const success = await sendWelcomeEmail('user@email.com', 'User Name');
    
    if (success) {
      toast.success('Email enviado com sucesso!');
    } else {
      toast.error(`Erro ao enviar email: ${error || 'Erro desconhecido'}`);
    }
  };

  return <button onClick={handleSend}>Enviar Email</button>;
}
```

## 📌 Dicas Importantes

1. **Sempre verifique as preferências do usuário** antes de enviar
2. **Use try/catch** para tratar erros
3. **Respeite o limite** do plano gratuito (100/dia)
4. **Teste em desenvolvimento** com emails reais
5. **Configure seu domínio** no Resend para melhor deliverability
6. **Monitore** os emails no dashboard do Resend

## 🔐 Segurança

Nunca expor a API key do Resend no frontend! O ideal seria criar uma API no backend para enviar emails. Por enquanto, a implementação está no frontend para simplicidade, mas considere mover para o backend em produção.

### Backend Recomendado:

```typescript
// backend/api/send-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();
  
  const { data, error } = await resend.emails.send({
    from: 'Veredicta <noreply@veredicta.com>',
    to,
    subject,
    html
  });

  return Response.json({ success: !error, data, error });
}
```

## 🎯 Próximos Passos

1. Configure a API key do Resend no `.env`
2. Teste com seu email pessoal
3. Integre no fluxo de registro
4. Adicione nos eventos de petição
5. Configure seu domínio personalizado
6. Monitore o uso no dashboard do Resend







