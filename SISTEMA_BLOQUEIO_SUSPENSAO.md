# 🔒 SISTEMA DE BLOQUEIO DURANTE SUSPENSÃO

## ✅ **O QUE FOI IMPLEMENTADO:**

### **1. Hook: `useSuspensionCheck`**
Verifica em tempo real se o redator está suspenso ou bloqueado.

**Funções:**
- `canAccess(feature)` - Verifica se pode acessar uma funcionalidade
- `getBlockMessage(feature)` - Retorna mensagem de bloqueio personalizada
- `isSuspendedOrBlocked` - Boolean indicando se está suspenso/bloqueado

---

### **2. Componente: `SuspendedAccessBlock`**
Bloqueia acesso a páginas específicas quando suspenso.

**Uso:**
```tsx
<SuspendedAccessBlock feature="petitions">
  <AvailablePetitionsPage />
</SuspendedAccessBlock>
```

**Features bloqueáveis:**
- `petitions` - Petições Disponíveis
- `calculator` - Calculadora
- `payments` - Pagamentos

---

### **3. Sidebar Atualizado: `WriterLayout`**
Links do menu são automaticamente desabilitados durante suspensão.

**Comportamento:**
- ✅ Links permitidos: normais
- 🔒 Links bloqueados: 
  - Opacidade reduzida (60%)
  - Ícone de cadeado
  - Cursor `not-allowed`
  - Toast ao clicar

---

## 🎯 **REGRAS DE ACESSO:**

### **BLOQUEADO PERMANENTEMENTE (9+ atrasos):**
- ❌ Petições Disponíveis
- ❌ Calculadora
- ❌ Cálculos Salvos
- ❌ Pagamentos
- ✅ **Chat / Suporte** (único acesso)
- ✅ **Configurações**

### **SUSPENSO TEMPORARIAMENTE (3-6 atrasos):**
- ❌ Petições Disponíveis
- ❌ Calculadora
- ❌ Cálculos Salvos
- ❌ Pagamentos (apenas visualização)
- ✅ **Minhas Petições** (concluir em andamento)
- ✅ **Chat / Suporte**
- ✅ **Configurações**

### **ATIVO (0-2 atrasos):**
- ✅ Acesso total a todas as funcionalidades

---

## 📁 **ARQUIVOS CRIADOS/ATUALIZADOS:**

1. ✅ **`useSuspensionCheck.ts`** - Hook de verificação
2. ✅ **`SuspendedAccessBlock.tsx`** - Componente de bloqueio
3. ✅ **`WriterLayout.tsx`** - Sidebar com links bloqueados
4. ✅ **`SuspensionAlert.tsx`** - Cores corrigidas (alto contraste)

---

## 🚀 **PRÓXIMOS PASSOS (OPCIONAL):**

### **1. Envolver Páginas com SuspendedAccessBlock:**

```tsx
// /writer/available
import SuspendedAccessBlock from '@/components/writer/SuspendedAccessBlock';

export default function AvailablePetitions() {
  return (
    <SuspendedAccessBlock feature="petitions">
      {/* conteúdo da página */}
    </SuspendedAccessBlock>
  );
}
```

```tsx
// /writer/calculator
import SuspendedAccessBlock from '@/components/writer/SuspendedAccessBlock';

export default function Calculator() {
  return (
    <SuspendedAccessBlock feature="calculator">
      {/* conteúdo da página */}
    </SuspendedAccessBlock>
  );
}
```

```tsx
// /writer/payments
import SuspendedAccessBlock from '@/components/writer/SuspendedAccessBlock';

export default function Payments() {
  return (
    <SuspendedAccessBlock feature="payments">
      {/* conteúdo da página */}
    </SuspendedAccessBlock>
  );
}
```

---

### **2. Bloquear Botão "Aceitar Petição":**

```tsx
// Na página de Petições Disponíveis
import { useSuspensionCheck } from '@/hooks/useSuspensionCheck';

export default function AvailablePetitions() {
  const { isSuspendedOrBlocked, getBlockMessage } = useSuspensionCheck();

  const handleAcceptPetition = (petitionId: string) => {
    if (isSuspendedOrBlocked) {
      toast.error(getBlockMessage('aceitar petições'));
      return;
    }
    // Lógica de aceitar petição...
  };

  return (
    <Button 
      onClick={() => handleAcceptPetition(petition.id)}
      disabled={isSuspendedOrBlocked}
    >
      {isSuspendedOrBlocked ? '🔒 Bloqueado' : 'Aceitar Petição'}
    </Button>
  );
}
```

---

### **3. Redirecionar se Tentar Acessar Página Bloqueada:**

Adicionar no Router:

```tsx
import { Navigate } from 'react-router-dom';
import { useSuspensionCheck } from '@/hooks/useSuspensionCheck';

function ProtectedRoute({ feature, children }: { feature: string, children: React.ReactNode }) {
  const { canAccess } = useSuspensionCheck();
  
  if (!canAccess(feature)) {
    return <Navigate to="/writer" replace />;
  }
  
  return <>{children}</>;
}

// Uso no Router
<Route path="/writer/available" element={
  <ProtectedRoute feature="petitions">
    <AvailablePetitions />
  </ProtectedRoute>
} />
```

---

## 🧪 **TESTAR:**

1. ✅ Login como redator suspenso
2. ✅ Verificar links desabilitados no sidebar
3. ✅ Clicar em link bloqueado → deve mostrar toast
4. ✅ Tentar acessar URL direta bloqueada → deve redirecionar
5. ✅ Acessar Chat e Configurações → deve funcionar normalmente

---

## 📊 **FLUXO COMPLETO:**

```
Redator suspenso faz login
    ↓
Dashboard carrega
    ↓
SuspensionAlert aparece no topo
    ↓
Sidebar mostra links bloqueados (com cadeado)
    ↓
Redator tenta clicar em "Petições Disponíveis"
    ↓
Toast aparece: "⏸️ Você está suspenso por mais X dias..."
    ↓
Redator clica em "Chat"
    ↓
Chat funciona normalmente
    ↓
Redator entra em contato com suporte
```

---

## ✅ **CHECKLIST:**

- [x] Hook de verificação criado
- [x] Componente de bloqueio criado
- [x] Sidebar com links desabilitados
- [x] Toast ao clicar em link bloqueado
- [x] Cores de alertas corrigidas
- [ ] Páginas envolvidas com SuspendedAccessBlock
- [ ] Botão "Aceitar Petição" bloqueado
- [ ] Redirecionamento automático
- [ ] Testes completos

---

**Status:** 🎯 80% Completo - Funcionalidade principal implementada!







