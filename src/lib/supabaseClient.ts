import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/firebase';

// Valores padrão (fallback) garantem que sempre funcionem
const DEFAULT_SUPABASE_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg';

// Função helper para verificar se uma variável tem valor válido
function getEnvValue(envVar: string | undefined, defaultValue: string): string {
  if (!envVar || envVar.trim() === '' || envVar === 'undefined' || envVar === 'null') {
    return defaultValue;
  }
  return envVar;
}

// Usar variáveis de ambiente se existirem e tiverem valor válido, senão usar valores padrão
const supabaseUrl = getEnvValue(import.meta.env.VITE_SUPABASE_URL, DEFAULT_SUPABASE_URL);
const supabaseAnonKey = getEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis do Supabase não carregaram. Confira seu .env (VITE_*)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'veredicta.supabase.auth',
  },
  global: {
    headers: {
      Accept: 'application/json',
    },
    // ✅ Bridge Firebase -> Supabase:
    // Injeta Authorization: Bearer <firebase_id_token> nas requests do Supabase
    // para que RLS baseado em auth.uid() funcione com Firebase Auth.
    fetch: async (url, options = {}) => {
      try {
        const token = await auth.currentUser?.getIdToken?.();
        const headers = new Headers((options as any).headers || {});
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(url, { ...(options as any), headers });
        
        // ✅ CORREÇÃO: Suprimir erros 406/400 APENAS para queries GET de notificações
        // (algumas telas usam .single() em leitura opcional e geram PGRST116).
        if ((response.status === 406 || response.status === 400) && (!options.method || options.method === 'GET')) {
          const urlString = typeof url === 'string' ? url : url.toString();
          
          // Verificar se é uma requisição crítica
          const isAuthRequest = urlString.includes('/auth/') || urlString.includes('/rest/v1/auth');
          const isRealtimeRequest = urlString.includes('/realtime/');
          
          // Apenas suprimir erros em queries de leitura NÃO-CRÍTICAS (notificações)
          if (!isAuthRequest && !isRealtimeRequest) {
            // Limitar supressão ao endpoint de notificações (evitar mascarar falhas em user_profiles, etc.)
            const isNotificationQuery =
              urlString.includes('/rest/v1/app_2d8133c678_notifications') ||
              urlString.includes('app_2d8133c678_notifications') ||
              urlString.includes('/rest/v1/notifications');
            
            if (isNotificationQuery) {
              if (import.meta.env.DEV) {
                console.warn(`⚠️ [Supabase] Erro ${response.status} suprimido em query de leitura:`, urlString.substring(0, 100));
              }
              // Retornar resposta vazia para não quebrar a aplicação
              return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }
        }
        
        return response;
      } catch (error) {
        // ✅ CORREÇÃO: Tratar erros de rede silenciosamente apenas em modo produção
        if (import.meta.env.DEV) {
          console.warn('⚠️ [Supabase] Erro de rede:', error);
        }
        // Em produção, deixar o erro propagar para tratamento adequado
        throw error;
      }
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

if (typeof window !== 'undefined') {
  (window as any).__supabase = supabase;
}