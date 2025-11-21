# 🧪 Como Testar o Sistema de Emails

## ✅ Pré-requisitos

- [x] API Key do Resend configurada em `src/config/keys.local.ts`
- [x] Servidor reiniciado após configurar a key

## 🚀 Passo a Passo

### 1️⃣ **Reiniciar o Servidor**

No terminal onde o projeto está rodando:

```bash
# Parar o servidor
Ctrl + C

# Iniciar novamente
npm run dev
```

### 2️⃣ **Acessar a Página de Teste**

Abra no navegador:

```
http://localhost:5176/#/test-email
```

**Ou clique aqui se o servidor estiver rodando:** [http://localhost:5176/#/test-email](http://localhost:5176/#/test-email)

### 3️⃣ **Preencher os Campos**

Na página de teste você verá:

📧 **Email de Destino:**
- Digite seu email pessoal (ex: `seu@email.com`)
- Importante: Use um email real que você tem acesso!

👤 **Nome:**
- Digite seu nome (ex: `João Silva`)
- Necessário para alguns templates

### 4️⃣ **Escolher um Teste**

Você tem 3 opções de botões:

#### 🔵 **Teste Simples**
- Email básico de teste
- Requer apenas: Email
- Confirma que a integração está funcionando

#### 🎉 **Boas-vindas**
- Template completo de boas-vindas
- Requer: Email + Nome
- Mostra o design profissional

#### 🔐 **Reset de Senha**
- Template de redefinição de senha
- Requer: Email + Nome
- Inclui botão de ação e avisos de segurança

### 5️⃣ **Enviar o Teste**

1. Clique em um dos botões
2. Aguarde alguns segundos (você verá "Enviando...")
3. Uma mensagem de sucesso ou erro aparecerá

### 6️⃣ **Verificar seu Email**

⏰ **Tempo de entrega:** Geralmente instantâneo (5-30 segundos)

📬 **Onde procurar:**
1. Abra seu email
2. Procure na **Caixa de Entrada**
3. Se não encontrar, verifique **Spam/Lixo Eletrônico**
4. Procure por emails de: `onboarding@resend.dev` ou `noreply@veredicta.com`

## ✅ Resultado Esperado

Você deve ver um email com:
- ✅ Design moderno e responsivo
- ✅ Cores da marca Veredicta (laranja/roxo/azul)
- ✅ Botões de ação funcionais
- ✅ Layout profissional

## 🐛 Resolução de Problemas

### ❌ Erro: "Falha ao enviar email"

**Possíveis causas:**

1. **API Key incorreta**
   - Verifique `src/config/keys.local.ts`
   - Certifique-se que a key começa com `re_`
   - Crie uma nova key no [Resend](https://resend.com/api-keys)

2. **Servidor não foi reiniciado**
   - Pare com Ctrl+C
   - Inicie novamente com `npm run dev`

3. **Email inválido**
   - Use um formato válido: `usuario@dominio.com`

### 📧 Email não chegou

**O que fazer:**

1. **Aguarde 1-2 minutos**
   - Às vezes há um pequeno atraso

2. **Verifique SPAM**
   - Importante! Muitos emails de teste vão para spam

3. **Verifique o console do navegador** (F12)
   - Procure por erros em vermelho
   - Veja os logs que começam com 📧 ou ✅

4. **Verifique o Dashboard do Resend**
   - Acesse: [https://resend.com/emails](https://resend.com/emails)
   - Veja se o email foi enviado
   - Verifique o status de entrega

### 🔍 Console do Navegador

Abra o console (F12) e procure por:

```
📧 Enviando email: ...
✅ Email enviado com sucesso: ...
```

Ou erros:
```
❌ Erro ao enviar email: ...
```

## 📊 Verificações Adicionais

### ✅ Checklist de Sucesso

- [ ] API Key configurada em `keys.local.ts`
- [ ] Servidor reiniciado após configurar
- [ ] Página de teste acessível em `/test-email`
- [ ] Email enviado sem erros
- [ ] Email recebido na caixa de entrada
- [ ] Template renderizando corretamente

## 🎯 Próximos Passos

Depois de testar com sucesso:

1. **Integrar no registro de usuários**
   - Enviar email de boas-vindas automaticamente

2. **Adicionar nas notificações de petição**
   - Nova petição criada
   - Petição concluída

3. **Configurar domínio personalizado**
   - No Resend, adicione seu domínio
   - Emails virão de `noreply@seudominio.com`

4. **Monitorar uso**
   - Dashboard do Resend: [https://resend.com](https://resend.com)
   - Limite gratuito: 100 emails/dia

## 📞 Ainda com Problemas?

Se mesmo após todos os passos não funcionar:

1. **Verifique o terminal** - Há erros ao iniciar o servidor?
2. **Verifique o navegador** - Console (F12) mostra erros?
3. **Teste com outro email** - Às vezes o problema é com o provedor
4. **Crie nova API Key** - A antiga pode estar inválida

---

## 🎉 Tudo Funcionando?

Parabéns! Seu sistema de emails está configurado e pronto para uso em produção!

**Templates disponíveis:**
- 🎉 Boas-vindas
- 📄 Nova Petição
- ✅ Petição Concluída
- 🔐 Reset de Senha

**Documentação completa:**
- `RESEND_README.md` - Visão geral
- `RESEND_SETUP.md` - Configuração
- `EXEMPLOS_EMAIL.md` - Integração nos fluxos
- `EXEMPLO_RESET_SENHA.md` - Reset de senha específico







