import type { Handler } from 'vite-plugin-api-routes';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const REQUEST_TIMEOUT_MS = 15000;

const require = createRequire(import.meta.url);
const LOCAL_JSON_PATH = resolve(process.cwd(), 'src/config/firebaseAdmin.local.json');

type FirebaseAdminCredentials = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

async function loadFirebaseCredentials(): Promise<FirebaseAdminCredentials> {
  const creds: FirebaseAdminCredentials = {};

  if (existsSync(LOCAL_JSON_PATH)) {
    try {
      const json = require(LOCAL_JSON_PATH);
      creds.projectId = json.project_id || json.projectId || creds.projectId;
      creds.clientEmail = json.client_email || json.clientEmail || creds.clientEmail;
      creds.privateKey = json.private_key || json.privateKey || creds.privateKey;
    } catch (error) {
      console.warn('[list-firebase] Não foi possível ler firebaseAdmin.local.json:', error);
    }
  }

  if (!creds.projectId || !creds.clientEmail || !creds.privateKey) {
    try {
      const module = await import('@/config/firebaseAdmin.local');
      const localCreds = module.FIREBASE_ADMIN_CREDENTIALS || module.default;

      if (localCreds) {
        creds.projectId = creds.projectId || localCreds.projectId;
        creds.clientEmail = creds.clientEmail || localCreds.clientEmail;
        creds.privateKey = creds.privateKey || localCreds.privateKey;
      }
    } catch (error) {
      // Arquivo TS é opcional; ignorar se não existir
    }
  }

  if (process.env.FIREBASE_PROJECT_ID) {
    creds.projectId = process.env.FIREBASE_PROJECT_ID;
  }

  if (process.env.FIREBASE_CLIENT_EMAIL) {
    creds.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  }

  if (process.env.FIREBASE_PRIVATE_KEY) {
    creds.privateKey = process.env.FIREBASE_PRIVATE_KEY;
  }

  // Tentar carregar do arquivo FIREBASE_PRIVATE_KEY_VALUE.txt
  if (!creds.privateKey) {
    try {
      const keyPath = resolve(process.cwd(), 'FIREBASE_PRIVATE_KEY_VALUE.txt');
      if (existsSync(keyPath)) {
        const keyContent = readFileSync(keyPath, 'utf-8').trim();
        creds.privateKey = keyContent.replace(/\\n/g, '\n');
      }
    } catch (error) {
      console.warn('[list-firebase] Não foi possível ler FIREBASE_PRIVATE_KEY_VALUE.txt:', error);
    }
  }

  return creds;
}

let initializing: Promise<void> | null = null;

async function ensureFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }

  if (initializing) {
    return initializing;
  }

  initializing = (async () => {
    const { projectId, clientEmail, privateKey } = await loadFirebaseCredentials();

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials are not configured');
    }

    const normalizedKey = privateKey
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/^\s+/gm, '')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: normalizedKey,
      }),
    });
  })();

  return initializing;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmsodonmkffyvbuxtxec.supabase.co';
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.rAZtnLj7DQ3avaS_awiyptwBiTW_7vcAJVLqVuzrstU';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const GET: Handler = async (req, res) => {
  try {
    await ensureFirebaseAdmin();

    // Listar todos os usuários do Firebase
    const listUsersResult = await admin.auth().listUsers(1000);
    const firebaseUsers = listUsersResult.users;

    console.log(`[list-firebase] Encontrados ${firebaseUsers.length} usuários no Firebase`);

    // Buscar perfis correspondentes no Supabase
    const supabase = getSupabaseClient();
    const firebaseUids = firebaseUsers.map(u => u.uid);

    // Buscar perfis usando firebase_uid
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('firebase_uid', firebaseUids);

    if (profilesError) {
      console.warn('[list-firebase] Erro ao buscar perfis:', profilesError);
    }

    // Criar um mapa de firebase_uid -> perfil
    const profileMap = new Map();
    (profiles || []).forEach(profile => {
      if (profile.firebase_uid) {
        profileMap.set(profile.firebase_uid, profile);
      }
    });

    // Combinar dados do Firebase com perfis do Supabase
    const users = firebaseUsers.map(fbUser => {
      const profile = profileMap.get(fbUser.uid) || {};
      
      // Determinar role do perfil ou do metadata do Firebase
      const roleRaw = String(profile.role || fbUser.customClaims?.role || '').toUpperCase();
      const role = roleRaw === 'CLIENT' ? 'CLIENT' :
                   roleRaw === 'WRITER' ? 'WRITER' :
                   roleRaw === 'ADMIN' ? 'ADMIN' : 'UNKNOWN';

      // Determinar nome
      const name = profile.full_name || 
                   fbUser.displayName || 
                   fbUser.customClaims?.full_name ||
                   fbUser.email?.split('@')[0] || 
                   '—';

      // Status baseado em suspensão/bloqueio
      const now = new Date();
      const isBlocked = profile.is_blocked || false;
      const suspendedUntil = profile.suspended_until;
      const suspendedUntilDate = suspendedUntil ? new Date(suspendedUntil) : null;
      const isSuspended = suspendedUntilDate ? now < suspendedUntilDate : false;

      let statusUI: 'active' | 'pending' | 'suspended' | 'blocked' | 'unknown';
      if (isBlocked) {
        statusUI = 'blocked';
      } else if (isSuspended) {
        statusUI = 'suspended';
      } else {
        statusUI = profile.status === 'approved' ? 'active' : 
                   profile.status === 'pending_approval' ? 'pending' : 'active';
      }

      return {
        id: profile.id || fbUser.uid,
        firebase_uid: fbUser.uid,
        name,
        email: fbUser.email || null,
        role,
        created_at: profile.created_at || (fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).toISOString() : null),
        statusUI,
        verifUI: profile.verification_status === 'verified' ? 'verified' :
                 profile.verification_status === 'pending' ? 'pending' :
                 profile.verification_status === 'rejected' ? 'rejected' : 'unknown',
        isBlocked,
        suspendedUntil: profile.suspended_until || null,
        suspensionReason: profile.suspension_reason || null,
        totalLateDeliveries: profile.total_late_deliveries || 0,
        suspensionType: profile.suspension_type || null,
        averageRating: profile.average_rating ? parseFloat(profile.average_rating) : null,
        totalRatings: profile.total_ratings || 0,
        _raw: {
          ...profile,
          firebase_user: {
            uid: fbUser.uid,
            email: fbUser.email,
            emailVerified: fbUser.emailVerified,
            disabled: fbUser.disabled,
            metadata: fbUser.metadata,
          },
        },
      };
    });

    // Ordenar por data de criação (mais recentes primeiro)
    users.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return res.json({
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error('[list-firebase] Erro:', error);
    return res.status(500).json({
      error: 'Erro ao listar usuários',
      message: error.message,
    });
  }
};

