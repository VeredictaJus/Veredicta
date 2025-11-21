// 🚀 SCRIPT DE DEBUG PARA BUSCAR CONVERSAS NO SUPABASE
// Execute no console do navegador (F12)

// 1. Configurações do Supabase (substitua pelas suas)
const SUPABASE_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjQwMDAsImV4cCI6MjA1MDIwMDAwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Substitua pela sua chave

// 2. Função para buscar conversas
async function debugConversas() {
  try {
    console.log('🔍 Buscando conversas no Supabase...');
    
    // Buscar todas as conversas
    const response = await fetch(`${SUPABASE_URL}/rest/v1/conversations?select=*&order=created_at.desc&limit=20`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const conversas = await response.json();
    console.log('✅ Conversas encontradas:', conversas);
    
    // Mostrar resumo
    console.log(`📊 Total de conversas: ${conversas.length}`);
    conversas.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.title} (${conv.type}) - ${conv.status} - Criada: ${new Date(conv.created_at).toLocaleString()}`);
    });
    
    return conversas;
    
  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
  }
}

// 3. Função para buscar conversas de um usuário específico
async function debugConversasUsuario(userId) {
  try {
    console.log(`🔍 Buscando conversas do usuário: ${userId}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/conversations?select=*&created_by=eq.${userId}&order=updated_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const conversas = await response.json();
    console.log('✅ Conversas do usuário:', conversas);
    return conversas;
    
  } catch (error) {
    console.error('❌ Erro ao buscar conversas do usuário:', error);
  }
}

// 4. Função para verificar mensagens de uma conversa
async function debugMensagensConversa(conversationId) {
  try {
    console.log(`🔍 Buscando mensagens da conversa: ${conversationId}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&conversation_id=eq.${conversationId}&order=created_at.desc&limit=50`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const mensagens = await response.json();
    console.log('✅ Mensagens da conversa:', mensagens);
    console.log(`📊 Total de mensagens: ${mensagens.length}`);
    return mensagens;
    
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
  }
}

// 5. Função para verificar participantes de uma conversa
async function debugParticipantesConversa(conversationId) {
  try {
    console.log(`🔍 Buscando participantes da conversa: ${conversationId}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/conversation_participants?select=*&conversation_id=eq.${conversationId}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const participantes = await response.json();
    console.log('✅ Participantes da conversa:', participantes);
    return participantes;
    
  } catch (error) {
    console.error('❌ Erro ao buscar participantes:', error);
  }
}

// 6. Função completa de debug
async function debugCompleto() {
  console.log('🚀 INICIANDO DEBUG COMPLETO DO CHAT');
  console.log('=====================================');
  
  // Buscar conversas
  const conversas = await debugConversas();
  
  if (conversas && conversas.length > 0) {
    console.log('\n📋 ANALISANDO PRIMEIRA CONVERSA...');
    const primeiraConversa = conversas[0];
    
    // Buscar mensagens
    await debugMensagensConversa(primeiraConversa.id);
    
    // Buscar participantes
    await debugParticipantesConversa(primeiraConversa.id);
  }
  
  console.log('\n✅ DEBUG COMPLETO FINALIZADO');
}

// 7. Executar debug
console.log('🔧 Script de debug carregado!');
console.log('Execute uma das funções:');
console.log('- debugConversas() - Buscar todas as conversas');
console.log('- debugConversasUsuario("user-id") - Buscar conversas de um usuário');
console.log('- debugMensagensConversa("conversation-id") - Buscar mensagens');
console.log('- debugCompleto() - Debug completo');
console.log('');
console.log('🚀 Executando debug completo...');
debugCompleto();
























