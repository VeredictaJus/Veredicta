// ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001, path: '/ws' });

console.log('✅ Servidor WebSocket rodando em ws://localhost:3001/ws');

wss.on('connection', function connection(ws) {
  console.log('🔌 Novo cliente conectado');

  ws.on('message', function incoming(message) {
    console.log('📩 Mensagem recebida:', message.toString());

    wss.clients.forEach(function each(client) {
  if (client.readyState === WebSocket.OPEN) {
    // Se `message` não for string, converta para string
    const msgString = typeof message === 'string' ? message : message.toString();
    client.send(msgString);
  }
});

  ws.on('close', () => {
    console.log('❌ Cliente desconectado');
  });
});
