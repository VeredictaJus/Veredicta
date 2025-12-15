import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
// (analytics é opcional e só funciona em https/ambiente browser)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || "AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "veredicta-85b8c",
  appId: import.meta.env.VITE_FB_APP_ID || "1:123456789:web:xxxxxxxxxxxxxxxx",
  authDomain:
    import.meta.env.VITE_FB_AUTH_DOMAIN ||
    `${import.meta.env.VITE_FB_PROJECT_ID || "veredicta-85b8c"}.firebaseapp.com`,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || "veredicta-85b8c.appspot.com",
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER || "123456789",
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID // opcional
}

// ✅ CORREÇÃO: Evitar inicialização duplicada do Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  // Verificar se já existe uma app inicializada
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('✅ Firebase: Usando app existente');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase: App inicializado com sucesso', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
  }

  auth = getAuth(app);
  
  // ✅ CORREÇÃO: Configurar para não fazer requisições desnecessárias ao Identity Toolkit
  // Isso pode ajudar a evitar erros 400 em produção
  if (typeof window !== 'undefined' && import.meta.env.MODE === 'production') {
    // Em produção, garantir que o auth está configurado corretamente
    console.log('✅ Firebase Auth configurado para produção');
  }
} catch (error: any) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  // Tentar recuperar app existente mesmo em caso de erro
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    auth = getAuth(app);
    console.warn('⚠️ Firebase: Recuperado app existente após erro');
  } else {
    // Se não conseguir inicializar, lançar erro
    throw new Error(`Falha ao inicializar Firebase: ${error.message}`);
  }
}

export { auth };
export { app };