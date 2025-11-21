# 📖 Guia de Uso - Calculadora Trabalhista Completa

## 🎯 Como Usar a Calculadora

### **1. Importar os Serviços**

```typescript
import { LaborCalculator } from '@/lib/calculator/laborCalculations';
import { LaborCalculatorData } from '@/types/calculator';
import { CalculatorExportService } from '@/services/calculatorExportService';
```

---

### **2. Criar Dados do Cálculo**

```typescript
const calculatorData: LaborCalculatorData = {
  // === DADOS PESSOAIS ===
  employeeName: 'João Silva',
  cpf: '123.456.789-00',
  admissionDate: '2020-01-15',
  terminationDate: '2024-12-31',
  terminationType: 'DISMISSAL_WITHOUT_CAUSE',
  
  // === DADOS SALARIAIS ===
  baseSalary: 3500.00,
  
  // === ADICIONAIS ===
  additionals: {
    insalubrity: {
      percentage: 20,
      basis: 'MINIMUM_WAGE'
    },
    overtime: {
      weekdayHours: 20, // 20h/mês
      weekendHours: 0
    },
    nightShift: {
      percentage: 20,
      hours: 50 // 50h no período
    }
  },
  
  // === JORNADA ===
  workingHours: {
    dailyHours: 8,
    weeklyHours: 44,
    intervalTime: 60
  },
  
  // === VERBAS RESCISÓRIAS ===
  severance: {
    noticePeriod: 30,
    vacationDays: 12,
    thirteenthSalaryMonths: 12,
    fgtsBalance: 15000,
    lastSalaryDays: 15
  },
  
  // === INTERVALOS ===
  intervals: {
    lunchBreakViolations: 120, // 120 dias sem intervalo
    betweenShiftsViolations: 50 // 50 vezes
  },
  
  // === CORREÇÃO MONETÁRIA (OPCIONAL) ===
  monetaryCorrection: {
    applyCorrection: true,
    index: 'IPCA-E',
    calculationDate: '2024-12-31'
  },
  
  // === JUROS (OPCIONAL) ===
  interest: {
    applyInterest: true,
    rate: 1, // 1% ao mês
    type: 'SIMPLE',
    startDate: '2023-01-01' // Data da citação
  },
  
  // === HONORÁRIOS (OPCIONAL) ===
  honorarios: {
    calculateHonorarios: true,
    percentage: 10, // 10% (entre 5% e 15%)
    freeJustice: false
  }
};
```

---

### **3. Executar o Cálculo**

#### **Opção A: Cálculo Simples (Síncrono)**
```typescript
const calculator = new LaborCalculator(calculatorData);
const result = calculator.calculate();

console.log('Total:', result.grandTotal);
console.log('Memória:', result.calculationMemory);
```

#### **Opção B: Cálculo Completo (Assíncrono com Correção)**
```typescript
const calculator = new LaborCalculator(calculatorData);
const result = await calculator.calculateComplete();

console.log('Total Atualizado:', result.grandTotal);
console.log('Correção aplicada:', result.monetaryCorrectionResults);
console.log('Juros aplicados:', result.interestResults);
```

---

### **4. Exportar Resultados**

#### **Exportar para TXT**
```typescript
CalculatorExportService.exportText(result);
// Gera: calculo_Joao_Silva_2024-12-31.txt
```

#### **Exportar para CSV (Excel)**
```typescript
CalculatorExportService.exportCSV(result);
// Gera: calculo_Joao_Silva_2024-12-31.csv
// Pode ser aberto no Excel, LibreOffice, Google Sheets
```

#### **Exportar para HTML (PDF via impressão)**
```typescript
CalculatorExportService.exportHTML(result);
// Gera: calculo_Joao_Silva_2024-12-31.html
// Abrir no navegador e imprimir como PDF
```

---

## 📊 EXEMPLOS DE CASOS REAIS

### **Exemplo 1: Caso Simples de Rescisão**

```typescript
const data: LaborCalculatorData = {
  employeeName: 'Maria Santos',
  cpf: '987.654.321-00',
  admissionDate: '2022-06-01',
  terminationDate: '2024-12-15',
  terminationType: 'DISMISSAL_WITHOUT_CAUSE',
  baseSalary: 2500,
  additionals: {},
  workingHours: {
    dailyHours: 8,
    weeklyHours: 44,
    intervalTime: 60
  },
  severance: {
    noticePeriod: 30,
    vacationDays: 8,
    thirteenthSalaryMonths: 12,
    fgtsBalance: 7500,
    lastSalaryDays: 15
  },
  intervals: {
    lunchBreakViolations: 0,
    betweenShiftsViolations: 0
  }
};

const calculator = new LaborCalculator(data);
const result = calculator.calculate();

// Resultado esperado: ~R$ 15.000,00 (rescisão básica)
```

---

### **Exemplo 2: Caso com Horas Extras e Adicionais**

```typescript
const data: LaborCalculatorData = {
  employeeName: 'Pedro Oliveira',
  cpf: '111.222.333-44',
  admissionDate: '2019-01-10',
  terminationDate: '2024-10-30',
  terminationType: 'DISMISSAL_WITHOUT_CAUSE',
  baseSalary: 4000,
  additionals: {
    insalubrity: {
      percentage: 40,
      basis: 'MINIMUM_WAGE'
    },
    overtime: {
      weekdayHours: 30, // média 30h/mês
      weekendHours: 8    // média 8h/mês
    },
    nightShift: {
      percentage: 20,
      hours: 200 // total no período
    }
  },
  workingHours: {
    dailyHours: 8,
    weeklyHours: 44,
    intervalTime: 60
  },
  severance: {
    noticePeriod: 30,
    vacationDays: 12,
    thirteenthSalaryMonths: 12,
    fgtsBalance: 25000,
    lastSalaryDays: 20
  },
  intervals: {
    lunchBreakViolations: 180,
    betweenShiftsViolations: 60
  },
  monetaryCorrection: {
    applyCorrection: true,
    index: 'IPCA-E',
    calculationDate: '2024-12-31'
  },
  interest: {
    applyInterest: true,
    rate: 1,
    type: 'SIMPLE',
    startDate: '2023-05-15'
  }
};

const calculator = new LaborCalculator(data);
const result = await calculator.calculateComplete();

// Resultado esperado: ~R$ 90.000,00 - R$ 120.000,00
```

---

### **Exemplo 3: Caso com Estabilidade da Gestante**

```typescript
const data: LaborCalculatorData = {
  employeeName: 'Ana Paula Souza',
  cpf: '555.666.777-88',
  admissionDate: '2021-03-01',
  terminationDate: '2024-07-15',
  terminationType: 'DISMISSAL_WITHOUT_CAUSE',
  baseSalary: 3200,
  additionals: {},
  workingHours: {
    dailyHours: 8,
    weeklyHours: 44,
    intervalTime: 60
  },
  severance: {
    noticePeriod: 30,
    vacationDays: 10,
    thirteenthSalaryMonths: 7,
    fgtsBalance: 12000,
    lastSalaryDays: 15
  },
  intervals: {
    lunchBreakViolations: 0,
    betweenShiftsViolations: 0
  },
  stability: {
    pregnancy: {
      hasStability: true,
      pregnancyConfirmDate: '2024-05-01',
      childbirthDate: '2024-12-20'
    }
  },
  monetaryCorrection: {
    applyCorrection: true,
    index: 'IPCA-E',
    calculationDate: '2024-12-31'
  }
};

const calculator = new LaborCalculator(data);
const result = await calculator.calculateComplete();

// Resultado esperado: ~R$ 35.000,00 - R$ 45.000,00
// Inclui 5 meses de salários (estabilidade)
```

---

### **Exemplo 4: Equiparação Salarial**

```typescript
const data: LaborCalculatorData = {
  employeeName: 'Carlos Ferreira',
  cpf: '999.888.777-66',
  admissionDate: '2020-08-01',
  terminationDate: '2024-11-30',
  terminationType: 'DISMISSAL_WITHOUT_CAUSE',
  baseSalary: 3000,
  additionals: {},
  workingHours: {
    dailyHours: 8,
    weeklyHours: 44,
    intervalTime: 60
  },
  severance: {
    noticePeriod: 30,
    vacationDays: 11,
    thirteenthSalaryMonths: 11,
    fgtsBalance: 18000,
    lastSalaryDays: 10
  },
  intervals: {
    lunchBreakViolations: 0,
    betweenShiftsViolations: 0
  },
  salaryEqualization: {
    hasEqualization: true,
    paradigmName: 'José Silva (paradigma)',
    paradigmSalary: 5000,
    equalizationPeriodMonths: 48 // 4 anos
  },
  monetaryCorrection: {
    applyCorrection: true,
    index: 'IPCA-E',
    calculationDate: '2024-12-31'
  },
  interest: {
    applyInterest: true,
    rate: 1,
    type: 'SIMPLE',
    startDate: '2023-01-01'
  },
  honorarios: {
    calculateHonorarios: true,
    percentage: 15, // 15% (alto valor da causa)
    freeJustice: false
  }
};

const calculator = new LaborCalculator(data);
const result = await calculator.calculateComplete();

// Resultado esperado: ~R$ 180.000,00 - R$ 250.000,00
// Diferença salarial: R$ 2.000/mês × 48 meses = R$ 96.000 + reflexos
```

---

## 🎨 INTEGRAÇÃO COM INTERFACE (React)

### **Componente Exemplo:**

```typescript
import React, { useState } from 'react';
import { LaborCalculator } from '@/lib/calculator/laborCalculations';
import { CalculatorExportService } from '@/services/calculatorExportService';

export default function LaborCalculatorPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleCalculate = async (formData) => {
    setLoading(true);
    try {
      const calculator = new LaborCalculator(formData);
      const calculationResult = await calculator.calculateComplete();
      setResult(calculationResult);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao calcular. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = (format) => {
    if (!result) return;
    
    switch (format) {
      case 'txt':
        CalculatorExportService.exportText(result);
        break;
      case 'csv':
        CalculatorExportService.exportCSV(result);
        break;
      case 'html':
        CalculatorExportService.exportHTML(result);
        break;
    }
  };
  
  return (
    <div>
      <h1>Calculadora Trabalhista</h1>
      
      {/* Formulário aqui */}
      
      {result && (
        <div>
          <h2>Resultado</h2>
          <p>Total: R$ {result.grandTotal.toFixed(2)}</p>
          
          <div>
            <button onClick={() => handleExport('txt')}>Exportar TXT</button>
            <button onClick={() => handleExport('csv')}>Exportar Excel</button>
            <button onClick={() => handleExport('html')}>Exportar PDF</button>
          </div>
          
          <pre>{result.calculationMemory.join('\n')}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ CHECKLIST DE USO

Antes de fazer um cálculo, certifique-se de ter:

- [ ] Nome do reclamante
- [ ] CPF
- [ ] Data de admissão
- [ ] Data de demissão (se aplicável)
- [ ] Tipo de rescisão
- [ ] Salário base
- [ ] Informações sobre adicionais (se houver)
- [ ] Jornada de trabalho
- [ ] Dados de verbas rescisórias
- [ ] Violações de intervalos (se houver)
- [ ] Informações sobre estabilidades (se houver)
- [ ] Data para aplicação de correção monetária
- [ ] Data inicial para juros (geralmente citação)

---

## 🎯 DICAS IMPORTANTES

### **1. Correção Monetária**
- Use IPCA-E para débitos após 25/03/2015 (padrão TST)
- Use TR para débitos anteriores a 25/03/2015
- A API do Bacen pode demorar alguns segundos

### **2. Juros de Mora**
- Padrão trabalhista: 1% ao mês, juros simples
- Data inicial: geralmente data da citação
- Data final: data do cálculo

### **3. Honorários**
- CLT Art. 791-A: 5% a 15%
- Casos simples: 5-8%
- Casos complexos: 10-15%
- Se justiça gratuita: suspensão por 2 anos

### **4. Prescrição**
- 2 anos após fim do contrato
- 5 anos retroativos ao ajuizamento
- Verificar avisos no resultado

---

## 📞 SUPORTE

Para dúvidas sobre a calculadora:
- Documentação completa: `CALCULADORA_TRABALHISTA_COMPLETA.md`
- Exemplos de código nos comentários dos arquivos
- Base legal completa implementada

---

**Calculadora Trabalhista Veredicta | Versão 1.0 | 2024**










