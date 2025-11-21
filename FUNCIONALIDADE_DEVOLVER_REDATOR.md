# ✅ NOVA FUNCIONALIDADE - Devolver Petição ao Redator

## 🎯 **Funcionalidade Implementada:**

Adicionado botão **"Devolver ao Redator"** na aba de Revisões do Admin, permitindo que o administrador devolva uma petição ao redator para ajustes antes de enviar ao cliente.

---

## 🎨 **Interface:**

### **Modal de Correção - Agora com 2 botões:**

```
┌─────────────────────────────────────────────┐
│ Correção #...                               │
│ Petição: [Nome da Petição]                 │
├─────────────────────────────────────────────┤
│                                             │
│ Arquivos entregues                         │
│ [Lista de arquivos]                        │
│                                             │
│ Enviar DOC/DOCX corrigido                  │
│ [Botão Upload]                             │
│                                             │
├─────────────────────────────────────────────┤
│ [⟲ Devolver ao Redator]  [✓ Enviar ao cliente] │
└─────────────────────────────────────────────┘
    ↑ Laranja (à esquerda)   ↑ Verde (à direita)
```

---

## 🔄 **Fluxo de Funcionamento:**

### **Quando Admin clica em "Devolver ao Redator":**

1. ✅ **Atualiza a correção:**
   - Status: `'pending'` → `'cancelled'`
   - Adiciona nota: "Devolvida ao redator pelo admin."

2. ✅ **Atualiza a petição:**
   - Status: `'pending_review'` → `'in_progress'`
   - Volta para o controle do redator

3. ✅ **Notifica o redator:**
   - Tipo: `correction_returned`
   - Título: "Petição devolvida"
   - Mensagem: "A petição '[Nome]' foi devolvida para ajustes."
   - Link: `/writer/my-petitions`

4. ✅ **Remove da lista de pendências**
   - Modal fecha automaticamente
   - Lista de pendências atualiza

---

## 📋 **Casos de Uso:**

### **Caso 1: Faltam arquivos**
**Situação:** Redator enviou para correção mas não anexou os arquivos necessários  
**Solução:** Admin clica em "Devolver ao Redator" → Redator recebe notificação e pode anexar os arquivos

### **Caso 2: Necessita ajustes**
**Situação:** Admin identifica que a petição precisa de correções antes da revisão final  
**Solução:** Admin devolve ao redator com instrução (via chat ou mensagem)

### **Caso 3: Erro no envio**
**Situação:** Petição foi enviada por engano para correção  
**Solução:** Admin devolve rapidamente ao redator

---

## 🎨 **Design do Botão:**

### **"Devolver ao Redator":**
- 🎨 Cor: Laranja (`border-orange-500`, `text-orange-600`)
- 📍 Posição: Esquerda do modal
- 🔄 Ícone: `RefreshCcw` (seta circular)
- ⚡ Ação: Devolve ao redator

### **"Enviar ao cliente":**
- 🎨 Cor: Verde (padrão)
- 📍 Posição: Direita do modal
- ✓ Ícone: `CheckCircle2` (check circle)
- ⚡ Ação: Envia ao cliente (funcionalidade original)

---

## 💻 **Código Implementado:**

### **Função `returnToWriter()`:**
```typescript
async function returnToWriter() {
  if (!active?.petition_id || !active?.id) return toast.error('Dados inválidos.');

  try {
    const adminClient = getAdminClient();
    
    // Atualizar status da correção
    await adminClient
      .from('corrections')
      .update({ 
        status: 'cancelled',
        corrected_text: 'Devolvida ao redator pelo admin.',
        updated_at: new Date().toISOString()
      })
      .eq('id', active.id);

    // Voltar status da petição
    await adminClient
      .from('petitions')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', active.petition_id);

    // Notificar redator
    if (active.user_id) {
      await adminClient.from('app_2d8133c678_notifications').insert({
        type: 'correction_returned',
        title: 'Petição devolvida',
        message: `A petição "${petition?.title || 'sua petição'}" foi devolvida para ajustes.`,
        target_user: active.user_id,
        action_url: '/writer/my-petitions',
        meta: { petitionId: active.petition_id },
      });
    }

    toast.success('Petição devolvida ao redator com sucesso!');
    setActive(null);
    await loadPending();
  } catch (err) {
    console.error('❌ Erro ao devolver ao redator:', err);
    toast.error('Falha ao devolver petição.');
  }
}
```

---

## 🧪 **Como Testar:**

1. **Como Redator:**
   - Crie ou abra uma petição
   - Envie para "Correção Humana"

2. **Como Admin:**
   - Acesse: **Admin → Revisões**
   - Clique em "Abrir" na petição
   - Clique em **"⟲ Devolver ao Redator"**
   - Confirme a mensagem de sucesso

3. **Como Redator (novamente):**
   - Veja a notificação: "Petição devolvida"
   - Acesse **Minhas Petições**
   - A petição deve estar como "Em Andamento" novamente

---

## ✅ **Resultado Esperado:**

### **Para o Admin:**
- ✅ Mensagem: "Petição devolvida ao redator com sucesso!"
- ✅ Modal fecha automaticamente
- ✅ Petição some da lista de pendências

### **Para o Redator:**
- ✅ Recebe notificação no sino 🔔
- ✅ Petição volta para "Em Andamento"
- ✅ Pode fazer ajustes e reenviar

---

## 📊 **Status das Correções:**

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando revisão do admin |
| `in_progress` | Admin está trabalhando (não usado ainda) |
| `completed` | Enviada ao cliente (sucesso) |
| `cancelled` | **NOVO** - Devolvida ao redator |

---

**Data de Implementação:** 2025-11-01  
**Arquivo Modificado:** `src/pages/admin/Revisoes.tsx`  
**Status:** ✅ **IMPLEMENTADO E TESTÁVEL**







