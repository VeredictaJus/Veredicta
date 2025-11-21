# 🔒 TESTES DO FILTRO DE INFORMAÇÕES SENSÍVEIS

## 📋 CASOS DE TESTE

### ✅ **1. TELEFONES**

| Entrada | Saída Esperada |
|---------|----------------|
| `Meu telefone é (11) 98765-4321` | `Meu telefone é ***` |
| `Liga para 11987654321` | `Liga para ***` |
| `WhatsApp: +5511987654321` | `***: ***` |
| `11 98765-4321` | `***` |

### ✅ **2. E-MAILS**

| Entrada | Saída Esperada |
|---------|----------------|
| `Meu email é joao@exemplo.com` | `Meu email é ***` |
| `Entre em contato: suporte@veredicta.com.br` | `Entre em contato: ***` |

### ✅ **3. CPF**

| Entrada | Saída Esperada |
|---------|----------------|
| `CPF: 123.456.789-00` | `CPF: ***` |
| `Meu CPF é 12345678900` | `Meu CPF é ***` |

### ✅ **4. CNPJ**

| Entrada | Saída Esperada |
|---------|----------------|
| `CNPJ 12.345.678/0001-00` | `CNPJ ***` |
| `12345678000100` | `***` |

### ✅ **5. WHATSAPP (palavras-chave)**

| Entrada | Saída Esperada |
|---------|----------------|
| `Me chama no WhatsApp` | `Me chama no ***` |
| `Meu zap é (11) 98765-4321` | `Meu *** é ***` |
| `WPP 11987654321` | `*** ***` |

### ✅ **6. LINKS**

| Entrada | Saída Esperada |
|---------|----------------|
| `Acesse http://exemplo.com` | `Acesse ***` |
| `Visite www.google.com` | `Visite ***` |

---

## 🚨 **ANTI-BURLA: NÚMEROS SEPARADOS**

### ✅ **7. DÍGITOS EM LINHAS SEPARADAS**

**Entrada:**
```
4
4
9
9
8
7
6
5
4
3
2
1
```

**Saída Esperada:**
```
***
***
***
***
***
***
***
***
***
***
***
***
```

### ✅ **8. DÍGITOS SEPARADOS POR ESPAÇOS**

| Entrada | Saída Esperada |
|---------|----------------|
| `4 4 9 9 8 7 6 5 4 3 2 1` | `***` |
| `1 1 9 8 7 6 5 4 3 2 1` | `***` |

### ✅ **9. DÍGITOS SEPARADOS POR PONTOS**

| Entrada | Saída Esperada |
|---------|----------------|
| `4.4.9.9.8.7.6.5.4.3.2.1` | `***` |
| `1.1.9.8.7.6.5.4.3.2.1` | `***` |

### ✅ **10. NÚMEROS POR EXTENSO**

| Entrada | Saída Esperada |
|---------|----------------|
| `quatro quatro nove nove oito sete seis cinco` | `***` |
| `um um nove oito sete seis cinco quatro três dois um` | `***` |

---

## 🧪 **COMO TESTAR:**

1. Abra o chat na plataforma
2. Tente enviar cada exemplo acima
3. Verifique se:
   - ✅ A mensagem foi mascarada
   - ✅ Toast de aviso apareceu
   - ✅ Mensagem salva no banco está mascarada

---

## ⚙️ **CONFIGURAÇÕES:**

### **Limite de dígitos para considerar suspeito:**
- Mínimo: **8 dígitos** (pode ser telefone)
- Máximo: **14 dígitos** (pode ser CNPJ)

### **Padrões protegidos:**
- Telefone (todos os formatos)
- E-mail
- CPF (com ou sem formatação)
- CNPJ (com ou sem formatação)
- WhatsApp/Zap/WPP (palavras-chave)
- Links (http, https, www)
- Chaves PIX (palavra-chave)
- Números de conta bancária
- **Números separados** (linhas, espaços, pontos)
- **Números por extenso** (um, dois, três...)

---

## 📝 **NOTAS:**

- O filtro é **automático** e **não bloqueante**
- Usuário vê **toast de aviso** quando info sensível é detectada
- Mensagem é **enviada mascarada** (não rejeitada)
- Banco de dados **nunca armazena** dados sensíveis







