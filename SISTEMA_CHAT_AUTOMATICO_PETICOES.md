# 🤖 SISTEMA DE CHAT AUTOMÁTICO PARA PETIÇÕES

## ✅ **FUNCIONALIDADE IMPLEMENTADA:**

### **Chat Automático Baseado no Ciclo de Vida das Petições:**
- ✅ **Criação automática** de conversas quando redator aceita petição
- ✅ **Fechamento automático** quando cliente aprova petição
- ✅ **Integração não invasiva** com sistema de chat existente
- ✅ **Monitoramento de status** das petições em tempo real

## 🔄 **FLUXO AUTOMÁTICO:**

### **1. Redator Aceita Petição:**
```
Status: 'pending' → 'in_progress'
↓
✅ Sistema cria conversa automaticamente
   • Participantes: Redator + Cliente/Advogado
   • Tipo: 'petition'
   • Título: "Petição: [título]"
```

### **2. Cliente Aprova Petição:**
```
Status: 'in_progress' → 'completed'
↓
✅ Sistema fecha conversa automaticamente
   • Status: 'active' → 'closed'
   • Conversa sai das abas ativas
```

### **3. Admin:**
```
✅ Acesso total a todas as conversas
✅ Pode ver conversas de petições em andamento
✅ Pode participar de qualquer conversa
```

## 📁 **ARQUIVOS CRIADOS:**

### **1. Serviço Principal:**
- **`src/services/petitionChatService.ts`** - Lógica principal do sistema
- **`src/hooks/usePetitionChat.ts`** - Hook para facilitar integração

### **2. Componentes de Integração:**
- **`src/components/integrations/PetitionChatIntegration.tsx`** - Componente de monitoramento
- **`src/examples/PetitionReviewWithChatIntegration.tsx`** - Exemplo de integração

## 🔧 **COMO USAR:**

### **1. Integração Simples (Recomendada):**

```typescript
import { usePetitionChat } from '@/hooks/usePetitionChat';

function MeuComponenteDePeticao() {
  const { handlePetitionStatusChange } = usePetitionChat();

  const handleAprovar = (petitionId: string) => {
    // Sua lógica de aprovação existente
    updatePetitionStatus(petitionId, 'completed');
    
    // NOVA LINHA: Fechar conversa automaticamente
    handlePetitionStatusChange(petitionId, 'completed', 'in_progress');
  };

  const handleRedatorAceitar = (petitionId: string) => {
    // Sua lógica de aceitação existente
    updatePetitionStatus(petitionId, 'in_progress');
    
    // NOVA LINHA: Criar conversa automaticamente
    handlePetitionStatusChange(petitionId, 'in_progress', 'pending');
  };
}
```

### **2. Integração com PetitionReview:**

```typescript
// No seu PetitionReview.tsx existente
import { usePetitionChat } from '@/hooks/usePetitionChat';

export default function PetitionReview() {
  const { handlePetitionStatusChange } = usePetitionChat();
  
  const handleApprove = (petitionId: string, comments?: string) => {
    // Sua lógica existente
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'approved' } : p
    ));
    toast.success('Petição aprovada!');
    
    // NOVA LINHA: Fechar conversa
    handlePetitionStatusChange(petitionId, 'completed', 'in_progress');
  };
}
```

## 🎯 **FUNCIONALIDADES:**

### **✅ Criação Automática de Conversas:**
- Detecta quando `status` muda para `'in_progress'`
- Cria conversa entre redator e cliente automaticamente
- Associa conversa com a petição para rastreamento

### **✅ Fechamento Automático:**
- Detecta quando `status` muda para `'completed'`
- Fecha conversa automaticamente
- Remove da lista de conversas ativas

### **✅ Sistema Não Invasivo:**
- **NÃO modifica** o sistema de chat existente
- **NÃO interfere** com conversas manuais
- **NÃO afeta** funcionalidades atuais
- Funciona **paralelamente** ao sistema atual

### **✅ Monitoramento Inteligente:**
- Verifica se conversa já existe antes de criar
- Evita duplicação de conversas
- Sincroniza conversas existentes se necessário

## 🔍 **LOGS E DEBUGGING:**

### **Console Logs:**
```
🔄 [PetitionChat] Criando conversa para petição: [ID]
✅ [PetitionChat] Conversa criada: [ID]
🔄 [PetitionChat] Fechando conversa para petição: [ID]
✅ [PetitionChat] Conversa fechada: [ID]
```

### **Função de Sincronização:**
```typescript
import { PetitionChatService } from '@/services/petitionChatService';

// Verificar conversas existentes
await PetitionChatService.syncExistingPetitions();
```

## 🚀 **BENEFÍCIOS:**

### **Para Redatores:**
- **Comunicação direta** com cliente durante desenvolvimento
- **Feedback imediato** sobre a petição
- **Histórico completo** da conversa

### **Para Clientes/Advogados:**
- **Acompanhamento em tempo real** do progresso
- **Clarificação de dúvidas** durante desenvolvimento
- **Aprovação final** fecha conversa automaticamente

### **Para Admins:**
- **Visibilidade total** de todas as conversas
- **Monitoramento** do fluxo de trabalho
- **Estatísticas** de produtividade

## ⚠️ **IMPORTANTE:**

### **Este sistema:**
- ✅ **Funciona independentemente** do chat atual
- ✅ **Não modifica** funcionalidades existentes
- ✅ **Adiciona apenas** funcionalidade automática
- ✅ **Pode ser desabilitado** a qualquer momento

### **Para ativar:**
1. Importe o hook `usePetitionChat`
2. Chame `handlePetitionStatusChange` nas suas funções de status
3. Sistema funcionará automaticamente

### **Para desativar:**
- Simplesmente remova as chamadas do hook
- Sistema de chat original continua funcionando normalmente

## 🎉 **SISTEMA PRONTO PARA USO!**

A funcionalidade está **100% implementada** e **pronta para integração** com seu sistema existente!
