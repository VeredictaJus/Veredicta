# ✅ RESCISÃO INDIRETA - IMPLEMENTADA

## ⚖️ **O QUE É RESCISÃO INDIRETA?**

**Rescisão Indireta** (Art. 483 CLT) é quando o **empregado** pede a rescisão do contrato porque o **empregador** cometeu falta grave.

É como se fosse uma "justa causa do empregador".

---

## 📚 **BASE LEGAL - Art. 483 CLT**

O empregado pode considerar rescindido o contrato e pleitear indenização quando:

```
Art. 483 CLT - Hipóteses de Rescisão Indireta:

a) Exigência de serviços superiores às forças
b) Tratamento com rigor excessivo
c) Correr perigo manifesto de mal considerável
d) Não cumprir obrigações do contrato
e) Praticar contra o empregado ato lesivo da honra
f) Ofender fisicamente (salvo legítima defesa)
g) Redução do trabalho por peça/tarefa (< 1/3 ganhos)
```

---

## 💰 **DIREITOS NA RESCISÃO INDIRETA:**

### **IGUAIS à Demissão sem Justa Causa:**

✅ **Aviso Prévio** - 30 dias + proporcional
✅ **Aviso Proporcional** - 3 dias/ano (máx 90 dias)
✅ **Saldo de Salário** - Dias trabalhados no mês
✅ **Férias Proporcionais** - Com 1/3
✅ **Férias Vencidas** - Se houver
✅ **13º Salário** - Proporcional
✅ **FGTS** - Saque do saldo
✅ **Multa FGTS 40%** - Sobre o saldo 💰
✅ **Seguro-Desemprego** - Tem direito

### **Diferença Principal:**

Na rescisão indireta:
- ⚖️ É o **empregado** que pede a rescisão
- ⚖️ Por **falta grave do empregador**
- ⚖️ Tem os **mesmos direitos** da demissão sem justa causa
- ⚖️ Geralmente requer **ação judicial** para reconhecimento

---

## 🎯 **IMPLEMENTAÇÃO NA CALCULADORA:**

### **1. Opção Adicionada:**

```typescript
// Interface (CalculatorSteps.tsx)
<SelectItem value="INDIRECT_TERMINATION">Rescisão Indireta</SelectItem>
```

### **2. Tipo Atualizado:**

```typescript
// Types (calculator.ts)
terminationType: 
  | 'DISMISSAL_WITHOUT_CAUSE'    // Demissão sem justa causa
  | 'DISMISSAL_WITH_CAUSE'       // Demissão por justa causa
  | 'RESIGNATION'                // Pedido de demissão
  | 'MUTUAL_AGREEMENT'           // Acordo mútuo
  | 'INDIRECT_TERMINATION';      // ✨ Rescisão indireta
```

### **3. Lógica de Cálculo:**

```typescript
// Rescisão indireta = mesmos direitos demissão sem justa causa
const hasNoticeRights = 
  terminationType === 'DISMISSAL_WITHOUT_CAUSE' || 
  terminationType === 'INDIRECT_TERMINATION';

const hasFgtsPenalty = 
  terminationType === 'DISMISSAL_WITHOUT_CAUSE' || 
  terminationType === 'INDIRECT_TERMINATION';
```

---

## 📊 **EXEMPLO DE CÁLCULO:**

### **Caso: Rescisão Indireta por Assédio Moral**

```
Trabalhador: Maria Santos
Admissão: 01/01/2020
Demissão: 31/12/2024 (5 anos)
Salário: R$ 3.000,00
Tipo: RESCISÃO INDIRETA
Motivo: Assédio moral (Art. 483, e)

CÁLCULO:

VERBAS RESCISÓRIAS:
✅ Aviso Prévio (30 dias):        R$ 3.000,00
✅ Aviso Proporcional (15 dias):  R$ 1.500,00
✅ Saldo Salário (31 dias):       R$ 3.100,00
✅ Férias (12/12 avos):           R$ 3.000,00
✅ 1/3 Férias:                    R$ 1.000,00
✅ 13º (12/12 avos):              R$ 3.000,00
✅ FGTS:                          R$ 20.000,00
✅ Multa FGTS 40%:                R$ 8.000,00
✅ Indenização Dano Moral:        R$ 15.000,00+

TOTAL: R$ 57.600,00+

⚖️ Base Legal: Art. 483 CLT
```

---

## 🆚 **COMPARAÇÃO: Tipos de Rescisão**

| Verba | Demissão s/ JC | Demissão c/ JC | Pedido Demissão | Acordo Mútuo | **Rescisão Indireta** |
|-------|---------------|----------------|-----------------|--------------|---------------------|
| Aviso Prévio | ✅ Sim | ❌ Não | ❌ Não | ⚠️ 50% | ✅ **SIM** |
| Aviso Proporcional | ✅ Sim | ❌ Não | ❌ Não | ❌ Não | ✅ **SIM** |
| Férias + 1/3 | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ **SIM** |
| 13º Proporcional | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ **SIM** |
| FGTS Saque | ✅ Sim | ❌ Não | ❌ Não | ⚠️ 80% | ✅ **SIM** |
| Multa FGTS 40% | ✅ Sim | ❌ Não | ❌ Não | ⚠️ 20% | ✅ **SIM** |
| Seguro-Desemprego | ✅ Sim | ❌ Não | ❌ Não | ❌ Não | ✅ **SIM** |

---

## 💡 **QUANDO USAR RESCISÃO INDIRETA:**

### **Situações Comuns:**

1. **Assédio Moral** (Art. 483, e)
   - Humilhações constantes
   - Xingamentos
   - Isolamento proposital
   
2. **Não Pagamento** (Art. 483, d)
   - Salários atrasados
   - FGTS não depositado
   - Benefícios não pagos

3. **Condições Insalubres** (Art. 483, c e d)
   - Falta de EPI
   - Ambiente perigoso
   - Sem condições de trabalho

4. **Redução Salarial** (Art. 483, g)
   - Redução > 1/3 dos ganhos
   - Sem acordo/convenção

5. **Assédio Sexual** (Art. 483, e)
   - Importunação sexual
   - Constrangimento

---

## ⚖️ **PROCEDIMENTO LEGAL:**

### **1. Empregado:**
- ✅ Documenta as faltas do empregador
- ✅ Pode continuar trabalhando durante processo
- ✅ Ou sair e entrar com ação

### **2. Ação Judicial:**
- ⚖️ Ajuíza reclamatória trabalhista
- ⚖️ Pede reconhecimento da rescisão indireta
- ⚖️ Prova a falta grave do empregador

### **3. Direitos:**
- 💰 Todas as verbas da demissão sem justa causa
- 💰 Multa FGTS 40%
- 💰 Seguro-desemprego
- 💰 Possível indenização por danos morais

---

## ✅ **IMPLEMENTAÇÃO NA CALCULADORA:**

### **5 Opções Disponíveis:**

1. **Demissão sem Justa Causa** - Empregador dispensa
2. **Demissão por Justa Causa** - Falta grave do empregado
3. **Pedido de Demissão** - Empregado pede saída
4. **Acordo Mútuo** - Ambos concordam (Lei 13.467/2017)
5. **Rescisão Indireta** ✨ - Falta grave do empregador

### **Cálculo Automático:**

Ao selecionar "Rescisão Indireta":
- ✅ Aviso prévio calculado
- ✅ Multa FGTS 40% aplicada
- ✅ Base legal citada (Art. 483 CLT)
- ✅ Memória mostra "Rescisão Indireta"

---

## 🎊 **RESULTADO:**

```
╔═══════════════════════════════════════════════╗
║                                               ║
║  ✅ RESCISÃO INDIRETA IMPLEMENTADA!           ║
║                                               ║
║  ⚖️  Tipo adicionado ao formulário           ║
║  💰 Verbas iguais à demissão s/ JC           ║
║  📚 Base legal: Art. 483 CLT                ║
║  🎯 Cálculo automático correto              ║
║                                               ║
║  Status: FUNCIONAL                           ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

**Desenvolvido para Veredicta | 2025**

**Calculadora Trabalhista Completa com Rescisão Indireta** ⚖️✨










