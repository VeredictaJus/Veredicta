// DIAGNÓSTICO COMPLETO DO SISTEMA DE CHAT
// Execute este script no console do navegador para diagnosticar problemas

console.log('🔍 === DIAGNÓSTICO COMPLETO DO CHAT ===');

// 1. Verificar se o ChatProvider está montado
const chatProvider = document.querySelector('[data-chat-provider]');
console.log('1. ChatProvider montado:', !!chatProvider);

// 2. Verificar contexto React (se disponível)
if (window.React) {
  console.log('2. React disponível:', !!window.React);
}

// 3. Verificar se há elementos de chat na página
const conversationsList = document.querySelector('[data-conversations-list]');
const chatWindow = document.querySelector('[data-chat-window]');
console.log('3. Elementos de chat encontrados:', {
  conversationsList: !!conversationsList,
  chatWindow: !!chatWindow
});

// 4. Verificar erros no console
console.log('4. Verifique se há erros no console acima');

// 5. Verificar estado do localStorage/sessionStorage
console.log('5. Storage:', {
  localStorage: Object.keys(localStorage).filter(k => k.includes('chat') || k.includes('supabase')),
  sessionStorage: Object.keys(sessionStorage).filter(k => k.includes('chat') || k.includes('supabase'))
});

// 6. Verificar se há requisições de rede falhando
console.log('6. Verifique a aba Network para requisições falhando');

// 7. Verificar se há elementos de loading
const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
console.log('7. Elementos de loading encontrados:', loadingElements.length);

// 8. Verificar se há mensagens de erro na UI
const errorElements = document.querySelectorAll('[class*="error"], [class*="red-500"]');
console.log('8. Elementos de erro na UI:', errorElements.length);

console.log('🔍 === FIM DO DIAGNÓSTICO ===');
console.log('📋 AÇÕES RECOMENDADAS:');
console.log('1. Verifique se há erros no console');
console.log('2. Verifique a aba Network para requisições falhando');
console.log('3. Verifique se o usuário está logado');
console.log('4. Verifique se há problemas de CORS');
console.log('5. Verifique se o Supabase está configurado corretamente');
























