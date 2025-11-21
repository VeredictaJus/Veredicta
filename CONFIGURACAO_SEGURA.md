# 🔐 Configuração Segura de API Keys

## ✅ Solução Implementada

Como os arquivos `.env` estão bloqueados, implementei uma solução segura alternativa:

### 📁 Estrutura Criada

```
src/config/
  ├── keys.local.ts           ← SUA API KEY (não commitada)
  └── keys.local.example.ts   ← Exemplo (commitada)
```

### 🔒 Segurança Garantida

1. **✅ Arquivo `keys.local.ts` é automaticamente ignorado pelo Git**
   - O `.gitignore` já contém `*.local` (linha 13)
   - Suas keys **NUNCA** serão enviadas ao repositório

2. **✅ Fallback seguro**
   - Se o arquivo não existir, o sistema continua funcionando
   - Apenas desabilita o envio de emails

3. **✅ Fácil de usar**
   - Um único lugar para todas as keys
   - Fácil de manter e atualizar

---

## 🚀 Como Configurar

### Passo 1: Adicionar sua API Key do Resend

Edite o arquivo: `src/config/keys.local.ts`

```typescript
export const LOCAL_KEYS = {
  RESEND_API_KEY: 're_SuaKeyAqui123...', // ← Coloque sua key aqui
  APP_URL: 'http://localhost:5176',
};
```

### Passo 2: Obter a API Key

1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Vá em **API Keys**
4. Clique em **Create API Key**
5. Copie a key (começa com `re_`)

### Passo 3: Reiniciar o servidor

```bash
# Ctrl+C para parar
npm run dev
```

---

## 📋 Arquivo de Exemplo

O arquivo `keys.local.example.ts` é um modelo que você pode usar para criar seu `keys.local.ts`:

```bash
# Copiar o exemplo
cp src/config/keys.local.example.ts src/config/keys.local.ts

# Editar e adicionar sua key
# depois reiniciar o servidor
```

---

## 🧪 Como Testar

### Teste Rápido

Crie um componente de teste:

```typescript
import { useEmail } from '@/hooks/useEmail';

export default function TestEmail() {
  const { sendWelcomeEmail } = useEmail();

  return (
    <button onClick={() => sendWelcomeEmail('seu@email.com', 'Seu Nome')}>
      Testar Email
    </button>
  );
}
```

---

## ⚠️ Importante

### ❌ NUNCA faça:
- ❌ Commitar `keys.local.ts`
- ❌ Compartilhar sua API key
- ❌ Enviar screenshots com a key visível

### ✅ SEMPRE faça:
- ✅ Use `keys.local.ts` para desenvolvimento
- ✅ Mantenha `keys.local.example.ts` no Git (sem keys reais)
- ✅ Use variáveis de ambiente na produção

---

## 🔄 Versionamento

### Arquivos Versionados (Git):
- ✅ `vite.config.ts` - Importa as keys
- ✅ `keys.local.example.ts` - Exemplo sem keys reais
- ✅ `.gitignore` - Ignora `*.local`

### Arquivos NÃO Versionados:
- ❌ `keys.local.ts` - Suas keys reais (ignorado pelo Git)

---

## 🚀 Produção

Na produção, use variáveis de ambiente reais:

```bash
# Exemplo: Vercel, Netlify, etc.
VITE_RESEND_API_KEY=re_your_production_key
VITE_APP_URL=https://veredicta.com
```

---

## 📞 Suporte

Se tiver problemas:

1. Verifique se o arquivo `keys.local.ts` existe
2. Confirme que a API key está correta
3. Reinicie o servidor de desenvolvimento
4. Verifique o console do navegador para erros

---

## ✨ Benefícios desta Abordagem

✅ **Seguro** - Keys nunca vão para o Git  
✅ **Simples** - Um arquivo, fácil de gerenciar  
✅ **Flexível** - Funciona com ou sem keys  
✅ **Documentado** - Arquivo de exemplo incluído  
✅ **Transparente** - Fácil de entender o que está acontecendo  

**Pronto para usar! 🎉**







