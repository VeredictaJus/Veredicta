# ⭐ SISTEMA DE SUSPENSÃO POR BAIXA AVALIAÇÃO

## 📋 **VISÃO GERAL**

Redatores com média de avaliação abaixo de 3.8 estrelas (com mínimo de 3 avaliações) são automaticamente suspensos.

---

## ⚖️ **REGRAS**

| Critério | Limite | Ação |
|----------|--------|------|
| **Média de Avaliação** | < 3.8 ⭐ | Suspensão automática |
| **Mínimo de Avaliações** | 3 avaliações | Para ser válido |
| **Reabilitação** | Manual | Apenas via Suporte |

---

## 🔄 **FLUXO AUTOMÁTICO**

```
Cliente avalia petição
    ↓
Trigger dispara cálculo
    ↓
Sistema calcula nova média do redator
    ↓
Atualiza profiles_v2:
  • average_rating
  • total_ratings
    ↓
Se média < 3.8 E tem 3+ avaliações:
    ↓
🚫 Suspensão automática aplicada:
  • suspension_type = 'low_rating'
  • suspended_until = +365 dias
  • suspension_reason = mensagem
    ↓
Redator vê alerta vermelho no dashboard
    ↓
Sidebar bloqueada (exceto Chat e Suporte)
    ↓
Admin vê status "Suspenso" na aba Usuários
```

---

## 📁 **ARQUIVOS CRIADOS/ATUALIZADOS**

### **1. create_rating_suspension_system.sql**
- ✅ Colunas em `profiles_v2`:
  - `average_rating` DECIMAL(3,2)
  - `total_ratings` INTEGER
  - `suspension_type` TEXT
- ✅ Funções:
  - `calculate_writer_average_rating(writer_uid)`
  - `apply_low_rating_suspension(writer_uid, avg)`
  - `update_writer_rating_and_check_suspension(writer_uid)`
  - `admin_reactivate_low_rated_writer(writer_uid, note)`
- ✅ Trigger:
  - `after_rating_insert_or_update` - Verifica após cada avaliação
- ✅ View:
  - `writer_rating_status` - Status completo dos redatores

### **2. SuspensionAlert.tsx**
- ✅ Alerta vermelho para suspensão por baixa avaliação
- ✅ Mostra média atual vs mínimo (3.8)
- ✅ Total de avaliações
- ✅ Botão para contatar suporte
- ✅ Alerta amarelo quando está entre 3.8-4.0 (aviso preventivo)

### **3. Users.tsx (Admin)**
- ✅ Mostra média de avaliação de todos os redatores
- ✅ Badge colorido por classificação:
  - 🟢 Verde: >= 4.0 (Bom/Excelente)
  - 🟡 Amarelo: 3.8-4.0 (Aceitável)
  - 🔴 Vermelho: < 3.8 (Abaixo do mínimo)
  - ⚪ Cinza: Sem avaliações
- ✅ Botão "Reativar Redator" para admin
- ✅ Informações detalhadas no modal de edição

### **4. ManualRedator.tsx**
- ✅ Seção "Sistema de Avaliação" atualizada
- ✅ Explicação completa sobre requisitos
- ✅ Processo de reabilitação
- ✅ Dicas para manter boa avaliação

---

## 🚀 **PARA ATIVAR**

### **Execute no Supabase:**

```sql
-- Abra o arquivo: create_rating_suspension_system.sql
-- Copie TODO o conteúdo
-- Execute no SQL Editor do Supabase
```

**O SQL irá:**
1. Adicionar colunas em `profiles_v2`
2. Criar funções de cálculo e suspensão
3. Criar trigger automático
4. Atualizar médias de todos os redatores existentes
5. Criar view de status

---

## 🧪 **TESTAR**

### **1. Ver status de todos os redatores:**
```sql
SELECT * FROM writer_rating_status;
```

### **2. Simular avaliação baixa:**
```sql
-- Inserir 3 avaliações baixas para teste
INSERT INTO app_2d8133c678_writer_ratings (writer_id, client_id, petition_id, rating, comment)
VALUES 
  ('WRITER_UID'::UUID, 'CLIENT_UID'::UUID, gen_random_uuid(), 2, 'Teste avaliação baixa 1'),
  ('WRITER_UID'::UUID, 'CLIENT_UID'::UUID, gen_random_uuid(), 3, 'Teste avaliação baixa 2'),
  ('WRITER_UID'::UUID, 'CLIENT_UID'::UUID, gen_random_uuid(), 2, 'Teste avaliação baixa 3');

-- Verificar se foi suspenso
SELECT * FROM writer_rating_status WHERE firebase_uid = 'WRITER_UID';
```

### **3. Admin reativar:**
```sql
SELECT admin_reactivate_low_rated_writer('WRITER_UID', 'Redator comprometeu-se a melhorar');
```

### **4. Limpar teste:**
```sql
-- Remover avaliações de teste
DELETE FROM app_2d8133c678_writer_ratings 
WHERE comment LIKE 'Teste%';

-- Recalcular média
SELECT update_writer_rating_and_check_suspension('WRITER_UID');
```

---

## 📊 **DASHBOARD ADMIN**

### **Na aba "Usuários":**

Ao clicar em ✏️ Editar um redator, o admin vê:

#### **Card de Avaliações (sempre visível):**
- Média atual (grandes, destaque)
- Total de avaliações
- Classificação:
  - ⭐ Excelente (>= 4.5)
  - 👍 Bom (>= 4.0)
  - ✔️ Aceitável (>= 3.8)
  - ⚠️ Abaixo do mínimo (< 3.8)
- Badge colorido

#### **Se suspenso por baixa avaliação:**
- 🚫 Banner vermelho destacado
- Média atual vs mínimo (3.8)
- Motivo da suspensão
- **Botão:** ✅ Reativar Redator
  - Admin digita motivo da reativação
  - Sistema registra ação
  - Redator volta a ter acesso

---

## 🎯 **CLASSIFICAÇÃO DE REDATORES**

| Média | Classificação | Status | Badge |
|-------|---------------|--------|-------|
| **>= 4.5** | ⭐ Excelente | Ativo | 🟢 Verde |
| **>= 4.0** | 👍 Bom | Ativo | 🟢 Verde |
| **>= 3.8** | ✔️ Aceitável | Ativo (alerta) | 🟡 Amarelo |
| **< 3.8** | ⚠️ Abaixo do mínimo | **Suspenso** | 🔴 Vermelho |
| **Sem avaliações** | 📝 Novo | Ativo | ⚪ Cinza |

---

## 💡 **AVISOS PREVENTIVOS**

### **Avaliação entre 3.8 - 4.0:**
- ⚠️ Alerta amarelo no dashboard do redator
- "Atenção: Avaliação Próxima ao Limite"
- Comparação visual (média atual vs mínimo)
- Dicas de como melhorar

---

## 🔐 **PERMISSÕES DURANTE SUSPENSÃO**

### **Redator Suspenso por Baixa Avaliação:**
- ❌ Aceitar novas petições
- ❌ Calculadora
- ❌ Cálculos Salvos
- ❌ Pagamentos (apenas visualizar)
- ✅ **Chat / Suporte** (para solicitar reabilitação)
- ✅ **Configurações**
- ⚠️ Dashboard (apenas visualização + alerta)

---

## 📞 **PROCESSO DE REABILITAÇÃO**

### **Para o Redator:**
1. Vê alerta vermelho no dashboard
2. Clica em "Contatar Suporte"
3. Explica situação e solicita revisão
4. Aguarda análise do suporte
5. Compromete-se com melhorias

### **Para o Admin/Suporte:**
1. Recebe contato do redator
2. Analisa histórico e situação
3. Avalia se merece segunda chance
4. No painel de usuários:
   - Clica em ✏️ Editar
   - Vê informações de suspensão
   - Clica em "✅ Reativar Redator"
   - Digite motivo da reativação
5. Sistema registra ação e reativa conta

---

## 📊 **QUERIES ÚTEIS**

### **Redatores com baixa avaliação:**
```sql
SELECT 
  full_name,
  email,
  average_rating,
  total_ratings,
  status_completo,
  classificacao_avaliacao
FROM writer_rating_status
WHERE average_rating < 3.8 AND total_ratings >= 3
ORDER BY average_rating ASC;
```

### **Redatores suspensos por avaliação:**
```sql
SELECT 
  full_name,
  email,
  average_rating,
  total_ratings,
  suspension_reason
FROM writer_rating_status
WHERE status_completo = '⚠️ SUSPENSO (BAIXA AVALIAÇÃO)'
ORDER BY average_rating ASC;
```

### **Top redatores por avaliação:**
```sql
SELECT 
  full_name,
  email,
  average_rating,
  total_ratings,
  classificacao_avaliacao
FROM writer_rating_status
WHERE average_rating IS NOT NULL
ORDER BY average_rating DESC
LIMIT 10;
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Criar SQL de suspensão por avaliação
- [x] Adicionar colunas em profiles_v2
- [x] Criar funções de cálculo e suspensão
- [x] Criar trigger automático
- [x] Criar view de status
- [x] Atualizar SuspensionAlert com alerta de baixa avaliação
- [x] Adicionar aviso preventivo (3.8-4.0)
- [x] Atualizar página Usuários do admin
- [x] Adicionar botão de reativação
- [x] Atualizar Manual do Redator
- [ ] Executar SQL no Supabase
- [ ] Testar com avaliação real
- [ ] Testar reativação pelo admin
- [ ] Validar alertas no frontend

---

## 🎯 **RESUMO**

**O sistema agora suspende redatores por:**
1. **Atrasos** (3/6/9 atrasos → 30/60 dias / bloqueio)
2. **Baixa Avaliação** (< 3.8 ⭐ → suspensão até suporte)

**Admin pode:**
- Ver média de todos os redatores
- Identificar suspensos por avaliação
- Reativar manualmente com justificativa

**Redator vê:**
- Média e total de avaliações no perfil
- Alerta preventivo quando próximo ao limite
- Alerta de suspensão se cair abaixo de 3.8

---

**Data de criação:** Novembro 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Deploy







