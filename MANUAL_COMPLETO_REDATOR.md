# 📘 MANUAL COMPLETO DO REDATOR - PLATAFORMA VEREDICTA

## 🎯 **BEM-VINDO À PLATAFORMA VEREDICTA**

Este manual foi criado para orientar você, redator, sobre como utilizar a plataforma Veredicta de forma eficiente e evitar infrações. Leia atentamente todas as seções para garantir um trabalho de qualidade e evitar penalidades.

---

## 📑 **ÍNDICE**

1. [Primeiros Passos](#1-primeiros-passos)
2. [Como Funciona a Plataforma](#2-como-funciona-a-plataforma)
3. [Sistema de Prazos](#3-sistema-de-prazos)
4. [Sistema de Penalidades](#4-sistema-de-penalidades)
5. [Sistema de Suspensão](#5-sistema-de-suspensão)
6. [Processo de Trabalho](#6-processo-de-trabalho)
7. [Sistema de Pagamentos](#7-sistema-de-pagamentos)
8. [Sistema de Correções e Revisões](#8-sistema-de-correções-e-revisões)
9. [Sistema de Notificações](#9-sistema-de-notificações)
10. [Regras e Diretrizes](#10-regras-e-diretrizes)
11. [Como Evitar Infrações](#11-como-evitar-infrações)
12. [FAQ - Perguntas Frequentes](#12-faq---perguntas-frequentes)

---

## 1️⃣ **PRIMEIROS PASSOS**

### **1.1 Cadastro e Aprovação**

1. **Cadastro Inicial:**
   - Preencha todos os dados do seu perfil
   - Informe suas especialidades jurídicas
   - Envie documentos necessários (OAB, etc.)
   - Aguarde aprovação do administrador

2. **Aprovação:**
   - O administrador analisará seu cadastro
   - Você receberá uma notificação quando for aprovado
   - Após aprovação, poderá começar a trabalhar

3. **Configuração do Perfil:**
   - Complete seu perfil com informações profissionais
   - Adicione sua foto (opcional)
   - Configure suas especialidades
   - Mantenha seus dados atualizados

### **1.2 Navegação na Plataforma**

- **Dashboard:** Visão geral das suas petições e estatísticas
- **Petições Disponíveis:** Lista de petições que você pode pegar
- **Minhas Petições:** Petições atribuídas a você
- **Pagamentos:** Histórico de pagamentos e saldo
- **Configurações:** Gerenciar seu perfil e preferências
- **Notificações:** Alertas e avisos importantes

---

## 2️⃣ **COMO FUNCIONA A PLATAFORMA**

### **2.1 Fluxo de Trabalho**

```
1. Cliente cria uma petição
   ↓
2. Petição fica disponível para redatores
   ↓
3. Você pega a petição (aceita)
   ↓
4. Petição é atribuída a você
   ↓
5. Você trabalha na petição
   ↓
6. Você entrega a petição (antes do prazo)
   ↓
7. Admin revisa a petição
   ↓
8. Cliente aprova ou solicita correções
   ↓
9. Se aprovada, você recebe o pagamento
```

### **2.2 Status das Petições**

- **Pendente:** Aguardando redator
- **Em Andamento:** Atribuída a você, em desenvolvimento
- **Em Revisão:** Enviada, aguardando revisão do admin
- **Aprovada:** Aprovada pelo cliente, pagamento liberado
- **Correção Solicitada:** Admin solicitou alterações
- **Concluída:** Finalizada e entregue ao cliente
- **Cancelada:** Cancelada pelo cliente ou admin
- **Disputada:** Em disputa entre cliente e redator

---

## 3️⃣ **SISTEMA DE PRAZOS**

### **3.1 Prazos por Plano do Cliente**

| Plano | Prazo | Horário Limite |
|-------|-------|----------------|
| **START** | 3 dias úteis | Até 18h do último dia |
| **PRO** | 2 dias úteis | Até 18h do último dia |
| **ELITE** | Mesmo dia | Até 18h (se pedido até 14h) |

**⚠️ IMPORTANTE:**
- **Horário oficial de entrega:** 17h (horário de Brasília)
- **Tolerância:** até 18h (60 minutos extras)
- **Após 18h:** A petição será considerada **ATRASADA**

### **3.2 Regras de Prazos**

1. **Dias Úteis:**
   - Segunda a Sexta-feira
   - Exclui sábados, domingos e feriados

2. **Pedidos Elite:**
   - Se pedido após 14h → entrega no próximo dia útil às 18h
   - Se pedido antes de 14h → entrega no mesmo dia às 18h

3. **Fins de Semana:**
   - Pedidos feitos em fins de semana → entrega no próximo dia útil às 18h

4. **Feriados:**
   - Não contam como dias úteis
   - Prazo é prorrogado automaticamente

### **3.3 Sistema de Alertas**

- **Alerta Automático:** Você receberá um alerta às **17h** (1h antes do prazo final)
- **Modal de Alerta:** Aparecerá automaticamente no dashboard
- **Tempo Mínimo:** 3 horas para trabalho de qualidade
- **Ação Recomendada:** Finalize e entregue o quanto antes!

---

## 4️⃣ **SISTEMA DE PENALIDADES**

### **4.1 Multa por Atraso**

**🚨 ATENÇÃO: O cumprimento dos prazos é FUNDAMENTAL na plataforma Veredicta.**

#### **O que acontece quando você atrasa:**

1. **💰 MULTA AUTOMÁTICA DE 50%**
   - 50% do valor da petição é descontado do seu saldo
   - **Exemplo:** Petição de R$ 100,00 atrasada = Multa de R$ 50,00
   - A multa é descontada do seu saldo disponível para saque
   - **Esta penalidade é IRREVERSÍVEL e aplicada automaticamente**

2. **🔄 REATRIBUIÇÃO AUTOMÁTICA**
   - A petição atrasada será **REMOVIDA** de você automaticamente
   - A petição volta para status "Pendente" no sistema
   - Outro redator poderá pegar a petição e completá-la
   - Você **PERDE** a oportunidade de receber pelo trabalho

3. **📊 REGISTRO NO SISTEMA**
   - Multa registrada na tabela `writer_penalties`
   - Saldo atualizado na tabela `writer_balance`
   - Histórico de penalidades fica registrado permanentemente

### **4.2 Como a Multa é Aplicada**

- **Verificação Automática:** Sistema verifica a cada hora
- **Aplicação Imediata:** Multa aplicada assim que detecta atraso
- **Sem Aviso Prévio:** Não há segunda chance após o prazo
- **Irreversível:** Não pode ser desfeita pelo redator

### **4.3 Impacto Financeiro**

```
Exemplo Prático:
- Petição: R$ 200,00
- Você atrasa a entrega
- Multa aplicada: R$ 100,00 (50%)
- Você recebe: R$ 0,00 (petição reatribuída)
- Prejuízo total: R$ 200,00
```

**💡 DICA:** Sempre entregue ANTES do prazo para evitar perdas!

---

## 5️⃣ **SISTEMA DE SUSPENSÃO**

### **5.1 Suspensão por Atrasos (Progressiva)**

O sistema aplica suspensões progressivas baseadas no número de atrasos acumulados:

| Atrasos | Ação | Duração | Reversível? |
|---------|------|---------|-------------|
| **3 atrasos** | Suspensão | 30 dias corridos | Automático (após prazo) |
| **6 atrasos** | Suspensão | 60 dias corridos | Automático (após prazo) |
| **9+ atrasos** | **Bloqueio Permanente** | Indefinido | **Apenas via Suporte** |

### **5.2 Suspensão por Baixa Avaliação**

**⚠️ IMPORTANTE:** Além dos atrasos, você também pode ser suspenso por baixa avaliação!

#### **Critérios de Suspensão:**

| Critério | Limite | Ação |
|----------|--------|------|
| **Média de Avaliação** | < 3.8 ⭐ | Suspensão automática |
| **Mínimo de Avaliações** | 3 avaliações | Para ser válido |
| **Reabilitação** | Manual | Apenas via Suporte |

#### **Como Funciona:**

1. **Cliente avalia sua petição:**
   - Após aprovar, cliente pode avaliar de 1 a 5 estrelas
   - Sistema calcula sua média automaticamente

2. **Sistema verifica média:**
   - Se você tiver 3+ avaliações E média < 3.8 → Suspensão automática
   - Suspensão dura até 365 dias (ou até suporte reativar)

3. **O que acontece:**
   - Você recebe alerta vermelho no dashboard
   - Não pode pegar novas petições
   - Acesso limitado (apenas Chat e Suporte)
   - Deve contatar suporte para reabilitação

#### **Classificação de Avaliações:**

| Média | Classificação | Status | Badge |
|-------|---------------|--------|-------|
| **>= 4.5** | ⭐ Excelente | Ativo | 🟢 Verde |
| **>= 4.0** | 👍 Bom | Ativo | 🟢 Verde |
| **>= 3.8** | ✔️ Aceitável | Ativo (alerta) | 🟡 Amarelo |
| **< 3.8** | ⚠️ Abaixo do mínimo | **Suspenso** | 🔴 Vermelho |
| **Sem avaliações** | 📝 Novo | Ativo | ⚪ Cinza |

#### **Avisos Preventivos:**

- **Avaliação entre 3.8 - 4.0:**
  - ⚠️ Alerta amarelo no dashboard
  - "Atenção: Avaliação Próxima ao Limite"
  - Dicas de como melhorar

#### **Como Evitar Suspensão por Avaliação:**

- ✅ Entregue trabalho de alta qualidade
- ✅ Revise antes de enviar
- ✅ Siga todas as diretrizes
- ✅ Comunique-se profissionalmente
- ✅ Responda correções rapidamente
- ✅ Mantenha média acima de 3.8 estrelas

### **5.2 O que acontece quando você é suspenso:**

1. **Acesso Bloqueado:**
   - Você não pode pegar novas petições
   - Não pode acessar petições disponíveis
   - Dashboard mostra alerta de suspensão

2. **Petições Existentes:**
   - Você pode finalizar petições já atribuídas
   - Mas não pode pegar novas

3. **Reversão:**
   - Suspensões temporárias revertem automaticamente após o prazo
   - Bloqueio permanente requer contato com suporte

### **5.3 Como Evitar Suspensão**

**Por Atrasos:**
- ✅ Sempre entregue no prazo
- ✅ Organize seu tempo adequadamente
- ✅ Não pegue mais petições do que consegue entregar
- ✅ Use o sistema de alertas para se lembrar dos prazos

**Por Baixa Avaliação:**
- ✅ Entregue trabalho de alta qualidade
- ✅ Revise antes de enviar
- ✅ Siga todas as diretrizes técnicas
- ✅ Mantenha comunicação profissional
- ✅ Responda correções rapidamente
- ✅ Monitore sua média de avaliações no dashboard

---

## 6️⃣ **PROCESSO DE TRABALHO**

### **6.1 Pegar uma Petição**

1. Acesse "Petições Disponíveis"
2. Leia a descrição da petição
3. Verifique se está dentro da sua especialidade
4. Verifique o prazo disponível
5. Clique em "Aceitar Petição"
6. A petição será atribuída a você

**⚠️ ATENÇÃO:**
- Não pegue petições que não consegue entregar no prazo
- Verifique sua carga de trabalho atual
- Considere a complexidade da petição

### **6.2 Trabalhar na Petição**

1. **Leia atentamente:**
   - Descrição completa
   - Documentos anexados
   - Informações do cliente
   - Requisitos especiais

2. **Organize seu trabalho:**
   - Crie um plano de ação
   - Pesquise legislação aplicável
   - Prepare a estrutura da petição

3. **Desenvolva a petição:**
   - Siga as diretrizes jurídicas
   - Use linguagem técnica apropriada
   - Revise antes de enviar

4. **Anexe documentos:**
   - Se necessário, anexe documentos complementares
   - Verifique se todos os arquivos estão corretos

### **6.3 Entregar a Petição**

1. **Antes de entregar, verifique:**
   - ✅ Petição está completa
   - ✅ Linguagem técnica correta
   - ✅ Sem erros ortográficos
   - ✅ Formatação adequada
   - ✅ Documentos anexados (se necessário)

2. **Envie a petição:**
   - Clique em "Enviar Petição"
   - Confirme o envio
   - Aguarde revisão do admin

3. **Após envio:**
   - Você receberá notificação quando admin revisar
   - Cliente pode aprovar ou solicitar correções
   - Se aprovada, pagamento será liberado

---

## 7️⃣ **SISTEMA DE PAGAMENTOS**

### **7.1 Como Funciona**

1. **Petição Aprovada:**
   - Quando cliente aprova, valor é creditado no seu saldo
   - Saldo fica disponível para saque

2. **Saldo Disponível:**
   - Você pode ver seu saldo em "Pagamentos"
   - Saldo = Total ganho - Multas aplicadas

3. **Saque:**
   - Envie nota fiscal até dia 05 do mês
   - Pagamento será processado no dia 05 do mês seguinte
   - Você receberá o pagamento via método configurado

### **7.2 Nota Fiscal**

**📄 OBRIGATÓRIO:**
- Envie nota fiscal até **dia 05 de cada mês**
- Nota fiscal deve ser do mês anterior
- Sem nota fiscal, pagamento não será processado

**⚠️ IMPORTANTE:**
- Você receberá lembretes automáticos (dias 1-5 do mês)
- Não esqueça de enviar a nota fiscal
- Pagamento só é processado com nota fiscal válida

### **7.3 Histórico de Pagamentos**

- Acesse "Pagamentos" para ver:
  - Saldo total ganho
  - Multas aplicadas
  - Saldo disponível
  - Histórico de pagamentos
  - Status de notas fiscais

---

## 8️⃣ **SISTEMA DE CORREÇÕES E REVISÕES**

### **8.1 Correções Solicitadas**

Quando admin solicita correções:

1. **Você receberá notificação:**
   - Notificação urgente no sistema
   - Email (se configurado)
   - Alerta no dashboard

2. **Leia os comentários:**
   - Admin deixará comentários específicos
   - Identifique o que precisa ser corrigido
   - Entenda o motivo da correção

3. **Faça as correções:**
   - Corrija os pontos solicitados
   - Revise toda a petição novamente
   - Envie a versão corrigida

4. **Prazo para correções:**
   - Correções devem ser feitas rapidamente
   - Não há prazo específico, mas seja ágil
   - Cliente está aguardando

### **8.2 Revisão Humana**

- Cliente pode solicitar revisão humana
- Admin revisará a petição manualmente
- Você pode receber feedback adicional
- Siga as orientações do admin

---

## 9️⃣ **SISTEMA DE NOTIFICAÇÕES**

### **9.1 Tipos de Notificações**

Você receberá notificações sobre:

1. **📋 Nova Petição Atribuída**
   - Quando admin atribui petição a você
   - Prioridade: Alta

2. **🔄 Correção Solicitada**
   - Quando admin pede correções
   - Prioridade: Urgente

3. **💰 Pagamento Registrado**
   - Quando pagamento é processado
   - Prioridade: Normal

4. **⏰ Prazo Próximo**
   - 1h antes do deadline (17h)
   - Prioridade: Urgente

5. **💬 Nova Mensagem no Chat**
   - Mensagem de cliente ou admin
   - Prioridade: Normal

6. **📄 Lembrete de Nota Fiscal**
   - Dias 1-5 do mês
   - Prioridade: Alta

7. **📢 Petições Disponíveis**
   - Nova petição disponível
   - Prioridade: Normal

### **9.2 Como Gerenciar Notificações**

- **Ver notificações:** Clique no sino no header
- **Marcar como lida:** Clique na notificação
- **Marcar todas como lidas:** Botão no dropdown
- **Navegar:** Clique na notificação para ir à página relacionada

---

## 🔟 **REGRAS E DIRETRIZES**

### **10.1 Regras de Conduta**

1. **Profissionalismo:**
   - Mantenha comunicação profissional
   - Respeite clientes e colegas
   - Use linguagem técnica apropriada

2. **Qualidade:**
   - Entregue trabalho de alta qualidade
   - Revise antes de enviar
   - Siga diretrizes jurídicas

3. **Prazos:**
   - Sempre entregue no prazo
   - Organize seu tempo adequadamente
   - Não pegue mais do que consegue entregar

4. **Ética:**
   - Não copie trabalhos de outros
   - Não use conteúdo protegido por direitos autorais
   - Mantenha confidencialidade

### **10.2 Diretrizes Técnicas**

1. **Estrutura da Petição:**
   - Siga estrutura jurídica padrão
   - Use formatação adequada
   - Inclua todas as seções necessárias

2. **Linguagem:**
   - Use linguagem técnica jurídica
   - Evite gírias e linguagem informal
   - Mantenha tom profissional

3. **Referências:**
   - Cite legislação aplicável
   - Use jurisprudência quando relevante
   - Referencie doutrina se necessário

### **10.3 Proibições**

**❌ NÃO FAÇA:**
- Entregar petições atrasadas
- Copiar trabalhos de outros redatores
- Usar conteúdo de fontes não autorizadas
- Comunicar-se de forma inadequada
- Ignorar solicitações de correção
- Não enviar nota fiscal no prazo

---

## 1️⃣1️⃣ **COMO EVITAR INFRAÇÕES**

### **11.1 Checklist de Prevenção**

**Antes de pegar uma petição:**
- ✅ Verifique se consegue entregar no prazo
- ✅ Confirme que está na sua especialidade
- ✅ Avalie sua carga de trabalho atual
- ✅ Leia toda a descrição da petição

**Durante o trabalho:**
- ✅ Monitore o prazo constantemente
- ✅ Trabalhe com antecedência
- ✅ Revise antes de enviar
- ✅ Verifique qualidade do trabalho

**Após envio:**
- ✅ Responda correções rapidamente
- ✅ Mantenha comunicação ativa
- ✅ Envie nota fiscal no prazo
- ✅ Acompanhe status da petição

### **11.2 Dicas para Sucesso**

1. **Organização:**
   - Crie um calendário de prazos
   - Priorize petições com prazos mais curtos
   - Reserve tempo para revisão

2. **Comunicação:**
   - Responda mensagens rapidamente
   - Seja claro e objetivo
   - Mantenha profissionalismo

3. **Qualidade:**
   - Revise sempre antes de enviar
   - Verifique ortografia e gramática
   - Confirme que atendeu todos os requisitos

4. **Tempo:**
   - Não deixe para última hora
   - Trabalhe com margem de segurança
   - Use alertas do sistema

### **11.3 Sinais de Alerta**

**⚠️ ATENÇÃO se:**
- Você tem muitas petições em andamento
- Prazos estão se aproximando
- Você não está conseguindo entregar no prazo
- Recebeu muitas solicitações de correção

**Ação recomendada:**
- Pare de pegar novas petições
- Foque em finalizar as existentes
- Organize melhor seu tempo
- Peça ajuda se necessário

---

## 1️⃣2️⃣ **FAQ - PERGUNTAS FREQUENTES**

### **P: O que acontece se eu atrasar uma petição?**
**R:** Você receberá multa de 50% do valor, a petição será reatribuída e seu contador de atrasos será incrementado.

### **P: Posso cancelar uma petição que peguei?**
**R:** Não recomendado. Petições só podem ser canceladas pelo admin ou cliente. Se você não conseguir entregar, entre em contato com suporte.

### **P: Como funciona o pagamento?**
**R:** Quando cliente aprova a petição, valor é creditado no seu saldo. Envie nota fiscal até dia 05 para receber no dia 05 do mês seguinte.

### **P: E se eu não enviar a nota fiscal?**
**R:** O pagamento não será processado. Você receberá lembretes automáticos nos dias 1-5 do mês.

### **P: Quantas petições posso pegar ao mesmo tempo?**
**R:** Não há limite fixo, mas pegue apenas o que conseguir entregar no prazo. Lembre-se: atrasos resultam em multas e suspensões.

### **P: Como sei se uma petição está atrasada?**
**R:** Você receberá alerta automático às 17h (1h antes do prazo). Monitore também o dashboard que mostra prazos.

### **P: Posso pedir extensão de prazo?**
**R:** Não há sistema automático de extensão. Em casos excepcionais, entre em contato com suporte antes do prazo.

### **P: O que acontece se eu for suspenso?**
**R:** Você não poderá pegar novas petições durante o período de suspensão. Pode finalizar petições já atribuídas. Suspensões por atrasos revertem automaticamente. Suspensões por baixa avaliação requerem contato com suporte.

### **P: Como funciona o sistema de avaliações?**
**R:** Clientes avaliam suas petições após aprovação (1-5 estrelas). Se sua média cair abaixo de 3.8 com 3+ avaliações, você será suspenso automaticamente. Mantenha qualidade alta para evitar suspensão.

### **P: Posso ser suspenso por outros motivos além de atrasos?**
**R:** Sim, você também pode ser suspenso por baixa avaliação (média < 3.8 estrelas com 3+ avaliações). Além disso, comportamentos inadequados podem resultar em suspensão ou bloqueio.

### **P: Como evitar multas?**
**R:** Sempre entregue antes do prazo (18h). Use os alertas do sistema. Organize seu tempo adequadamente.

### **P: Posso ver meu histórico de penalidades?**
**R:** Sim, acesse "Pagamentos" para ver multas aplicadas e histórico.

---

## 📞 **SUPORTE E CONTATO**

### **Precisa de Ajuda?**

- **Chat de Suporte:** Disponível no dashboard
- **Email:** contato@veredictajus.com
- **Notificações:** Sistema envia alertas importantes

### **Situações de Emergência**

Se você:
- Não conseguir entregar uma petição no prazo
- Tiver problemas técnicos
- Precisar de esclarecimentos urgentes

**Entre em contato IMEDIATAMENTE com suporte!**

---

## ✅ **CHECKLIST FINAL**

Antes de começar a trabalhar, certifique-se de que:

- [ ] Leu todo este manual
- [ ] Entendeu o sistema de prazos
- [ ] Compreendeu as penalidades
- [ ] Configurou seu perfil corretamente
- [ ] Entende como funciona o pagamento
- [ ] Sabe como evitar infrações
- [ ] Tem acesso ao suporte

---

## 🎯 **CONCLUSÃO**

Este manual foi criado para ajudá-lo a ter sucesso na plataforma Veredicta. Siga as diretrizes, respeite os prazos e mantenha a qualidade do seu trabalho. 

**Lembre-se:**
- ✅ Prazos são fundamentais
- ✅ Qualidade é essencial
- ✅ Comunicação é importante
- ✅ Organização é chave para o sucesso

**Boa sorte e bom trabalho! 🚀**

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Plataforma:** Veredicta - Legal Petition Hub

