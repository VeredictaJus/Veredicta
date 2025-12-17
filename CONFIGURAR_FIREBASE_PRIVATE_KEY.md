# Como Configurar FIREBASE_PRIVATE_KEY no Supabase Dashboard

## Problema
O erro "secretOrPrivateKey must be an asymmetric key when using RS256" indica que a chave privada não está no formato correto.

## Solução

### 1. Obter a chave privada completa

A chave privada deve incluir:
- `-----BEGIN PRIVATE KEY-----`
- Todo o conteúdo da chave (várias linhas)
- `-----END PRIVATE KEY-----`

### 2. Formato correto no Supabase Dashboard

Quando colar no Supabase Dashboard, você tem duas opções:

#### Opção A: Com quebras de linha preservadas (RECOMENDADO)
Cole a chave exatamente como está no arquivo `firebase-service-account.json`, incluindo as quebras de linha:

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBELON7LRsF6V7
4rCmjnSq3GVaxm1kZ5fmqiUwncBcRVk7M4ShwX9p83zCs3WjIdIRP8uNj02ABpY3
... (resto da chave) ...
-----END PRIVATE KEY-----
```

#### Opção B: Com \n escapado
Se o Supabase não preservar as quebras de linha, use `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBELON7LRsF6V7\n4rCmjnSq3GVaxm1kZ5fmqiUwncBcRVk7M4ShwX9p83zCs3WjIdIRP8uNj02ABpY3\n... (resto da chave) ...\n-----END PRIVATE KEY-----\n
```

### 3. Verificar no arquivo do projeto

A chave completa está em: `workspace/veredicta/bridge/firebase-service-account.json`

Copie o valor do campo `"private_key"` (incluindo as quebras de linha `\n`).

### 4. Passos no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/dmsodonmkffyvbuxtxec/functions
2. Clique em `generate-password-reset-link` → Settings → Secrets
3. Encontre ou adicione `FIREBASE_PRIVATE_KEY`
4. Cole a chave completa (com `\n` ou quebras de linha reais)
5. Salve

### 5. Testar

Após configurar, teste novamente o "Esqueci minha senha" e verifique os logs para confirmar que a chave está sendo lida corretamente.




