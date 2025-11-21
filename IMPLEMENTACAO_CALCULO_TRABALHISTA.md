# ✅ Implementação: Campo de Cálculo Trabalhista

## 🎯 Resumo da Implementação

Foi adicionado um campo para indicar se uma petição requer **cálculo trabalhista** (verbas rescisórias, horas extras, diferenças salariais, FGTS, etc.) no sistema de criação de petições.

---

## 📋 O Que Foi Implementado

### **1. Banco de Dados** ✅
- **Arquivo**: `add_calculo_trabalhista_column.sql`
- **Coluna adicionada**: `requires_labor_calculation` (BOOLEAN)
- **Valor padrão**: `false`
- **Índice criado**: Para consultas rápidas

### **2. Frontend (NewPetition.tsx)** ✅
- **Import adicionado**: `Switch` do Shadcn/ui
- **Estado atualizado**: `formData.requiresLaborCalculation`
- **Dado enviado**: `petitionData.requires_labor_calculation`
- **UI adicionada**: Switch com feedback visual

---

## 🚀 Como Usar

### **PASSO 1: Execute o SQL no Supabase**

1. Abra o **Supabase SQL Editor**
2. Execute o arquivo: `add_calculo_trabalhista_column.sql`
3. Verifique que a coluna foi criada com sucesso

**Verificação:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'app_2d8133c678_petitions' 
  AND column_name = 'requires_labor_calculation';
```

### **PASSO 2: Recarregue a Aplicação**

1. Abra a aplicação no navegador
2. Pressione **F5** para recarregar
3. Vá para **"Nova Petição"**

### **PASSO 3: Teste o Novo Campo**

1. Preencha os campos básicos da petição
2. Procure o campo **"Requer Cálculo Trabalhista?"**
3. Ative o **Switch** (ON)
4. ✅ Veja a mensagem informativa aparecer
5. Submeta a petição
6. Verifique no banco que `requires_labor_calculation = true`

---

## 🎨 Interface Visual

### **Switch Desligado (OFF)**
```
┌─────────────────────────────────────────────────┐
│ Requer Cálculo Trabalhista?           [ OFF ]  │
│ Marque se a petição necessita de cálculos...    │
└─────────────────────────────────────────────────┘
```

### **Switch Ligado (ON)**
```
┌─────────────────────────────────────────────────┐
│ Requer Cálculo Trabalhista?           [  ON  ] │
│ Marque se a petição necessita de cálculos...    │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ℹ️ Cálculo trabalhista solicitado          │ │
│ │ O redator incluirá os cálculos trabalhistas│ │
│ │ detalhados na petição, com planilhas e     │ │
│ │ memória de cálculo quando necessário.      │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco

### **Coluna Adicionada**

| Nome | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `requires_labor_calculation` | `BOOLEAN` | `false` | Indica se requer cálculo trabalhista |

### **Exemplos de Consulta**

**Listar petições que requerem cálculo:**
```sql
SELECT id, title, type, requires_labor_calculation, created_at
FROM app_2d8133c678_petitions
WHERE requires_labor_calculation = true
ORDER BY created_at DESC;
```

**Estatísticas:**
```sql
SELECT 
  requires_labor_calculation,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM app_2d8133c678_petitions
GROUP BY requires_labor_calculation;
```

---

## 🔧 Arquivos Modificados

### **1. SQL**
- ✅ `add_calculo_trabalhista_column.sql` (NOVO)

### **2. Frontend**
- ✅ `src/pages/client/NewPetition.tsx` (MODIFICADO)
  - Import do `Switch` adicionado
  - Estado `requiresLaborCalculation` adicionado
  - Campo `requires_labor_calculation` enviado ao banco
  - UI do Switch adicionada

---

## 📊 Fluxo de Dados

```
┌─────────────────┐
│   Cliente       │
│  (Frontend)     │
└────────┬────────┘
         │
         │ 1. Preenche formulário
         │    + Marca Switch (ON/OFF)
         │
         ↓
┌─────────────────┐
│   NewPetition   │
│    formData     │
│ requiresLabor.. │
└────────┬────────┘
         │
         │ 2. handleSubmit()
         │    petitionData.requires_labor_calculation
         │
         ↓
┌─────────────────┐
│ DatabaseService │
│ createPetition()│
└────────┬────────┘
         │
         │ 3. INSERT INTO petitions
         │    requires_labor_calculation = true/false
         │
         ↓
┌─────────────────┐
│    Supabase     │
│   PostgreSQL    │
└─────────────────┘
```

---

## ✅ Checklist de Implementação

- ✅ Coluna adicionada no banco de dados
- ✅ Índice criado para performance
- ✅ Estado do frontend atualizado
- ✅ Dados enviados corretamente ao banco
- ✅ UI do Switch implementada
- ✅ Feedback visual quando ativado
- ✅ Dark mode compatível
- ✅ Sem erros de linter
- ✅ Documentação criada

---

## 🎯 Próximos Passos (Futuro)

### **Para Redatores:**
- [ ] Mostrar ícone/badge nas petições que requerem cálculo
- [ ] Filtrar petições por necessidade de cálculo
- [ ] Adicionar campo para anexar planilha de cálculo

### **Para Admins:**
- [ ] Relatório de petições com cálculo trabalhista
- [ ] Estatísticas de demanda por cálculos

### **Para Sistema:**
- [ ] Notificar redator sobre necessidade de cálculo
- [ ] Integração com ferramentas de cálculo trabalhista

---

## 🧪 Testes Sugeridos

### **Teste 1: Criar Petição COM Cálculo**
1. Login como cliente
2. Nova Petição → Preencher campos
3. Ativar Switch "Requer Cálculo Trabalhista"
4. ✅ Ver mensagem azul aparecer
5. Submeter petição
6. ✅ Verificar no banco: `requires_labor_calculation = true`

### **Teste 2: Criar Petição SEM Cálculo**
1. Login como cliente
2. Nova Petição → Preencher campos
3. Deixar Switch desligado
4. Submeter petição
5. ✅ Verificar no banco: `requires_labor_calculation = false`

### **Teste 3: Verificar no Painel do Redator**
1. Login como redator
2. Ver petição criada
3. ✅ (Futuro) Ver indicador de cálculo trabalhista

---

## 📝 Notas Técnicas

- **Componente Switch**: Shadcn/ui nativo
- **Estado React**: Gerenciado via `useState`
- **Validação**: Não obrigatório (campo opcional)
- **Performance**: Índice criado para consultas rápidas
- **Compatibilidade**: Dark mode suportado

---

**✅ Implementação Completa e Pronta para Uso!** 🎉










