# 🔍 Diagnóstico Completo do Realtime

## Passo 1: Execute o SQL no Supabase

Execute o arquivo `fix_realtime_completo.sql` no SQL Editor do Supabase. Ele vai:
- ✅ Verificar se as tabelas estão na publicação
- ✅ Adicionar tabelas que estão faltando
- ✅ Criar/atualizar policies RLS
- ✅ Mostrar relatório final

## Passo 2: Teste no Console do Navegador

Cole este código no console do navegador (F12 → Console):

```javascript
// Teste de conexão Realtime
const SUPABASE_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg';

console.log('🔍 Testando conexão Realtime...');

const ws = new WebSocket(
  `${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0`,
  ['realtime']
);

ws.onopen = () => {
  console.log('✅ WebSocket CONECTOU com sucesso!');
  console.log('📤 Enviando mensagem de teste...');
  
  // Enviar mensagem de join no canal
  ws.send(JSON.stringify({
    topic: 'realtime:public:messages',
    event: 'phx_join',
    payload: {},
    ref: '1'
  }));
};

ws.onerror = (event) => {
  console.error('❌ Erro no WebSocket:', event);
};

ws.onclose = (event) => {
  console.error('❌ WebSocket FECHADO:', {
    code: event.code,
    reason: event.reason || '(sem motivo)',
    wasClean: event.wasClean
  });
  
  // Códigos de erro comuns:
  if (event.code === 1006) {
    console.error('💡 Código 1006 = Conexão fechada sem handshake completo');
    console.error('💡 Possíveis causas:');
    console.error('   - Tabela não está na publicação supabase_realtime');
    console.error('   - Policies RLS bloqueando');
    console.error('   - Firewall/VPN bloqueando conexões wss://');
  } else if (event.code === 4001) {
    console.error('💡 Código 4001 = JWT inválido ou expirado');
  } else if (event.code === 4003) {
    console.error('💡 Código 4003 = Tópico não encontrado');
  }
};

ws.onmessage = (event) => {
  console.log('📨 Mensagem recebida:', JSON.parse(event.data));
};
```

## Passo 3: Verificar Resultados

### Se aparecer "✅ WebSocket CONECTOU":
- ✅ A conexão está funcionando!
- ✅ O problema pode estar no código do chat
- ✅ Verifique se `ChatService.setupRealtimeListener` está sendo chamado

### Se aparecer "❌ WebSocket FECHADO" com código 1006:
- ❌ O servidor está rejeitando a conexão
- ❌ Verifique se o SQL foi executado corretamente
- ❌ Verifique se há firewall/VPN bloqueando

### Se aparecer outro código de erro:
- Anote o código exato e a mensagem de erro
- Isso vai indicar exatamente qual é o problema

## Passo 4: Verificar no Supabase

Execute este SQL para verificar se as tentativas de conexão estão chegando:

```sql
-- Verificar tabelas na publicação
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversation_participants', 'conversations')
ORDER BY tablename;

-- Verificar policies RLS
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('messages', 'conversation_participants', 'conversations')
AND schemaname = 'public'
ORDER BY tablename, policyname;
```

## Próximos Passos

1. Execute o SQL `fix_realtime_completo.sql`
2. Execute o teste no console do navegador
3. Me envie o resultado do teste (código de erro, se houver)
4. Com essas informações, vou poder ajustar o código do chat se necessário




