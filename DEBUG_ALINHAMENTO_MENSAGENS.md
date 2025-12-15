# 🔍 DEBUG: ALINHAMENTO DAS MENSAGENS

## ❌ **PROBLEMA ATUAL:**
- ✅ **Tempo real funcionando** - Mensagens aparecem automaticamente
- ❌ **Mensagens do mesmo lado** - Todas aparecem à direita
- ❌ **Interface confusa** - Não é possível distinguir quem enviou

## 🔍 **DEBUG IMPLEMENTADO:**

### **Logs Adicionados:**
```typescript
console.log('🔍 Debug mensagem:', {
  messageId: message.id,
  senderId: message.sender_id,
  userId: user?.uid,
  isOwnMessage,
  user: user
});
```

## 🧪 **TESTE AGORA:**

### **1. Envie uma mensagem:**
- ✅ **Digite "Teste alinhamento"**
- ✅ **Clique em enviar**
- ✅ **Abra o console (F12)**

### **2. Verifique os logs:**
Procure por logs como:
```
🔍 Debug mensagem: {
  messageId: "abc-123",
  senderId: "user-firebase-uid",
  userId: "user-firebase-uid",
  isOwnMessage: true/false,
  user: { uid: "user-firebase-uid", ... }
}
```

### **3. Análise dos Logs:**

#### **Se `isOwnMessage` for sempre `true`:**
- ❌ **Problema:** Todas as mensagens são consideradas próprias
- 🔧 **Solução:** Verificar se `user?.uid` está correto

#### **Se `isOwnMessage` for sempre `false`:**
- ❌ **Problema:** Nenhuma mensagem é considerada própria
- 🔧 **Solução:** Verificar se `message.sender_id` está correto

#### **Se `userId` for `null` ou `undefined`:**
- ❌ **Problema:** Usuário não está sendo carregado
- 🔧 **Solução:** Verificar contexto de autenticação

#### **Se `senderId` for diferente de `userId`:**
- ✅ **Correto:** Mensagem de outro usuário
- ✅ **Deve aparecer à esquerda**

## 🎯 **CENÁRIOS ESPERADOS:**

### **Suas Mensagens:**
```
🔍 Debug mensagem: {
  senderId: "seu-firebase-uid",
  userId: "seu-firebase-uid",
  isOwnMessage: true
}
```
**Resultado:** Deve aparecer à direita (azul)

### **Mensagens do Suporte:**
```
🔍 Debug mensagem: {
  senderId: "support-admin",
  userId: "seu-firebase-uid", 
  isOwnMessage: false
}
```
**Resultado:** Deve aparecer à esquerda (cinza)

## 🔧 **POSSÍVEIS CORREÇÕES:**

### **Se o problema for `user?.uid`:**

#### **1. Verificar contexto de autenticação:**
```typescript
const { user } = useNewAuth();
console.log('Usuário atual:', user);
```

#### **2. Verificar se está logado:**
```typescript
if (!user) {
  console.log('Usuário não logado!');
}
```

### **Se o problema for `message.sender_id`:**

#### **1. Verificar dados da mensagem:**
```typescript
console.log('Mensagem completa:', message);
```

#### **2. Verificar participantes:**
```typescript
console.log('Participantes:', participants);
```

## 📋 **RELATÓRIO DE TESTE:**

### **Após enviar uma mensagem, me informe:**

1. **Logs do console:**
   - `senderId`: Qual valor?
   - `userId`: Qual valor?
   - `isOwnMessage`: `true` ou `false`?
   - `user`: Objeto completo ou `null`?

2. **Comportamento visual:**
   - Mensagem aparece à direita ou esquerda?
   - Cor azul ou cinza?

3. **Mensagens do suporte:**
   - Aparecem à direita ou esquerda?
   - Cor azul ou cinza?

## 🎉 **RESULTADO ESPERADO:**

### **Logs Corretos:**
```
🔍 Debug mensagem: {
  senderId: "seu-firebase-uid",
  userId: "seu-firebase-uid", 
  isOwnMessage: true
}
```

### **Visual Correto:**
- ✅ **Suas mensagens** → Direita (azul)
- ✅ **Mensagens do suporte** → Esquerda (cinza)

---

**Envie uma mensagem e me diga o que aparece no console!** 🔍

**Com os logs, posso identificar exatamente onde está o problema!** 🎯
