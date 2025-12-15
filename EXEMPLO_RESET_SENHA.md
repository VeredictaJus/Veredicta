# 🔐 Exemplo: Email de Redefinição de Senha

## ✅ Template Disponível

O template de reset de senha já está implementado e pronto para usar!

## 📧 Design do Email

- **Cor:** Azul/Roxo (#6366f1) - diferente dos outros para destacar segurança
- **Conteúdo:**
  - Saudação personalizada
  - Botão para redefinir senha
  - Aviso de expiração (1 hora)
  - Aviso de segurança

## 🔥 Integração com Firebase Auth

### Opção 1: Usando Firebase Auth (Recomendado)

```typescript
import { getAuth, sendPasswordResetEmail as firebaseSendPasswordReset } from 'firebase/auth';
import { useEmail } from '@/hooks/useEmail';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { sendPasswordResetEmail } = useEmail();
  const auth = getAuth();

  const handleResetPassword = async () => {
    try {
      // Gerar link do Firebase Auth
      await firebaseSendPasswordReset(auth, email, {
        url: `${window.location.origin}/#/login`, // Redireciona após reset
        handleCodeInApp: false
      });

      // Opcional: Enviar email personalizado adicional
      // (O Firebase já envia um email, mas você pode enviar um adicional)
      await sendPasswordResetEmail(
        email,
        email.split('@')[0], // Nome do usuário
        `${window.location.origin}/#/reset-password` // Sua página customizada
      );

      toast.success('Email de redefinição enviado!');
    } catch (error) {
      toast.error('Erro ao enviar email.');
      console.error(error);
    }
  };

  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Digite seu email"
      />
      <button onClick={handleResetPassword}>
        Redefinir Senha
      </button>
    </div>
  );
}
```

### Opção 2: Sistema Customizado (Mais Controle)

```typescript
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { sendPasswordResetEmail } = useEmail();

  const handleResetPassword = async () => {
    try {
      // 1. Verificar se o email existe
      const { data: user } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        toast.error('Email não encontrado.');
        return;
      }

      // 2. Gerar token único
      const resetToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

      // 3. Salvar token no banco
      await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.firebase_uid,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      // 4. Enviar email com link
      const resetLink = `${window.location.origin}/#/reset-password?token=${resetToken}`;
      
      await sendPasswordResetEmail(
        email,
        user.full_name || email.split('@')[0],
        resetLink
      );

      toast.success('Email de redefinição enviado!');
    } catch (error) {
      toast.error('Erro ao processar solicitação.');
      console.error(error);
    }
  };

  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Digite seu email"
      />
      <button onClick={handleResetPassword}>
        Redefinir Senha
      </button>
    </div>
  );
}
```

## 🗄️ Estrutura da Tabela (Para Sistema Customizado)

Se usar sistema customizado, crie a tabela:

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(firebase_uid),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida por token
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);

-- Índice para limpeza de tokens expirados
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
```

## 🔒 Página de Reset de Senha

```typescript
// src/pages/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getAuth, updatePassword } from 'firebase/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (!token) return;

    // Verificar se o token é válido
    const checkToken = async () => {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data && !error) {
        setValidToken(true);
        setUserId(data.user_id);
      } else {
        toast.error('Token inválido ou expirado.');
      }
    };

    checkToken();
  }, [token]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Senhas não conferem.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Atualizar senha no Firebase
        await updatePassword(currentUser, newPassword);

        // Marcar token como usado
        await supabase
          .from('password_reset_tokens')
          .update({ used: true })
          .eq('token', token);

        toast.success('Senha redefinida com sucesso!');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Erro ao redefinir senha.');
      console.error(error);
    }
  };

  if (!validToken) {
    return (
      <div>
        <h1>Link Inválido</h1>
        <p>Este link expirou ou é inválido.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Redefinir Senha</h1>
      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleResetPassword}>
        Salvar Nova Senha
      </button>
    </div>
  );
}
```

## 🧪 Testar

Use a página de teste criada: `src/pages/TestEmail.tsx`

Clique no botão **"🔐 Reset de Senha"** para receber um email de exemplo!

## 🔐 Segurança

### ✅ Boas Práticas:
- Token único por solicitação
- Expiração de 1 hora
- Marcar token como usado após reset
- Validar força da senha
- Limpar tokens expirados periodicamente

### ⚠️ Cuidados:
- Nunca expor tokens em logs
- Usar HTTPS em produção
- Rate limiting para evitar spam
- Não revelar se email existe ou não (prevenir enum)

## 📚 Referências

- [Firebase Auth - Password Reset](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)
- [Supabase Auth](https://supabase.com/docs/guides/auth)







