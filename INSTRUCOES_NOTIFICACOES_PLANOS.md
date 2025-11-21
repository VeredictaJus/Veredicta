# 📬 Sistema de Notificações de Planos - Instruções de Deploy

## ✅ O que foi implementado

### 1. **PlanNotificationService** (`src/services/planNotificationService.ts`)
Serviço completo para gerenciar notificações relacionadas a planos:

- ✅ `notifyLimitReached()` - Notifica quando limite de petições é atingido (100%)
- ✅ `checkAndNotifyNearLimit()` - Notifica quando próximo do limite (80%)
- ✅ `checkAndNotifyExpiringPlans()` - Notifica planos expirando em 7, 3, ou 1 dia
- ✅ `checkAndNotifyExpiredPlans()` - Notifica planos expirados e atualiza status
- ✅ `notifyPlanRenewed()` - Notifica renovação bem-sucedida de plano
- ✅ `runAllChecks()` - Executa todas as verificações

### 2. **Integração com Criação de Petições** (`src/pages/client/NewPetition.tsx`)
- ✅ Notifica quando limite é atingido antes de criar petição
- ✅ Verifica uso após criar petição e notifica se próximo do limite (80%)

### 3. **Integração com Login** (`src/contexts/NewAuthContext.tsx`)
- ✅ Executa verificações de limite e vencimento ao fazer login (apenas para clientes)

### 4. **Edge Function para Verificação Diária** (`supabase/functions/check-plan-expiry/index.ts`)
- ✅ Verifica assinaturas expirando nos próximos 7 dias
- ✅ Cria notificações em 7, 3, e 1 dia antes do vencimento
- ✅ Marca assinaturas como 'expired' quando vencidas
- ✅ Evita notificações duplicadas

### 5. **Automação via GitHub Actions** (`.github/workflows/check-plan-expiry.yml`)
- ✅ Workflow para executar verificações diariamente às 9h UTC (6h BRT)
- ✅ Pode ser executado manualmente via GitHub Actions UI

---

## 🚀 Passos para Deploy

### PASSO 1: Deploy da Edge Function

```bash
cd workspace/veredicta
supabase functions deploy check-plan-expiry
```

**Verificar deploy:**
```bash
# Testar a função manualmente
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/check-plan-expiry \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

### PASSO 2: Configurar Automação (escolha uma opção)

#### **OPÇÃO A: GitHub Actions** (Recomendado - Grátis)

1. **Adicionar secrets no GitHub:**
   - Vá para: `Settings` > `Secrets and variables` > `Actions`
   - Adicione:
     - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

2. **Ativar GitHub Actions:**
   - O arquivo já está em `.github/workflows/check-plan-expiry.yml`
   - Faça commit e push
   - Vá para `Actions` no GitHub para verificar

3. **Testar execução manual:**
   - `Actions` > `Check Plan Expiry Daily` > `Run workflow`

#### **OPÇÃO B: pg_cron (Planos Pagos do Supabase)**

Execute no SQL Editor do Supabase:

```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar job diário às 9h UTC
SELECT cron.schedule(
    'check-plan-expiry-daily',
    '0 9 * * *',
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/check-plan-expiry',
          headers:=jsonb_build_object(
            'Content-Type','application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
          ),
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- Verificar jobs
SELECT * FROM cron.job;
```

#### **OPÇÃO C: Serviços Externos**
- **cron-job.org** (grátis)
- **EasyCron**
- **Vercel Cron** (se usar Vercel)

Configure para chamar:
```
POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/check-plan-expiry
Header: Authorization: Bearer YOUR_ANON_KEY
```

---

### PASSO 3: Verificar Funcionamento

1. **Criar uma assinatura de teste com vencimento próximo:**

```sql
-- No SQL Editor do Supabase
INSERT INTO user_subscriptions (
    user_id,
    plan_code,
    status,
    next_billing_date,
    created_at
) VALUES (
    'seu_user_id_aqui',
    'starter',
    'active',
    NOW() + INTERVAL '2 days', -- Expira em 2 dias
    NOW()
);
```

2. **Executar Edge Function manualmente:**

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/check-plan-expiry \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

3. **Verificar notificações criadas:**

```sql
SELECT * FROM app_2d8133c678_notifications
WHERE type IN ('plan_expiring_soon', 'plan_expired', 'plan_limit_reached', 'plan_near_limit')
ORDER BY created_at DESC;
```

4. **Fazer login no sistema e verificar sino de notificações** 🔔

---

## 📋 Tipos de Notificações Implementadas

### Para CLIENTS:

| Tipo | Título | Quando | Prioridade |
|------|--------|--------|------------|
| `plan_near_limit` | ⚠️ Limite de Petições Próximo | 80% do limite usado | NORMAL |
| `plan_limit_reached` | 🚫 Limite de Petições Atingido | 100% do limite usado | URGENT |
| `plan_expiring_soon` | ⏰ Plano Expira em X Dias | 7, 3, ou 1 dia antes | HIGH/URGENT |
| `plan_expired` | ❌ Plano Expirado | Após vencimento | URGENT |
| `plan_renewed` | ✅ Plano Renovado | Após renovação | NORMAL |

---

## 🔧 Solução de Problemas

### Notificações não aparecem:
1. Verificar se a tabela `app_2d8133c678_notifications` tem permissões RLS corretas
2. Verificar logs da Edge Function no Supabase Dashboard
3. Confirmar que `user_id` na tabela é TEXT (não UUID)

### Edge Function falha:
1. Verificar logs: `supabase functions logs check-plan-expiry`
2. Confirmar que as variáveis de ambiente estão setadas
3. Testar localmente: `supabase functions serve check-plan-expiry`

### GitHub Actions não executa:
1. Verificar secrets configurados corretamente
2. Verificar se Actions está habilitado no repositório
3. Ver logs em `Actions` > `Check Plan Expiry Daily`

---

## 📊 Monitoramento

### Ver estatísticas de execução:

```sql
-- Notificações criadas hoje
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN is_read THEN 1 END) as read_count
FROM app_2d8133c678_notifications
WHERE created_at >= CURRENT_DATE
    AND type IN ('plan_expiring_soon', 'plan_expired', 'plan_limit_reached', 'plan_near_limit')
GROUP BY type;

-- Assinaturas expirando esta semana
SELECT 
    u.email,
    s.plan_code,
    s.next_billing_date,
    EXTRACT(DAY FROM (s.next_billing_date - NOW())) as days_left
FROM user_subscriptions s
JOIN user_profiles u ON u.firebase_uid = s.user_id
WHERE s.status = 'active'
    AND s.next_billing_date <= NOW() + INTERVAL '7 days'
ORDER BY s.next_billing_date;
```

---

## 🎯 Próximos Passos (Opcional)

- [ ] Implementar notificações por email (além do sino)
- [ ] Dashboard de métricas de planos
- [ ] Sistema de créditos extras
- [ ] Upgrade automático de plano
- [ ] Notificações de uso semanal/mensal

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs da Edge Function
2. Testar manualmente as funções SQL
3. Verificar permissões RLS
4. Verificar se as tabelas existem e têm os tipos corretos

**Tudo pronto para produção! 🚀**










