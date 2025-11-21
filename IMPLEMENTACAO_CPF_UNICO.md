# 🔒 VALIDAÇÃO DE CPF/CNPJ ÚNICO PARA PLANO FREE

## 📋 Resumo da Implementação

Sistema implementado para garantir que o plano Free seja usado apenas **uma vez por CPF ou CNPJ**, evitando abusos e garantindo que cada pessoa física ou jurídica tenha acesso limitado ao plano gratuito.

## 🗄️ Banco de Dados

### **1. Executar Script SQL**
```bash
# Execute o script no Supabase SQL Editor
psql -f free_plan_document_control.sql
```

### **2. Tabela Criada: `free_plan_document_control`**
- **id**: UUID único
- **document**: CPF ou CNPJ formatado - ÚNICO
- **document_type**: Tipo do documento (CPF ou CNPJ)
- **user_id**: Referência ao usuário
- **used_at**: Data/hora do uso
- **created_at**: Data de criação

### **3. Funções Criadas:**
- `check_free_plan_document_usage(document_input TEXT)` - Verifica se documento já foi usado
- `register_free_plan_document_usage(document_input TEXT, document_type_input VARCHAR(4), user_id_input UUID)` - Registra uso

## 🔧 Serviços Implementados

### **FreePlanDocumentService**
- ✅ Validação de formato de CPF e CNPJ
- ✅ Verificação de uso único
- ✅ Registro de uso
- ✅ Estatísticas para admins (separadas por tipo)

## 🎨 Interface Atualizada

### **1. Cartão do Plano Free**
- ✅ Adicionado aviso: "⚠️ Uma vez por CPF ou CNPJ"
- ✅ Cor laranja para destacar limitação

### **2. Componente de Validação**
- ✅ `DocumentValidation.tsx` - Validação em tempo real
- ✅ Máscara automática de CPF e CNPJ
- ✅ Feedback visual (sucesso/erro)
- ✅ Integração com processo de registro

## 🚀 Como Usar

### **1. No Processo de Registro:**
```tsx
import DocumentValidation from '@/components/Auth/DocumentValidation';

<DocumentValidation 
  onValidationComplete={(isValid, document, documentType) => {
    if (isValid) {
      // Prosseguir com registro do plano Free
      console.log(`${documentType}: ${document}`);
    }
  }}
/>
```

### **2. Validação Programática:**
```tsx
import { FreePlanDocumentService } from '@/services/freePlanDocumentService';

const result = await FreePlanDocumentService.validateDocumentForFreePlan('123.456.789-00');
if (result.canUseFreePlan) {
  // Documento pode usar o plano Free
  console.log(`Tipo: ${result.documentType}`);
}
```

### **3. Registrar Uso:**
```tsx
const success = await FreePlanDocumentService.registerFreePlanUsage(document, userId);
if (success) {
  // Uso registrado com sucesso
}
```

## 🔒 Segurança

### **RLS Policies Implementadas:**
- ✅ Usuários só podem ver seus próprios registros
- ✅ Usuários só podem inserir seus próprios registros
- ✅ Admins podem ver todos os registros
- ✅ Validação de CPF e CNPJ no servidor

## 📊 Monitoramento

### **Estatísticas para Admins:**
```tsx
const stats = await FreePlanDocumentService.getFreePlanStats();
console.log(`Total de usuários Free: ${stats.totalUsers}`);
console.log(`CPFs: ${stats.cpfCount}`);
console.log(`CNPJs: ${stats.cnpjCount}`);
```

## ⚠️ Importante

1. **Execute o script SQL** no Supabase antes de usar
2. **Integre o componente DocumentValidation** no processo de registro
3. **Teste a validação** com CPFs e CNPJs válidos e inválidos
4. **Monitore o uso** através das estatísticas

## 🎯 Resultado Final

- ✅ **Plano Free limitado a 1 uso por CPF ou CNPJ**
- ✅ **Interface clara sobre a limitação**
- ✅ **Validação robusta e segura para ambos os tipos**
- ✅ **Sistema de monitoramento separado por tipo**
- ✅ **Prevenção de abusos**

---

**Sistema implementado com sucesso! O plano Free agora é limitado a uma única utilização por CPF ou CNPJ.** 🔒
