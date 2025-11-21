# 🚫 SISTEMA DE SUSPENSÃO POR REINCIDÊNCIA

## 📋 **VISÃO GERAL**

Sistema progressivo de suspensão e bloqueio de redatores baseado em número de atrasos acumulados.

---

## ⚖️ **REGRAS DE SUSPENSÃO**

| Atrasos | Ação | Duração | Reversível? |
|---------|------|---------|-------------|
| **3** | Suspensão | 30 dias corridos | Automático (após prazo) |
| **6** | Suspensão | 60 dias corridos | Automático (após prazo) |
| **9+** | **Bloqueio Permanente** | Indefinido | **Apenas via Suporte** |

---

## 🔄 **FLUXO COMPLETO**

```
1️⃣ Redator atrasa entrega
    ↓
2️⃣ Sistema aplica multa de 50%
    ↓
3️⃣ Petição reatribuída (volta para pending)
    ↓
4️⃣ Contador de atrasos incrementado
    ↓
5️⃣ Sistema verifica total de atrasos
    ↓
6️⃣ Aplica suspensão se atingir limite:
    • 3 atrasos = 30 dias
    • 6 atrasos = 60 dias  
    • 9 atrasos = BLOQUEIO PERMANENTE
    ↓
7️⃣ Redator recebe alerta visual no dashboard
```

---

## 📁 **ARQUIVOS CRIADOS/ATUALIZADOS**

### 1. **create_suspension_system.sql**
   - ✅ Adiciona colunas à tabela `profiles_v2`:
     - `suspended_until` (TIMESTAMP)
     - `is_blocked` (BOOLEAN)
     - `suspension_reason` (TEXT)
     - `total_late_deliveries` (INTEGER)
   
   - ✅ Funções SQL:
     - `is_writer_suspended(writer_uid)` - Verifica se está suspenso
     - `apply_writer_suspension(writer_uid)` - Aplica suspensão progressiva
     - `admin_unblock_writer(writer_uid, note)` - Desbloquear (admin)
     - `admin_reset_penalties_count(writer_uid, note)` - Resetar contador (admin)
   
   - ✅ View:
     - `writer_suspension_status` - Status de todos os redatores

### 2. **SuspensionAlert.tsx**
   - ✅ Componente React para alertas visuais
   - ✅ Mostra diferentes alertas baseados no status:
     - 🚫 Bloqueado permanentemente
     - ⏸️ Suspenso temporariamente
     - ⚠️ Aviso de risco (2 atrasos)
     - 🚨 Alerta crítico (5 ou 8 atrasos)

### 3. **WriterDashboard.tsx**
   - ✅ Integrado `SuspensionAlert` no topo do dashboard

### 4. **ManualRedator.tsx**
   - ✅ Seção "Suspensão por Reincidência" adicionada
   - ✅ Explicação completa das regras

### 5. **apply_late_penalty** (Função SQL atualizada)
   - ✅ Chama `apply_writer_suspension()` automaticamente
   - ✅ Aplica suspensão imediatamente após multa

---

## 🚀 **PASSOS PARA ATIVAR**

### **Passo 1: Executar SQL de Suspensão**

1. Abra: `create_suspension_system.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute (Run)

**✅ Isso criará:**
- Novas colunas em `profiles_v2`
- Funções de suspensão
- View de status

---

### **Passo 2: Executar SQL de Atualização**

1. Abra: `update_penalty_reassign_petition.sql`
2. Copie todo o conteúdo
3. Execute no Supabase

**✅ Isso atualizará:**
- Função `apply_late_penalty` com lógica de suspensão

---

### **Passo 3: Verificar no Frontend**

1. Acesse o dashboard como redator
2. O componente `SuspensionAlert` deve aparecer se houver suspensão
3. Teste criando penalidades manualmente (ver abaixo)

---

## 🧪 **TESTES**

### **1. Ver status de todos os redatores:**
```sql
SELECT * FROM writer_suspension_status;
```

### **2. Simular atrasos para teste:**
```sql
-- Inserir penalidades de teste
INSERT INTO writer_penalties (writer_id, petition_id, penalty_type, amount, percentage, reason)
VALUES 
  ('WRITER_UID_AQUI', gen_random_uuid(), 'late_delivery', 30.00, 50, 'Teste 1'),
  ('WRITER_UID_AQUI', gen_random_uuid(), 'late_delivery', 30.00, 50, 'Teste 2'),
  ('WRITER_UID_AQUI', gen_random_uuid(), 'late_delivery', 30.00, 50, 'Teste 3');

-- Aplicar suspensão
SELECT apply_writer_suspension('WRITER_UID_AQUI');
```

### **3. Verificar se redator está suspenso:**
```sql
SELECT is_writer_suspended('WRITER_UID_AQUI');
```

### **4. Admin: Desbloquear redator:**
```sql
SELECT admin_unblock_writer('WRITER_UID_AQUI', 'Teste de desbloqueio - conta revisada');
```

### **5. Admin: Resetar contador:**
```sql
SELECT admin_reset_penalties_count('WRITER_UID_AQUI', 'Segunda chance após revisão');
```

---

## 📊 **QUERIES DE MONITORAMENTO**

### **Redatores suspensos/bloqueados:**
```sql
SELECT 
  full_name,
  email,
  total_atrasos,
  bloqueado_permanente,
  suspenso_ate,
  status_atual,
  dias_restantes
FROM writer_suspension_status
WHERE status_atual IN ('🚫 BLOQUEADO', '⏸️ SUSPENSO')
ORDER BY total_atrasos DESC;
```

### **Histórico de suspensões:**
```sql
SELECT 
  firebase_uid,
  full_name,
  total_late_deliveries,
  suspension_reason,
  suspended_until
FROM profiles_v2
WHERE role = 'writer' 
  AND (suspended_until IS NOT NULL OR is_blocked = TRUE)
ORDER BY total_late_deliveries DESC;
```

### **Redatores em risco (2, 5 ou 8 atrasos):**
```sql
SELECT 
  firebase_uid,
  full_name,
  email,
  total_late_deliveries,
  CASE 
    WHEN total_late_deliveries = 2 THEN '⚠️ Próximo = 30 dias suspensão'
    WHEN total_late_deliveries = 5 THEN '🚨 Próximo = 60 dias suspensão'
    WHEN total_late_deliveries = 8 THEN '🛑 Próximo = BLOQUEIO PERMANENTE'
  END as alerta
FROM profiles_v2
WHERE role = 'writer' 
  AND total_late_deliveries IN (2, 5, 8)
ORDER BY total_late_deliveries DESC;
```

---

## 🎨 **ALERTAS VISUAIS NO DASHBOARD**

### **1. Bloqueado Permanentemente (9+ atrasos):**
- 🚫 Alerta vermelho destacado
- Mensagem: conta bloqueada, entrar em contato com suporte
- Botão para enviar email ao suporte

### **2. Suspenso Temporariamente (3 ou 6 atrasos):**
- ⏸️ Alerta laranja
- Contador de dias restantes
- Data de retorno
- Restrições durante suspensão

### **3. Aviso de Risco (2 atrasos):**
- ⚠️ Alerta amarelo
- Aviso que próximo atraso = suspensão de 30 dias
- Dicas para evitar atrasos

### **4. Alerta Crítico (5 ou 8 atrasos):**
- 🚨 Alerta vermelho
- Aviso do que acontecerá no próximo atraso
- Penalidade futura destacada

---

## ⚙️ **ADMINISTRAÇÃO**

### **Dashboard Admin (Futuro):**

Criar página admin para gerenciar suspensões:

1. **Listar redatores suspensos/bloqueados**
2. **Desbloquear manualmente** (com justificativa)
3. **Resetar contador de atrasos** (casos excepcionais)
4. **Ver histórico de suspensões**
5. **Estatísticas de suspensões**

### **Funções Admin Disponíveis:**

```sql
-- Desbloquear redator
SELECT admin_unblock_writer('WRITER_UID', 'Motivo do desbloqueio');

-- Resetar contador
SELECT admin_reset_penalties_count('WRITER_UID', 'Motivo do reset');
```

---

## 🔐 **SEGURANÇA E VALIDAÇÕES**

### **No Backend (SQL):**
- ✅ Suspensões aplicadas automaticamente
- ✅ Contador incrementado após cada atraso
- ✅ Funções admin disponíveis via SQL
- ⚠️ TODO: RLS para permitir apenas admins executarem funções admin

### **No Frontend:**
- ✅ Alerta visual no dashboard
- ⚠️ TODO: Bloquear botão "Aceitar Petição" se suspenso
- ⚠️ TODO: Redirecionar para página de suspensão se bloqueado
- ⚠️ TODO: Impedir ações durante suspensão

---

## 📱 **PRÓXIMOS PASSOS (Sugeridos)**

### **1. Página de Suspensão Dedicada:**
- Criar `SuspensionPage.tsx`
- Redirecionar automaticamente se bloqueado
- Informações detalhadas sobre a suspensão

### **2. Notificações:**
- Email ao redator quando suspenso
- Email ao admin sobre novos bloqueios
- Notificação 3 dias antes do fim da suspensão

### **3. Dashboard Admin:**
- Página para gerenciar suspensões
- Gráficos de atrasos e suspensões
- Histórico completo

### **4. Bloqueio de Ações no Frontend:**
```typescript
// Exemplo: Bloquear aceitação de petições
const handleAcceptPetition = async () => {
  // Verificar se está suspenso
  const { data: profile } = await supabase
    .from('profiles_v2')
    .select('is_blocked, suspended_until')
    .eq('firebase_uid', user.uid)
    .single();
  
  if (profile?.is_blocked) {
    toast.error('Você está bloqueado. Entre em contato com o suporte.');
    return;
  }
  
  if (profile?.suspended_until && new Date() < new Date(profile.suspended_until)) {
    toast.error('Você está suspenso e não pode aceitar petições.');
    return;
  }
  
  // Continuar com aceitação...
};
```

---

## 📞 **SUPORTE**

### **Para Redatores Bloqueados:**
- Email: suporte@veredictajus.com
- Assunto: "Desbloqueio de Conta - [SEU NOME]"
- Incluir: Justificativa e contexto dos atrasos

### **Para Admins:**
- Acessar view: `writer_suspension_status`
- Executar funções admin quando necessário
- Documentar motivos de desbloqueios

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Criar tabelas e colunas
- [x] Criar funções SQL
- [x] Criar componente de alerta
- [x] Integrar no dashboard
- [x] Atualizar manual do redator
- [ ] Executar SQL no Supabase
- [ ] Testar sistema completo
- [ ] Bloquear ações no frontend
- [ ] Criar dashboard admin
- [ ] Implementar notificações

---

**Data de criação:** Novembro 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Deploy







