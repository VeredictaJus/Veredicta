# Como criar a tabela petitions no Supabase

## Passo 1: Acessar o Supabase Dashboard
1. Acesse https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto Veredicta

## Passo 2: Executar o SQL
1. No dashboard do Supabase, vá para "SQL Editor"
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo `create_petitions_table.sql`
4. Clique em "Run" para executar o script

## Passo 3: Verificar se a tabela foi criada
1. Vá para "Table Editor"
2. Verifique se a tabela `petitions` aparece na lista
3. Confirme que as colunas foram criadas corretamente

## Passo 4: Testar a aplicação
1. Volte para a aplicação
2. Acesse "Minhas Petições"
3. A página deve carregar sem erros (mesmo que não mostre petições ainda)

## Estrutura da tabela petitions:
- id: UUID (chave primária)
- client_id: varchar (ID do cliente)
- title: varchar (título da petição)
- description: text (descrição)
- type: varchar (tipo da petição)
- status: varchar (pending, in_progress, revision, completed, rejected)
- priority: varchar (normal, urgent, express)
- price: decimal (preço)
- deadline: timestamp (prazo)
- writer_name: varchar (nome do redator)
- assigned_writer_id: varchar (ID do redator atribuído)
- files: text[] (array de arquivos)
- correction_count: integer (contador de correções)
- correction_requested_at: timestamp (quando foi solicitada correção)
- created_at: timestamp (data de criação)
- updated_at: timestamp (data de atualização)

## Políticas de Segurança (RLS):
- Clientes podem ler, inserir e atualizar suas próprias petições
- Redatores podem ler e atualizar petições atribuídas a eles
- Admins podem ler e atualizar todas as petições









