# 🔔 **GUIA COMPLETO: SISTEMA DE NOTIFICAÇÕES PARA ADMINS**

## 📋 **RESUMO**

O sistema de notificações para admins foi completamente implementado e irá notificar os administradores sobre:

✅ **Novo redator aguardando aprovação** (prioridade: alta)  
✅ **Revisão humana solicitada** (prioridade: alta)  
✅ **Petição em disputa** (prioridade: urgente)  
✅ **Petição sem redator há mais de 24h** (prioridade: alta)  
✅ **Petição necessita revisão** (prioridade: alta) 🆕  
✅ **Lembrete de pagamento de notas fiscais** (prioridade: alta) - Dia 05 de cada mês 🆕  

---

## 🚀 **PASSO A PASSO PARA ATIVAR**

### **1. Executar SQL de Setup**

Vá no **Supabase Dashboard** → **SQL Editor** e execute o seguinte arquivo:

```sql
-- Execute o arquivo: setup_admin_notifications.sql
```

Este arquivo irá:
- ✅ Criar função `notify_all_admins()` para notificar todos os admins
- ✅ Criar trigger para notificar quando novo redator se cadastra
- ✅ Criar trigger para notificar quando petição entra em disputa
- ✅ Criar função e cron job para verificar petições sem redator há mais de 24h
- ✅ Configurar permissões necessárias

**IMPORTANTE:** Para o cron job funcionar, você precisa:
1. Ir em **Database → Extensions**
2. Habilitar **pg_cron**

---

## 🔔 **TIPOS DE NOTIFICAÇÕES PARA ADMINS**

### **1. 👤 Novo Redator Aguardando Aprovação**
- **Quando:** Um redator se cadastra pela primeira vez
- **Trigger:** `trigger_notify_admins_new_writer` (INSERT em `profiles_v2`)
- **Prioridade:** `high` 🟡
- **Tipo:** `approval`
- **Navega para:** `/admin/writer-approval`

### **2. 🔄 Revisão Humana Solicitada**
- **Quando:** Cliente solicita revisão humana de uma petição
- **Código:** `MyPetitions.tsx` (função `handleRequestHumanReview`)
- **Prioridade:** `high` 🟡
- **Tipo:** `system`
- **Navega para:** `/admin/revisoes`

### **3. ⚠️ Petição em Disputa**
- **Quando:** Status de uma petição muda para `disputed`
- **Trigger:** `trigger_notify_admins_dispute` (UPDATE em `petitions`)
- **Prioridade:** `urgent` 🔴
- **Tipo:** `system`
- **Navega para:** `/admin/petitions?petition={id}`

### **4. ⏰ Petição sem Redator há mais de 24h**
- **Quando:** Petição sem redator atribuído há mais de 24 horas
- **Cron Job:** `check-unassigned-petitions` (a cada 6 horas)
- **Prioridade:** `high` 🟡
- **Tipo:** `system`
- **Navega para:** `/admin/petitions?petition={id}`

### **5. 📋 Petição Necessita Revisão** 🆕
- **Quando:** Status de uma petição muda para `pending_review` ou `review`
- **Trigger:** `trigger_notify_admins_review_needed` (UPDATE em `petitions`)
- **Prioridade:** `high` 🟡
- **Tipo:** `system`
- **Navega para:** `/admin/revisoes` ou `/admin/petitions?petition={id}`
- **Nota:** Evita notificações duplicadas (só notifica se não foi notificado nas últimas 2 horas)

### **6. 💰 Lembrete de Pagamento de Notas Fiscais** 🆕
- **Quando:** Dia 05 de cada mês às 9h
- **Cron Job:** `check-pending-invoices-payment` (dia 05 às 9h)
- **Prioridade:** `high` 🟡
- **Tipo:** `system`
- **Navega para:** `/admin/payments` ou página de pagamentos
- **Detalhes:** Lista todos os redatores que têm saldo disponível mas não enviaram nota fiscal do mês anterior

---

## 🔧 **COMPONENTES IMPLEMENTADOS**

### **Backend (SQL)**

#### **Funções:**
- `notify_all_admins()` - Notifica todos os admins ativos
- `notify_admins_new_writer()` - Notifica sobre novo redator
- `notify_admins_dispute()` - Notifica sobre disputa
- `check_unassigned_petitions()` - Verifica petições sem redator
- `notify_admins_review_needed()` - Notifica sobre necessidade de revisão 🆕
- `check_pending_invoices_for_payment()` - Verifica notas fiscais pendentes 🆕

#### **Triggers:**
1. `trigger_notify_admins_new_writer` → ON `profiles_v2` INSERT
2. `trigger_notify_admins_dispute` → ON `petitions` UPDATE (status = 'disputed')
3. `trigger_notify_admins_review_needed` → ON `petitions` UPDATE (status = 'pending_review' ou 'review') 🆕

#### **Cron Jobs:**
1. `check-unassigned-petitions` → A cada 6 horas
2. `check-pending-invoices-payment` → Dia 05 de cada mês às 9h 🆕

### **Frontend (TypeScript/React)**

#### **Arquivos Modificados:**
1. **`MyPetitions.tsx`**
   - Corrigido para usar tabela `app_2d8133c678_notifications`
   - Cria notificações para todos os admins quando cliente solicita revisão humana

2. **`WriterSettings.tsx`**
   - Adicionada criação de notificação no banco quando redator se cadastra
   - Mantém envio de email via `notifyAdmin()`

#### **Componentes:**
- `AdminHeader.tsx` - Exibe contador de notificações não lidas
- `NotificationContext.tsx` - Gerencia estado global de notificações
- `NotificationDropdown.tsx` - Dropdown no header (sino)

---

## 🧪 **TESTAR O SISTEMA**

### **Teste 1: Novo Redator**
1. Cadastre um novo redator em `/writer/settings`
2. Verifique se notificações foram criadas para todos os admins
3. Verifique se aparecem no header do admin (sino)

### **Teste 2: Revisão Humana**
1. Como cliente, solicite revisão humana de uma petição
2. Verifique se notificações foram criadas para todos os admins
3. Verifique se aparecem no header do admin

### **Teste 3: Disputa**
1. Como cliente ou admin, marque uma petição como disputada
2. Verifique se notificações foram criadas automaticamente
3. Verifique se aparecem no header do admin

### **Teste 4: Petição sem Redator**
1. Crie uma petição sem atribuir redator
2. Aguarde 24 horas (ou ajuste o cron job para testar)
3. Verifique se notificações foram criadas automaticamente

### **Teste 5: Petição Necessita Revisão** 🆕
1. Como cliente, solicite revisão humana de uma petição (status muda para `pending_review`)
2. Ou altere manualmente o status de uma petição para `review`
3. Verifique se notificações foram criadas automaticamente para todos os admins
4. Verifique se aparecem no header do admin

### **Teste 6: Lembrete de Pagamento de Notas Fiscais** 🆕
1. Certifique-se de que há redatores com saldo disponível mas sem nota fiscal do mês anterior
2. Execute manualmente a função: `SELECT check_pending_invoices_for_payment();`
3. Ou aguarde até o dia 05 do mês às 9h
4. Verifique se notificações foram criadas com lista de redatores pendentes

---

## 📊 **VERIFICAR NOTIFICAÇÕES NO BANCO**

Execute no Supabase SQL Editor:

```sql
-- Ver todas as notificações de admins
SELECT 
  n.id,
  n.title,
  n.body,
  n.type,
  n.priority,
  n.is_read,
  n.created_at,
  p.email as admin_email
FROM app_2d8133c678_notifications n
JOIN profiles_v2 p ON p.firebase_uid = n.user_id
WHERE p.role = 'admin'
ORDER BY n.created_at DESC
LIMIT 50;

-- Ver notificações não lidas de admins
SELECT 
  n.id,
  n.title,
  n.body,
  n.type,
  n.priority,
  n.created_at,
  p.email as admin_email
FROM app_2d8133c678_notifications n
JOIN profiles_v2 p ON p.firebase_uid = n.user_id
WHERE p.role = 'admin'
  AND n.is_read = false
ORDER BY n.created_at DESC;
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Função `notify_all_admins()` criada
- [x] Trigger para novo redator implementado
- [x] Trigger para disputa implementado
- [x] Função e cron job para petições sem redator implementados
- [x] Trigger para necessidade de revisão implementado 🆕
- [x] Função e cron job para lembrete de pagamento de notas fiscais implementados 🆕
- [x] `MyPetitions.tsx` corrigido para usar tabela correta
- [x] `WriterSettings.tsx` atualizado para criar notificações no banco
- [x] Permissões SQL configuradas
- [x] Documentação criada e atualizada

---

## 🎯 **PRÓXIMOS PASSOS (OPCIONAL)**

1. Adicionar notificações para outros eventos:
   - Pagamento pendente há muito tempo
   - Redator com muitas petições atrasadas
   - Sistema com problemas técnicos

2. Melhorar navegação:
   - Adicionar links diretos nas notificações
   - Criar páginas específicas para cada tipo de notificação

3. Adicionar filtros:
   - Filtrar notificações por tipo
   - Filtrar notificações por prioridade
   - Marcar como lida em lote

---

## 📝 **NOTAS IMPORTANTES**

1. **Tabela de Notificações:** Sempre use `app_2d8133c678_notifications` (não `notifications`)
2. **Campos Obrigatórios:** `user_id`, `title` (outros são opcionais)
3. **Tipos Permitidos:** `system`, `petition`, `payment`, `correction`, `deadline`, `chat`, `approval`
4. **Prioridades:** `low`, `normal`, `high`, `urgent`
5. **RLS:** Admins podem ver todas as notificações (policy "Admins can manage all notifications")

---

## 🐛 **TROUBLESHOOTING**

### **Notificações não aparecem:**
1. Verifique se o SQL foi executado corretamente
2. Verifique se o usuário é admin (`role = 'admin'` em `profiles_v2`)
3. Verifique se há notificações no banco (query acima)
4. Verifique console do navegador para erros

### **Triggers não funcionam:**
1. Verifique se os triggers foram criados: `SELECT * FROM pg_trigger WHERE tgname LIKE '%admin%';`
2. Verifique logs do Supabase para erros
3. Teste manualmente a função `notify_all_admins()`

### **Cron job não funciona:**
1. Verifique se `pg_cron` está habilitado
2. Verifique se o job foi criado: `SELECT * FROM cron.job WHERE jobname = 'check-unassigned-petitions';`
3. Verifique histórico: `SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-unassigned-petitions');`

---

**✅ Sistema de notificações para admins está completo e funcional!**

