# 🧪 **TESTE: MODAL DE ALERTA DE DEADLINE**

## 📋 **COMO VERIFICAR SE O MODAL ESTÁ APARECENDO**

### **1️⃣ Verificar no Console do Navegador**

1. Abra o **Console do Navegador** (F12 → Console)
2. Faça login como **redator**
3. Vá para o **Dashboard do Redator**
4. Procure por logs que começam com:
   - `🔍 [DEADLINE ALERT]` - Verificação de deadlines
   - `📋 [DEADLINE ALERT]` - Petições encontradas
   - `⏰ [DEADLINE ALERT]` - Alerta detectado
   - `✅ [DEADLINE ALERT]` - Alertas encontrados
   - `🔔 [DEADLINE MODAL]` - Modal aparecendo
   - `🔕 [DEADLINE MODAL]` - Nenhum alerta

### **2️⃣ Condições para o Modal Aparecer**

O modal aparece quando:
- ✅ Redator tem petições em andamento (`in_progress` ou `assigned`)
- ✅ Petição tem deadline definido
- ✅ Faltam entre **55-65 minutos** para o deadline (1h antes das 18h = às 17h)
- ✅ Modal ainda não foi exibido para esta petição (evita duplicatas)

### **3️⃣ Teste Manual (Simular Deadline Próximo)**

**Opção A: Criar Petição com Deadline Próximo**

1. No Supabase SQL Editor, execute:
```sql
-- Criar petição de teste com deadline em 1 hora
INSERT INTO petitions (
  id,
  title,
  description,
  client_id,
  status,
  assigned_writer_id,
  created_at,
  deadline,
  price,
  type,
  priority
)
VALUES (
  gen_random_uuid(),
  'TESTE - Modal Deadline',
  'Petição de teste para verificar modal de alerta',
  'SEU_CLIENT_ID', -- Substitua
  'in_progress',
  'SEU_WRITER_ID', -- Substitua pelo seu ID de redator
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '60 minutes', -- Deadline em 1 hora (deve aparecer alerta)
  100.00,
  'Inicial',
  'normal'
)
RETURNING id, title, deadline;
```

2. Faça login como redator no dashboard
3. O modal deve aparecer automaticamente

**Opção B: Ajustar Deadline de Petição Existente**

```sql
-- Ajustar deadline de petição existente para 1 hora no futuro
UPDATE petitions
SET deadline = NOW() + INTERVAL '60 minutes'
WHERE assigned_writer_id = 'SEU_WRITER_ID'
  AND status IN ('in_progress', 'assigned')
  AND id = 'ID_DA_PETICAO'; -- Substitua pelo ID real
```

### **4️⃣ Verificar no Código**

O hook `useDeadlineAlert` verifica a cada **5 minutos**. Para testar imediatamente:

1. Abra o Console do Navegador
2. Execute no console:
```javascript
// Forçar verificação imediata (se o hook expor a função)
// Ou recarregue a página para forçar a verificação inicial
```

### **5️⃣ Verificar Notificações no Banco**

O hook também cria notificações no banco. Verifique:

```sql
-- Verificar notificações de deadline criadas
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.body,
  n.created_at AT TIME ZONE 'America/Sao_Paulo' as criado_em,
  n.related_entity_id as petition_id,
  p.title as petition_title,
  p.deadline AT TIME ZONE 'America/Sao_Paulo' as deadline
FROM app_2d8133c678_notifications n
LEFT JOIN petitions p ON n.related_entity_id = p.id::TEXT
WHERE n.type = 'deadline'
  AND n.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY n.created_at DESC;
```

### **6️⃣ Debug no Frontend**

Adicione este código temporário no `WriterDashboard.tsx` para ver o estado:

```typescript
// Adicionar após a linha 107
console.log('🔍 [DASHBOARD] Deadline alerts:', deadlineAlerts);
console.log('🔍 [DASHBOARD] Número de alertas:', deadlineAlerts.length);
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] Console mostra logs de verificação de deadlines
- [ ] Console mostra quando alertas são detectados
- [ ] Modal aparece quando há petição com deadline em 1h
- [ ] Modal mostra informações corretas (título, deadline, minutos restantes)
- [ ] Modal mostra texto correto: "prazo oficial até 18h, tolerância até 19h"
- [ ] Notificações são criadas no banco de dados
- [ ] Modal pode ser fechado ao clicar em "Entendi"

---

## 🚨 **TROUBLESHOOTING**

### **Modal não aparece:**
1. Verifique no console se há erros
2. Verifique se há petições em andamento com deadline
3. Verifique se o deadline está próximo (55-65 minutos)
4. Verifique se o redator está logado corretamente
5. Verifique se o componente `DeadlineAlertModal` está sendo renderizado

### **Modal aparece mas com informações erradas:**
1. Verifique se o deadline está sendo calculado corretamente (18h)
2. Verifique se os minutos restantes estão corretos
3. Verifique se o título da petição está sendo exibido

### **Modal aparece múltiplas vezes:**
1. Verifique se o `hasShownAlert` está funcionando
2. Verifique se o modal está sendo fechado corretamente

---

**Data de criação:** Janeiro 2025  
**Versão:** 1.0




