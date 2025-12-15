# 📋 Instruções para Configurar a Tabela de Planos

## 🎯 Objetivo
Este arquivo contém as instruções para criar a tabela `plans` no Supabase, que será usada para sincronizar os planos entre a área do admin e do cliente.

## 📁 Arquivo SQL
Execute o arquivo: `create_plans_table.sql`

## 🔧 Como Executar

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione o projeto Veredicta

### 2. Acesse o SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. Execute o Script
- Copie todo o conteúdo do arquivo `create_plans_table.sql`
- Cole no editor SQL
- Clique em **"Run"** para executar

## 📊 O que será Criado

### Tabela `plans`
- **id**: UUID único para cada plano
- **name**: Nome do plano (ex: "Start", "Profissional")
- **price**: Preço mensal em decimal
- **petitions_included**: Número de petições incluídas
- **additional_credit_price**: Preço do crédito adicional
- **features**: Array de funcionalidades do plano
- **is_active**: Se o plano está ativo
- **subscribers**: Contador de assinantes
- **description**: Descrição do plano
- **priority_support**: Se tem suporte prioritário
- **custom_branding**: Se tem marca personalizada
- **recommended**: Se é o plano recomendado
- **created_at/updated_at**: Timestamps automáticos

### Políticas RLS
- **Público**: Pode ler planos ativos
- **Admin**: Pode gerenciar todos os planos

### Planos Padrão
O script criará automaticamente 3 planos:
1. **🟢 Start** - R$ 520 - 4 petições
   - Ideal para testar ou resolver demandas pontuais
   - Até 3 dias úteis por entrega
   - Validade: 30 dias

2. **🔵 Pro** - R$ 1.680 - 14 petições (Recomendado)
   - Perfeito para escritórios com fluxo recorrente
   - Entregas em até 2 dias úteis
   - Validade: 60 dias

3. **🟣 Elite** - R$ 7.000 - 70 petições
   - Para grandes bancas e departamentos jurídicos
   - Entrega em até 1 dia útil (prioridade máxima)
   - Validade: 90 dias

## ✅ Verificação
Após executar o script, verifique se:
- A tabela `plans` foi criada
- Os 3 planos padrão foram inseridos
- As políticas RLS estão ativas

## 🔄 Atualizando Planos Existentes
Se você já tem planos no banco de dados, execute também:
- `update_existing_plans.sql` - Atualiza os planos existentes com os novos valores

## 🔄 Sincronização
Após a configuração:
- **Admin**: Pode criar, editar e gerenciar planos
- **Cliente**: Vê automaticamente os planos ativos
- **Mudanças**: Refletem instantaneamente em ambas as áreas

## 🚨 Importante
- Execute o script apenas uma vez
- Não execute novamente se a tabela já existir
- O script inclui proteção contra duplicação
