// Script para criar conta de admin usando Firebase Admin SDK
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações
const ADMIN_EMAIL = 'contato@veredictajus.com';
const ADMIN_PASSWORD = '02091996nY@';
const ADMIN_ROLE = 'admin';

// Configurações do Supabase
const SUPABASE_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU';

// Configurações do Firebase
const FIREBASE_PROJECT_ID = 'veredicta-85b8c';
const FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@veredicta-85b8c.iam.gserviceaccount.com';

// Carregar chave privada do Firebase
function loadFirebasePrivateKey() {
  try {
    // Tentar carregar do arquivo FIREBASE_PRIVATE_KEY_VALUE.txt
    const keyPath = resolve(__dirname, 'FIREBASE_PRIVATE_KEY_VALUE.txt');
    const keyContent = readFileSync(keyPath, 'utf-8').trim();
    
    // Remover quebras de linha extras e normalizar
    const privateKey = keyContent
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    
    return privateKey;
  } catch (error) {
    console.error('❌ Erro ao carregar chave privada do Firebase:', error.message);
    
    // Tentar variável de ambiente como fallback
    if (process.env.FIREBASE_PRIVATE_KEY) {
      return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    
    throw new Error('Não foi possível carregar a chave privada do Firebase');
  }
}

// Inicializar Firebase Admin
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin já inicializado');
    return admin.app();
  }

  const privateKey = loadFirebasePrivateKey();

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin inicializado com sucesso');
    return admin.app();
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error);
    throw error;
  }
}

// Criar usuário no Firebase
async function createFirebaseUser(email, password) {
  try {
    console.log(`📝 Criando usuário no Firebase: ${email}`);
    
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true, // Marcar email como verificado
      disabled: false,
    });

    console.log('✅ Usuário criado no Firebase:', userRecord.uid);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ Usuário já existe no Firebase, buscando...');
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log('✅ Usuário encontrado:', userRecord.uid);
      
      // Atualizar senha se necessário
      try {
        await admin.auth().updateUser(userRecord.uid, {
          password: password,
          emailVerified: true,
        });
        console.log('✅ Senha atualizada no Firebase');
      } catch (updateError) {
        console.warn('⚠️ Não foi possível atualizar a senha:', updateError.message);
      }
      
      return userRecord;
    }
    throw error;
  }
}

// Criar perfil no Supabase
async function createSupabaseProfile(firebaseUid, email, role) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    console.log(`📝 Criando perfil no Supabase para: ${email}`);
    
    // Tentar usar a função RPC primeiro
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_or_update_user_profile', {
      p_firebase_uid: firebaseUid,
      p_email: email,
      p_role: role,
      p_full_name: null,
      p_company_name: null,
      p_cnpj: null,
      p_phone: null,
      p_address: null,
    });

    if (!rpcError && rpcData) {
      console.log('✅ Perfil criado/atualizado via RPC:', rpcData);
      
      // Garantir que o role está correto
      if (rpcData.role !== role) {
        console.log('🔄 Corrigindo role no perfil...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            role: role,
            status: 'approved',
            verification_status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('firebase_uid', firebaseUid);
        
        if (updateError) {
          console.warn('⚠️ Erro ao corrigir role:', updateError.message);
        } else {
          console.log('✅ Role corrigido com sucesso');
        }
      }
      
      return rpcData;
    }

    // Se RPC falhar, tentar inserção direta
    console.log('⚠️ RPC falhou, tentando inserção direta...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert({
        firebase_uid: firebaseUid,
        email: email,
        role: role,
        status: 'approved',
        verification_status: 'verified',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'firebase_uid',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Perfil criado/atualizado diretamente:', insertData);
    return insertData;
  } catch (error) {
    console.error('❌ Erro ao criar perfil no Supabase:', error);
    throw error;
  }
}

// Função principal
async function createAdminUser() {
  try {
    console.log('🚀 Iniciando criação de conta de admin...\n');

    // 1. Inicializar Firebase Admin
    initializeFirebaseAdmin();

    // 2. Criar usuário no Firebase
    const firebaseUser = await createFirebaseUser(ADMIN_EMAIL, ADMIN_PASSWORD);

    // 3. Criar perfil no Supabase
    const profile = await createSupabaseProfile(firebaseUser.uid, ADMIN_EMAIL, ADMIN_ROLE);

    console.log('\n✅ Conta de admin criada com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Senha:', ADMIN_PASSWORD);
    console.log('👤 Role:', ADMIN_ROLE);
    console.log('🆔 Firebase UID:', firebaseUser.uid);
    console.log('📊 Perfil ID:', profile.id || profile.firebase_uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar conta de admin:', error);
    process.exit(1);
  }
}

// Executar
createAdminUser();

