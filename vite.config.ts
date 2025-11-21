import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import apiRoutes from 'vite-plugin-api-routes';
import { fileURLToPath, URL } from 'node:url';

// Importar chaves locais (seguras) - apenas para desenvolvimento
let localKeys = { RESEND_API_KEY: '', APP_URL: 'http://localhost:5176' };
try {
  const keys = await import('./src/config/keys.local');
  localKeys = keys.LOCAL_KEYS;
} catch (error) {
  console.warn('⚠️ Arquivo keys.local.ts não encontrado. Emails desabilitados.');
}

// Verificar se está em modo produção
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),
    // Desabilitar apiRoutes em produção (não precisa do servidor no Vercel)
    ...(isProduction ? [] : [apiRoutes()]),
  ],
  server: {
    port: 5176,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: isProduction ? {
    // Em produção, usa variáveis de ambiente do Vercel ou valores padrão SEMPRE definidos
    // IMPORTANTE: Tratar strings vazias como undefined para que o fallback funcione
    'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
      (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_SERVICE_ROLE_KEY.trim() !== '') 
        ? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY 
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU'
    ),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL.trim() !== '') 
        ? process.env.VITE_SUPABASE_URL 
        : 'https://dmsodonmkffyvbuxtxec.supabase.co'
    ),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
      (process.env.VITE_SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY.trim() !== '') 
        ? process.env.VITE_SUPABASE_ANON_KEY 
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'
    ),
    'import.meta.env.VITE_RESEND_API_KEY': JSON.stringify(
      (process.env.VITE_RESEND_API_KEY && process.env.VITE_RESEND_API_KEY.trim() !== '') 
        ? process.env.VITE_RESEND_API_KEY 
        : ''
    ),
    'import.meta.env.VITE_APP_URL': JSON.stringify(
      (process.env.VITE_APP_URL && process.env.VITE_APP_URL.trim() !== '') 
        ? process.env.VITE_APP_URL 
        : 'https://veredictajus.vercel.app'
    ),
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(
      (process.env.VITE_STRIPE_PUBLISHABLE_KEY && process.env.VITE_STRIPE_PUBLISHABLE_KEY.trim() !== '') 
        ? process.env.VITE_STRIPE_PUBLISHABLE_KEY 
        : 'pk_live_51Ro45gLnE1r0oPJF03eTA26ztlbri5kwKETZYeMci6kETMGKDi1151vcrlPl0wsguTN1UDeutaHXiTcBX6r72Vnv00s4xPxkSd'
    ),
    'import.meta.env.VITE_STRIPE_SECRET_KEY': JSON.stringify(
      (process.env.VITE_STRIPE_SECRET_KEY && process.env.VITE_STRIPE_SECRET_KEY.trim() !== '') 
        ? process.env.VITE_STRIPE_SECRET_KEY 
        : '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'
    ),
  } : {
    // Em desenvolvimento, usa valores hardcoded ou do keys.local
    'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://dmsodonmkffyvbuxtxec.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'),
    'import.meta.env.VITE_RESEND_API_KEY': JSON.stringify(localKeys.RESEND_API_KEY),
    'import.meta.env.VITE_APP_URL': JSON.stringify(localKeys.APP_URL),
  },
});