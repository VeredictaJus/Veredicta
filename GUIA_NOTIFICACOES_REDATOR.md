# 🔔 **GUIA COMPLETO: SISTEMA DE NOTIFICAÇÕES PARA REDATORES**

## 📋 **RESUMO**

O sistema de notificações foi completamente implementado e irá notificar os redatores sobre:

✅ **Nova petição atribuída** (prioridade: alta)  
✅ **Correção solicitada pelo admin** (prioridade: urgente)  
✅ **Pagamento registrado** (prioridade: normal)  
✅ **Deadline próximo - 1h antes** (prioridade: urgente)  
✅ **Nova mensagem no chat** (prioridade: normal) ✨ NOVO  
✅ **Lembrete de nota fiscal** - Dias 1-5 do mês (prioridade: alta) ✨ NOVO  
✅ **Petições disponíveis** (prioridade: normal) ✨ NOVO  

---

## 🚀 **PASSO A PASSO PARA ATIVAR**

### **1. Executar SQL de Setup**

Vá no **Supabase Dashboard** → **SQL Editor** e execute os seguintes arquivos **NA ORDEM**:

#### **a) Setup Principal (OBRIGATÓRIO)**
```sql
-- Execute o arquivo: setup_writer_notifications.sql
```

Este arquivo irá:
- ✅ Criar tabela `app_2d8133c678_notifications`
- ✅ Configurar RLS (Row Level Security)
- ✅ Criar triggers automáticos para:
  - Nova petição atribuída
  - Correção solicitada
  - Pagamento registrado
- ✅ Criar funções auxiliares

#### **b) Setup de Deadline (OPCIONAL - mas recomendado)**
```sql
-- Execute o arquivo: setup_deadline_notifications_cron.sql
```

Este arquivo irá:
- ✅ Criar função para verificar deadlines próximos
- ✅ Agendar job automático (requer pg_cron)

#### **c) Notificações Adicionais: Chat, Nota Fiscal e Petições (OBRIGATÓRIO)**
```sql
-- Execute o arquivo: add_chat_invoice_available_notifications.sql
```

Este arquivo irá:
- ✅ Criar trigger para notificações de chat
- ✅ Criar job de lembrete de nota fiscal (dias 1-5)
- ✅ Criar trigger para petições disponíveis
- ✅ Criar tabela writer_invoices
- ✅ Adicionar novos tipos de notificação

**IMPORTANTE:** Para os jobs automáticos funcionarem, você precisa:
1. Ir em **Database → Extensions**
2. Habilitar **pg_cron**

---

### **2. Testar o Sistema**

#### **Teste 1: Inserir Notificação Manual**

Execute no SQL Editor (substitua `SEU_USER_UID` pelo UID real do redator):

```sql
SELECT create_notification(
  p_user_id := 'SEU_USER_UID',
  p_title := '🎉 Teste de Notificação',
  p_body := 'Se você está vendo isso no sino, o sistema está funcionando!',
  p_type := 'system',
  p_priority := 'high'
);
```

#### **Teste 2: Verificar no Dashboard**

1. Faça login como **redator**
2. Olhe para o **sino de notificações** no header
3. Deve aparecer um badge vermelho com o número de notificações não lidas
4. Clique no sino para ver a notificação de teste

#### **Teste 3: Atribuir Petição**

1. Faça login como **admin**
2. Vá em **Revisões** ou **Petições**
3. Atribua uma petição a um redator
4. **Resultado esperado:** Redator recebe notificação automática

#### **Teste 4: Solicitar Correção**

1. Como **admin**, solicite uma correção em uma petição
2. **Resultado esperado:** Redator recebe notificação urgente

---

## 📊 **VERIFICAR SE ESTÁ FUNCIONANDO**

### **Ver Notificações Criadas**

```sql
SELECT 
  id,
  user_id,
  title,
  body,
  type,
  priority,
  is_read,
  created_at
FROM app_2d8133c678_notifications
ORDER BY created_at DESC
LIMIT 10;
```

### **Ver Notificações Não Lidas por Usuário**

```sql
SELECT 
  COUNT(*) as unread_count,
  type,
  priority
FROM app_2d8133c678_notifications
WHERE user_id = 'SEU_USER_UID'
AND is_read = FALSE
GROUP BY type, priority
ORDER BY priority DESC;
```

### **Verificar Triggers Ativos**

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%'
ORDER BY event_object_table, trigger_name;
```

### **Verificar Job de Deadline (se pg_cron estiver habilitado)**

```sql
SELECT 
  jobid,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'check-deadline-notifications-5min';
```

---

## 🎯 **COMO FUNCIONA**

### **Notificações Automáticas (Triggers)**

| Evento | Quando acontece | Tipo | Prioridade |
|--------|----------------|------|------------|
| **Petição Atribuída** | Admin atribui petição ao redator | `petition` | `high` |
| **Correção Solicitada** | Admin pede correção | `correction` | `urgent` |
| **Pagamento Registrado** | Pagamento mensal cadastrado | `payment` | `normal` |
| **Nova Mensagem Chat** | Alguém envia mensagem | `chat` | `normal` |
| **Lembrete Nota Fiscal** | Dias 1-5 (se não enviou) | `invoice_reminder` | `high` |
| **Petições Disponíveis** | Nova petição fica disponível | `petition_available` | `normal` |

### **Notificações de Deadline**

- **Frontend Hook:** `useDeadlineAlert` verifica a cada 5 minutos
- **Backend Job:** Cron job verifica a cada 5 minutos (backup)
- **Janela:** 55-65 minutos antes do deadline (1h ± 5min)
- **Evita duplicatas:** Verifica se já existe notificação nas últimas 2h

---

## 🔧 **FUNÇÕES DISPONÍVEIS**

### **Criar Notificação Manual**

```sql
SELECT create_notification(
  p_user_id := 'writer_uid',
  p_title := 'Título',
  p_body := 'Mensagem',
  p_type := 'system',
  p_priority := 'normal',
  p_related_entity_type := 'petition',
  p_related_entity_id := 'petition_uuid'
);
```

### **Marcar como Lida**

```sql
SELECT mark_notification_as_read('notification_uuid');
```

### **Marcar Todas como Lidas**

```sql
SELECT mark_all_notifications_as_read('user_uid');
```

### **Limpar Notificações Antigas (90+ dias)**

```sql
SELECT cleanup_old_notifications();
```

---

## 🎨 **INTERFACE DO USUÁRIO**

### **Sino de Notificações**

- Localização: **Header do Dashboard (canto superior direito)**
- Badge: Mostra número de notificações não lidas
- Dropdown: Clique para ver lista de notificações
- Real-time: Atualiza automaticamente com WebSocket
- Som: Toca notificação sonora quando recebe nova

### **Tipos de Notificação (com ícones)**

- 📋 **Petição** (`petition`) - Nova petição atribuída
- 🔄 **Correção** (`correction`) - Correção solicitada
- 💰 **Pagamento** (`payment`) - Pagamento registrado
- ⏰ **Deadline** (`deadline`) - Prazo próximo (1h)
- 💬 **Chat** (`chat`) - Nova mensagem ✨ NOVO
- 📄 **Nota Fiscal** (`invoice_reminder`) - Lembrete dias 1-5 ✨ NOVO
- 📢 **Disponível** (`petition_available`) - Petições disponíveis ✨ NOVO
- ⭐ **Aprovação** (`approval`) - Petição aprovada (futuro)
- 🛠️ **Sistema** (`system`) - Notificação do sistema

### **Prioridades (com cores)**

- 🟢 **Baixa** (low) - Verde
- 🔵 **Normal** (normal) - Azul
- 🟡 **Alta** (high) - Amarelo
- 🔴 **Urgente** (urgent) - Vermelho

---

## ⚠️ **TROUBLESHOOTING**

### **Notificações não aparecem?**

1. **Verificar se a tabela existe:**
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'app_2d8133c678_notifications'
   ) as table_exists;
   ```

2. **Verificar RLS:**
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'app_2d8133c678_notifications';
   ```

3. **Verificar se há notificações no banco:**
   ```sql
   SELECT COUNT(*) FROM app_2d8133c678_notifications;
   ```

4. **Verificar console do navegador:**
   - Abra DevTools (F12)
   - Veja se há erros relacionados a notificações

### **Job de deadline não funciona?**

1. **Verificar se pg_cron está habilitado:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **Ver histórico de execuções:**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-deadline-notifications-5min')
   ORDER BY start_time DESC LIMIT 5;
   ```

3. **Executar manualmente:**
   ```sql
   SELECT * FROM check_and_notify_deadlines();
   ```

---

## 📝 **PRÓXIMOS PASSOS**

Após executar o setup, você pode:

1. ✅ **Testar** cada tipo de notificação
2. ✅ **Personalizar** mensagens editando as funções SQL
3. ✅ **Adicionar** novos tipos de notificação conforme necessário
4. ✅ **Monitorar** o desempenho e ajustar intervalos se necessário

---

## 💡 **DICAS**

- **Performance:** Índices foram criados para garantir consultas rápidas
- **Limpeza:** Execute `cleanup_old_notifications()` periodicamente
- **Backup:** O job de deadline funciona mesmo se o usuário estiver offline
- **Real-time:** WebSocket garante que notificações apareçam instantaneamente

---

**🎉 PRONTO! SISTEMA DE NOTIFICAÇÕES TOTALMENTE FUNCIONAL!**

