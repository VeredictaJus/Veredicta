import { supabase } from './supabase';

export async function testarSupabase() {
  console.log('🔍 Testando conexão com Supabase...');

  const { data, error } = await supabase
    .from('app_d379dcb283_messages') // tabela de mensagens
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Erro ao conectar no Supabase:', error.message);
  } else {
    console.log('✅ Conexão bem-sucedida! Exemplo de dados:', data);
  }
}
