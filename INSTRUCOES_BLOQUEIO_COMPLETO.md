# 🔒 SISTEMA COMPLETO DE BLOQUEIO DE PETIÇÕES POR PLANO

## 📋 O QUE FOI IMPLEMENTADO

### ✅ **Sistema de Controle Inteligente:**
- ✅ **Plano Free:** Limite de 1 petição (total, sem validade)
- ✅ **Plano Start:** Limite de 14 petições/30 dias
- ✅ **Plano Pro:** Limite de 14 petições/60 dias + 1 bônus na renovação
- ✅ **Plano Elite:** Limite de 70 petições/90 dias + 3 bônus na renovação
- ✅ **Créditos:** Sistema de fallback para usuários que atingirem limite
- ✅ **Bloqueio Automático:** Redireciona para página de planos quando limite atingido

## 🚀 COMO IMPLEMENTAR

### **1️⃣ EXECUTAR SCRIPT SQL NO SUPABASE**

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo: `workspace/veredicta/implementar_bloqueio_completo_planos.sql`
4. **Copie TODO o conteúdo**
5. **Cole no SQL Editor**
6. Clique em **Run** (executar tudo de uma vez)

### **2️⃣ VERIFICAR SE DEU CERTO**

Execute os seguintes testes no SQL Editor:

```sql
-- Teste 1: Verificar limite do usuário
SELECT get_user_petition_limit('SEU_FIREBASE_UID_AQUI');

-- Teste 2: Verificar se pode criar petição
SELECT check_user_can_create_petition('SEU_FIREBASE_UID_AQUI');

-- Teste 3: Ver estatísticas completas
SELECT get_user_petition_stats('SEU_FIREBASE_UID_AQUI');
```

**Substitua `SEU_FIREBASE_UID_AQUI`** pelo seu `firebase_uid` real.

### **3️⃣ REINICIAR O SERVIDOR**

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

## 🎯 COMO FUNCIONA

### **📊 Lógica de Verificação:**

#### **1. Plano Free:**
- ✅ Conta **TODAS** as petições criadas (não apenas do mês)
- ✅ Limite: 1 petição **no total**
- ✅ Após atingir, bloqueia e pede upgrade

#### **2. Planos Pagos (Start, Pro, Elite):**
- ✅ **Start:** Conta petições dos **últimos 30 dias**
- ✅ **Pro:** Conta petições dos **últimos 60 dias**
- ✅ **Elite:** Conta petições dos **últimos 90 dias**
- ✅ Reseta automaticamente após período de validade
- ✅ Considera **bônus de renovação** se houver

#### **3. Bônus de Renovação:**
- ✅ **Pro:** +1 petição extra no mês da renovação
- ✅ **Elite:** +3 petições extras no mês da renovação
- ✅ Bônus é adicionado automaticamente via webhook do Stripe

#### **4. Sistema de Créditos (Fallback):**
- ✅ Se usuário atingir limite mas tiver créditos, pode continuar
- ✅ Cada petição consome 1 crédito
- ✅ Créditos não expiram

## 🔧 FUNÇÕES SQL CRIADAS

### **1. `get_monthly_petitions_usage(user_id)`**
- Retorna: Número de petições criadas no mês atual
- Uso: Verificar consumo mensal

### **2. `get_free_petitions_usage(user_id)`**
- Retorna: Total de petições criadas (plano free)
- Uso: Verificar se free já usou 2 petições

### **3. `get_user_petition_limit(user_id)`**
- Retorna: JSON com limite, bônus, total
- Uso: Saber quantas petições o usuário pode criar

### **4. `check_user_can_create_petition(user_id)` ⭐**
- Retorna: JSON com `can_submit`, `message`, `redirect_to`
- Uso: **FUNÇÃO PRINCIPAL** - valida se pode criar petição

### **5. `get_user_petition_stats(user_id)`**
- Retorna: Estatísticas completas (uso, limite, créditos)
- Uso: Dashboard, relatórios

## 📱 INTEGRAÇÃO NO FRONTEND

### **Já Implementado em:**
- ✅ `src/services/petitionLimitService.ts` - Atualizado para usar Supabase
- ✅ `src/pages/client/NewPetition.tsx` - Já valida antes de criar

### **Como Funciona no Frontend:**

```typescript
// Ao tentar criar petição (NewPetition.tsx linha 250)
const limitCheck = await PetitionLimitService.checkUserLimits(user.uid, clientProfile);

if (!limitCheck.canSubmit) {
  // Mostra erro
  toast.error(limitCheck.reason);
  
  // Redireciona para planos
  setTimeout(() => {
    navigate(limitCheck.redirectTo!);
  }, 2000);
  return;
}

// Se passou, cria a petição
```

## 💬 MENSAGENS DE ERRO

### **Plano Free:**
```
"Você atingiu o limite de 1 petição gratuita. Assine um plano para continuar."
```

### **Plano Pago (Start/Pro/Elite):**
```
"Você atingiu o limite de 14 petições do seu plano Start (30 dias). 
Aguarde a renovação ou adquira créditos extras."
```

## 🎉 TESTES RECOMENDADOS

### **Teste 1: Usuário Free com 0 petições**
- ✅ Deve permitir criar até 1
- ✅ Na 2ª tentativa, bloqueia e redireciona

### **Teste 2: Usuário Pro com 13 petições nos últimos 60 dias**
- ✅ Deve permitir criar mais 1 (total 14)
- ✅ Na 15ª tentativa, bloqueia

### **Teste 3: Usuário Pro com renovação no período**
- ✅ Limite deve ser 14 + 1 = 15
- ✅ Deve permitir criar 15 petições nos próximos 60 dias

### **Teste 4: Usuário Elite com renovação**
- ✅ Limite deve ser 70 + 3 = 73
- ✅ Deve permitir criar 73 petições nos próximos 90 dias

### **Teste 5: Usuário com limite atingido mas com créditos**
- ✅ Deve permitir criar (consome crédito)
- ✅ Mostra mensagem "Usando créditos disponíveis"

## 🔄 INTEGRAÇÃO COM RENOVAÇÃO

### **Como o Bônus é Aplicado:**

1. **Stripe webhook** detecta `invoice.payment_succeeded`
2. **Backend** chama `process_subscription_renewal()`
3. **Supabase** registra renovação na tabela `subscription_renewals`
4. **Sistema** automaticamente considera bônus nas próximas verificações

### **Verificação Automática:**
- ✅ Sempre que usuário tenta criar petição
- ✅ Sistema verifica se houve renovação no mês atual
- ✅ Adiciona bônus automaticamente ao limite

## 📊 RESUMO DOS LIMITES

| Plano   | Limite Base | Validade | Bônus Renovação | Total na Renovação |
|---------|-------------|----------|-----------------|-------------------|
| Free    | 1 (total)   | Ilimitado | 0               | 1                 |
| Start   | 14         | 30 dias  | 0               | 14                |
| Pro     | 14         | 60 dias  | +1              | 15                |
| Elite   | 70         | 90 dias  | +3              | 73                |

## ⚠️ IMPORTANTE

1. **Execute o script SQL primeiro** - sem isso, o frontend não funcionará
2. **Teste com seu próprio usuário** - substitua os UIDs nos testes
3. **Verifique os logs** - o console mostrará erros se houver
4. **Créditos são opcionais** - sistema funciona sem eles

## 🎯 PRÓXIMOS PASSOS

1. ✅ Executar script SQL no Supabase
2. ✅ Testar funções com seu usuário
3. ✅ Reiniciar servidor de desenvolvimento
4. ✅ Testar criação de petições no frontend
5. ✅ Verificar mensagens de erro
6. ✅ Testar com diferentes planos

---

**🔒 SISTEMA COMPLETO E PRONTO PARA USO!** 🚀✨

