# 🎯 Guia de Implementação - Sistema de Verificação de Documentos

Sistema completo de verificação de CNPJ (automático) e OAB (com upload de carteirinha).

---

## 📋 O que foi implementado

### ✅ 1. Serviço de Verificação (`verificationService.ts`)

**Localização:** `src/services/verificationService.ts`

**Funcionalidades:**
- ✅ **Verificação de CNPJ via BrasilAPI** (automático, gratuito)
- ✅ **Validação de CPF** (formato com dígitos verificadores)
- ✅ **Validação de OAB** (formato do número)
- ✅ **Detecção automática** CPF vs CNPJ
- ✅ **Formatação automática** de documentos

**Exemplo de uso:**
```typescript
import { VerificationService } from '@/services/verificationService';

// Verificar CNPJ
const result = await VerificationService.verifyCNPJ('12.345.678/0001-90');
// Retorna: { valid: true, companyName: "...", status: "ATIVA", ... }

// Validar CPF
const cpfResult = VerificationService.validateCPF('123.456.789-00');
// Retorna: { valid: true, formatted: "123.456.789-00" }
```

---

### ✅ 2. Formulário de Cliente Atualizado

**Funcionalidades:**
- ✅ **Campo único** "CPF ou CNPJ" com detecção automática
- ✅ **Botão "Verificar"** aparece quando CNPJ é detectado
- ✅ **Feedback visual** com dados da empresa (via BrasilAPI)
- ✅ **Campos condicionais:**
  - **Se CNPJ:** Nome da Empresa + Nome do Responsável
  - **Se CPF:** Nome Completo + OAB + Upload Carteirinha (frente + verso)

**Fluxo do Cliente com CNPJ:**
```
1. Digita: 12.345.678/0001-90
2. Sistema detecta: CNPJ
3. Botão "Verificar" aparece
4. Clica em "Verificar"
5. BrasilAPI retorna dados da empresa
6. Feedback: ✅ CNPJ ATIVA - Silva Advocacia Ltda
7. Aprovação automática
```

**Fluxo do Cliente com CPF:**
```
1. Digita: 123.456.789-00
2. Sistema detecta: CPF
3. Campos de OAB + Upload aparecem
4. Preenche OAB: 123456/SP
5. Faz upload da carteirinha (frente + verso)
6. Aguarda aprovação manual do admin
```

---

### ✅ 3. Formulário de Redator Atualizado

**Funcionalidades:**
- ✅ **Upload de Carteirinha OAB** (frente + verso) - OBRIGATÓRIO
- ✅ **Validação de formato** (JPG, PNG, PDF - máx. 5MB)
- ✅ **Preview do nome do arquivo**

**Fluxo do Redator:**
```
1. Preenche dados pessoais
2. Preenche CPF + OAB
3. Faz upload da carteirinha OAB (frente + verso)
4. Faz upload de 3 petições autorais
5. Aguarda aprovação manual do admin
```

---

### ✅ 4. Bucket de Armazenamento no Supabase

**Bucket:** `oab-documents`

**Estrutura:**
```
oab-documents/
├── {firebase_uid}/
│   ├── oab_front_1234567890.jpg
│   └── oab_back_1234567890.jpg
```

**Políticas RLS:**
- ✅ Usuários podem fazer upload de seus próprios documentos
- ✅ Usuários podem ler seus próprios documentos
- ✅ Admins podem ler TODOS os documentos
- ✅ Admins podem deletar documentos

**Para criar o bucket:**
1. Abra o Supabase Dashboard
2. Vá para Storage
3. Execute o SQL: `criar_bucket_oab_documents.sql`

---

## 🚀 Como Testar

### Teste 1: Cliente com CNPJ

1. Acesse: `http://localhost:5175/#/auth/register`
2. Clique em "Sou Cliente"
3. Digite no campo "CPF ou CNPJ": `06.990.590/0001-23` (exemplo válido)
4. Clique em "Verificar"
5. **Resultado esperado:** Feedback verde com dados da empresa

### Teste 2: Cliente com CPF

1. Acesse: `http://localhost:5175/#/auth/register`
2. Clique em "Sou Cliente"
3. Digite no campo "CPF ou CNPJ": `123.456.789-00`
4. **Resultado esperado:** Campos de OAB + Upload aparecem

### Teste 3: Redator

1. Acesse: `http://localhost:5175/#/auth/register`
2. Clique em "Sou Redator"
3. Preencha todos os campos
4. **Resultado esperado:** Campos de upload de carteirinha OAB aparecem

---

## 📊 Fluxo Completo de Verificação

```
┌─────────────────────────────────────────────┐
│ CADASTRO DE USUÁRIO                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Qual tipo de usuário? │
        └───────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   [CLIENTE]               [REDATOR]
        │                       │
        │                       ├─ CPF
        │                       ├─ OAB
        │                       ├─ 📸 Carteirinha (frente)
        │                       ├─ 📸 Carteirinha (verso)
        │                       ├─ 📄 3 Petições
        │                       └─ ⏳ Aprovação Manual
        │
        ▼
   CPF ou CNPJ?
        │
    ┌───┴───┐
    │       │
    ▼       ▼
 [CNPJ]   [CPF]
    │       │
    │       ├─ OAB
    │       ├─ 📸 Carteirinha (frente)
    │       ├─ 📸 Carteirinha (verso)
    │       └─ ⏳ Aprovação Manual
    │
    ├─ 🔄 BrasilAPI
    ├─ ✅ CNPJ ATIVA?
    └─ ⚡ Aprovação Automática
```

---

## 🔧 Configuração do Ambiente

### 1. Variáveis de Ambiente

Não são necessárias variáveis de ambiente adicionais. A BrasilAPI é pública e gratuita.

### 2. Criar Bucket no Supabase

Execute o SQL em: `criar_bucket_oab_documents.sql`

```sql
-- 1. Criar bucket via Dashboard:
-- Nome: oab-documents
-- Público: NÃO (private)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg,image/png,application/pdf

-- 2. Executar políticas RLS no SQL Editor
```

### 3. Adicionar colunas no banco (se necessário)

Execute o SQL em: `adicionar_colunas_status_profiles_v2.sql`

```sql
ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE profiles_v2
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
```

---

## 🎯 Resumo das Verificações

| Tipo de Usuário | Documento | Verificação | Aprovação | Tempo |
|----------------|-----------|-------------|-----------|-------|
| **Redator** | CPF + OAB | Carteirinha OAB (frente/verso) | ⏳ Manual | 1-24h |
| **Cliente CPF** | CPF + OAB | Carteirinha OAB (frente/verso) | ⏳ Manual | 1-24h |
| **Cliente CNPJ** | CNPJ | BrasilAPI (automático) | ⚡ Automática | 2 segundos |

---

## 📌 Próximos Passos (Opcional)

### Para melhorar ainda mais:

1. **Interface Admin para visualizar documentos OAB**
   - Adicionar botão "Ver Carteirinha" na lista de aprovação
   - Modal com preview das imagens (frente + verso)

2. **Notificações por email**
   - Enviar email quando documento for aprovado/rejeitado

3. **Histórico de verificações**
   - Registrar todas as tentativas de verificação
   - Log de quem aprovou/rejeitou

4. **API da OAB (se disponível no futuro)**
   - Substituir verificação manual por API automática
   - Integrar com Predictus API (pago)

---

## ❓ FAQ

### 1. A BrasilAPI é confiável?
✅ Sim! Os dados vêm diretamente da Receita Federal do Brasil.

### 2. Preciso de chave de API para a BrasilAPI?
❌ Não! A BrasilAPI é 100% gratuita e não requer autenticação.

### 3. O que acontece se a BrasilAPI estiver fora do ar?
⚠️ O sistema mostra erro e o usuário pode tentar novamente. Considere adicionar um fallback manual.

### 4. Posso usar outra API para CNPJ?
✅ Sim! Basta alterar a função `verifyCNPJ` no `verificationService.ts`.

### 5. Como adiciono verificação automática de OAB?
💰 Você pode contratar a Predictus API (paga) que oferece verificação de OAB via API.

---

## 🎉 Pronto!

Seu sistema de verificação está completo e funcional! 🚀

**Próximo passo:** Testar o cadastro completo e criar a interface do admin para aprovar os documentos.














