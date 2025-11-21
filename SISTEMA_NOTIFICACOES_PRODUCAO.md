# 📢 Sistema de Notificações - Produção

## ✅ Status: **ATIVO E FUNCIONAL**

---

## 📋 Visão Geral

O sistema de notificações está **100% funcional** e inclui:

- ✅ **7 tipos** de notificação
- ✅ **5 triggers** automáticos em tempo real
- ✅ **3 cron jobs** agendados
- ✅ **1 hook React** para alertas de deadline
- ✅ **Navegação inteligente** ao clicar nas notificações
- ✅ **RLS case-insensitive** implementado

---

## 🔔 Tipos de Notificação

### 1️⃣ **Petição Atribuída** (`petition`)
- **Quando:** Petição atribuída ao redator
- **Trigger:** `trigger_notify_writer_new_petition`
- **Navega para:** `/writer/my-petitions?petition={id}`

### 2️⃣ **Correção Solicitada** (`correction`)
- **Quando:** Admin solicita correção
- **Trigger:** `trigger_notify_writer_correction`
- **Navega para:** `/writer/my-petitions?petition={id}&tab=corrections`

### 3️⃣ **Pagamento** (`payment`)
- **Quando:** Pagamento mensal processado
- **Trigger:** `trigger_notify_writer_payment`
- **Navega para:** `/writer/payments`

### 4️⃣ **Deadline Próximo** (`deadline`)
- **Quando:** 1 hora antes do prazo (17h)
- **Cron Job:** `check_deadline_notifications()` (a cada 5 min)
- **Hook React:** `useDeadlineAlert`
- **Navega para:** `/writer/my-petitions?petition={id}&deadline=warning`

### 5️⃣ **Nova Mensagem no Chat** (`chat`)
- **Quando:** Nova mensagem recebida
- **Trigger:** `trigger_notify_writer_new_message_chat`
- **Navega para:** `/writer/chat?conversation={id}`

### 6️⃣ **Lembrete de Nota Fiscal** (`invoice_reminder`)
- **Quando:** Dias 1-5 do mês (9h) se não enviou nota fiscal
- **Cron Job:** `check-invoice-reminders-daily` (diário às 9h)
- **Navega para:** `/writer/payments?tab=invoices`

### 7️⃣ **Petição Disponível** (`petition_available`)
- **Quando:** Nova petição com status `pending`
- **Trigger:** `trigger_notify_writer_petition_available`
- **Navega para:** `/writer/available?petition={id}`

---

## 🔧 Componentes Backend

### **Tabelas**
- `app_2d8133c678_notifications` - Armazena todas as notificações
- `writer_invoices` - Controla envio de notas fiscais

### **Functions**
- `create_notification()` - Cria nova notificação
- `mark_notification_as_read()` - Marca como lida
- `cleanup_old_notifications()` - Remove antigas (30+ dias)
- `check_deadline_notifications()` - Verifica prazos próximos
- `check_and_notify_invoice_reminder()` - Verifica notas fiscais

### **Triggers**
1. `trigger_notify_writer_new_petition` → ON `petitions` INSERT/UPDATE
2. `trigger_notify_writer_correction` → ON `corrections` INSERT
3. `trigger_notify_writer_payment` → ON `writer_monthly_payments` INSERT/UPDATE
4. `trigger_notify_writer_new_message_chat` → ON `messages` INSERT
5. `trigger_notify_writer_petition_available` → ON `petitions` INSERT/UPDATE (status='pending')

### **Cron Jobs**
1. `check-invoice-reminders-daily` → Diário às 9h
2. `check-deadline-notifications-5min` → A cada 5 minutos
3. `apply-late-penalties-hourly` → A cada hora (sistema de penalidades)

### **RLS Policies**
```sql
-- Leitura: apenas próprias notificações
CREATE POLICY "Users can view own notifications" 
ON app_2d8133c678_notifications
FOR SELECT 
USING (LOWER(TRIM(user_id)) = LOWER(TRIM(auth.uid()::TEXT)));

-- Atualização: apenas próprias notificações
CREATE POLICY "Users can update own notifications" 
ON app_2d8133c678_notifications
FOR UPDATE 
USING (LOWER(TRIM(user_id)) = LOWER(TRIM(auth.uid()::TEXT)))
WITH CHECK (LOWER(TRIM(user_id)) = LOWER(TRIM(auth.uid()::TEXT)));
```

---

## 🎨 Componentes Frontend

### **Contexto**
- `NotificationContext.tsx` - Gerencia estado global de notificações

### **Componentes**
- `NotificationItem.tsx` - Item individual de notificação
- `NotificationDropdown.tsx` - Dropdown no header (sino)
- `Notifications.tsx` - Página completa de notificações

### **Hooks**
- `useNotifications()` - Acessa contexto de notificações
- `useDeadlineAlert()` - Alerta de deadline próximo

### **Navegação Inteligente**
Ao clicar em uma notificação:
1. Marca como lida
2. Navega para página específica com query params
3. Página processa params e executa ação (abrir modal, scroll, etc.)

---

## 📂 Arquivos Importantes

### **SQL Scripts**
1. `setup_writer_notifications.sql` - Setup inicial (4 notificações básicas)
2. `add_chat_invoice_available_notifications.sql` - Adiciona 3 novas notificações ✅
3. `setup_deadline_notifications_cron.sql` - Cron job de deadline
4. `cleanup_test_notifications.sql` - Remove notificações de teste

### **Documentação**
1. `GUIA_NOTIFICACOES_REDATOR.md` - Guia completo atualizado
2. `NOTIFICACOES_COMPLETAS_RESUMO.md` - Resumo de todas as notificações
3. `SISTEMA_NOTIFICACOES_PRODUCAO.md` - Este arquivo

---

## 🚀 Como Usar em Produção

### **1. Executar Scripts SQL (ordem correta)**
```bash
# 1. Setup inicial
psql -f setup_writer_notifications.sql

# 2. Adicionar notificações de chat, invoice e petições disponíveis
psql -f add_chat_invoice_available_notifications.sql

# 3. Setup cron job de deadline
psql -f setup_deadline_notifications_cron.sql
```

### **2. Limpar Notificações de Teste**
```bash
psql -f cleanup_test_notifications.sql
```

### **3. Verificar Status**
```sql
-- Ver todas as notificações ativas
SELECT * FROM app_2d8133c678_notifications 
WHERE is_read = FALSE 
ORDER BY created_at DESC;

-- Ver triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%notify%';

-- Ver cron jobs
SELECT jobname, schedule, active 
FROM cron.job 
WHERE active = TRUE;
```

---

## 🔍 Troubleshooting

### **Notificações não aparecem?**
1. Verificar se o `user_id` está correto (case-insensitive)
2. Verificar RLS policies
3. Verificar se triggers estão ativos
4. Verificar logs do Supabase

### **Cron jobs não funcionam?**
1. Verificar se `pg_cron` está habilitado
2. Verificar se jobs estão `active = TRUE`
3. Verificar timezone do servidor
4. Testar function manualmente

### **Navegação não funciona?**
1. Verificar se `related_entity_type` e `related_entity_id` estão corretos
2. Verificar se páginas processam query params
3. Verificar console do navegador para erros

---

## 📊 Monitoramento

### **Queries Úteis**

```sql
-- Notificações por tipo (últimos 7 dias)
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = FALSE) as nao_lidas
FROM app_2d8133c678_notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY total DESC;

-- Notificações por usuário (top 10)
SELECT 
  user_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = FALSE) as nao_lidas
FROM app_2d8133c678_notifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total DESC
LIMIT 10;

-- Taxa de leitura
SELECT 
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_read = TRUE) / COUNT(*), 
    2
  ) as "Taxa de Leitura (%)"
FROM app_2d8133c678_notifications;
```

---

## ✅ Checklist de Produção

- [x] Triggers criados e ativos
- [x] Cron jobs agendados e funcionando
- [x] RLS policies configuradas
- [x] Frontend integrado
- [x] Navegação implementada
- [x] Testes removidos
- [x] Documentação completa

---

## 🎯 Próximos Passos (Futuro)

- [ ] Notificações push no navegador
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Dashboard de analytics de notificações
- [ ] Personalização de preferências de notificação

---

**🚀 Sistema 100% funcional e pronto para produção!**







