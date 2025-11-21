# 📦 Guia: Configurar Bucket de Backups Admin

Este guia mostra como criar e configurar o bucket `admin-backups` separado para backups do sistema.

---

## 🎯 Por que usar um bucket separado?

- ✅ **Organização**: Backups de sistema separados de backups de usuários
- ✅ **Segurança**: Apenas admins têm acesso
- ✅ **Políticas específicas**: RLS personalizado para área admin

---

## 📋 Passo a Passo

### **1️⃣ Criar o Bucket no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** (ícone de pasta na sidebar)
3. Clique em **"New bucket"** ou **"Create a new bucket"**
4. Configure:
   - **Name:** `admin-backups`
   - **Public:** ❌ **DESMARQUE** (deve ser privado!)
   - **File size limit:** `100` MB (ou mais se preferir)
   - **Allowed MIME types:** `application/json`
5. Clique em **"Create bucket"** ou **"Save"**

---

### **2️⃣ Adicionar Políticas de RLS**

1. Ainda no Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `criar_bucket_admin_backups.sql`
4. Clique em **"Run"** (Ctrl+J)
5. Deve aparecer: **"Success. 3 rows affected"** ✅

---

### **3️⃣ Testar o Backup**

1. Volte para a plataforma (`localhost:5175/#/admin/settings`)
2. Recarregue a página (F5 ou Ctrl+R)
3. Vá em **Configurações → Backup**
4. Clique em **"Criar Backup Agora"**
5. Deve aparecer: **"Backup criado com sucesso!"** 🎉

---

## ✅ Checklist de Verificação

- [ ] Bucket `admin-backups` criado no Supabase
- [ ] Bucket está configurado como **privado** (não público)
- [ ] 3 políticas de RLS criadas (upload, read, delete)
- [ ] Código atualizado para usar `admin-backups`
- [ ] Backup testado e funcionando

---

## 🔧 Estrutura do Backup

Os backups são salvos como:
```
admin-backups/
  └── backup_full_2025-10-24T20-32-44-0222.json
  └── backup_full_2025-10-25T14-15-30-1234.json
  └── ...
```

**Conteúdo do arquivo JSON:**
```json
{
  "__meta__": {
    "created_at": "2025-10-24T20:32:44.022Z",
    "warnings": []
  },
  "users": [...],
  "peticoes": [...],
  "plans": [...],
  "system_settings": [...],
  "app_2d8133c678_payments": [...]
}
```

---

## 🔒 Segurança

✅ **Apenas admins** podem:
- Criar backups
- Listar backups
- Baixar backups
- Restaurar backups
- Deletar backups

✅ **Verificação de permissão:**
- Sistema verifica se `firebase_uid` existe em `profiles_v2`
- Sistema verifica se `role = 'admin'`
- Sem permissão = erro de autenticação

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se o bucket foi criado corretamente
2. Verifique se as políticas de RLS foram aplicadas
3. Verifique se seu usuário tem `role = 'admin'` em `profiles_v2`
4. Veja os logs no console do navegador (F12 → Console)

---

**Data de criação:** 24/10/2025  
**Versão:** 1.0














