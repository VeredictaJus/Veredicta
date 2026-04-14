import type { Handler } from 'vite-plugin-api-routes';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

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
    } catch {
      // ignore
    }
  }

  if (process.env.FIREBASE_PROJECT_ID) creds.projectId = process.env.FIREBASE_PROJECT_ID;
  if (process.env.FIREBASE_CLIENT_EMAIL) creds.clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (process.env.FIREBASE_PRIVATE_KEY) creds.privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!creds.privateKey) {
    try {
      const keyPath = resolve(process.cwd(), 'FIREBASE_PRIVATE_KEY_VALUE.txt');
      if (existsSync(keyPath)) {
        const keyContent = readFileSync(keyPath, 'utf-8').trim();
        creds.privateKey = keyContent.replace(/\\n/g, '\n');
      }
    } catch {
      // ignore
    }
  }

  return creds;
}

let initializing: Promise<void> | null = null;
async function ensureFirebaseAdmin() {
  if (admin.apps.length) return;
  if (initializing) return initializing;

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

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role is not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hasOwn(row: Record<string, any> | null, key: string) {
  return Boolean(row && Object.prototype.hasOwnProperty.call(row, key));
}

export const POST: Handler = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || '').trim();
    const phone = String(body.phone || '').trim();
    const origin = String(body.origin || 'qr_code').trim().toLowerCase();

    if (!email || !fullName || !phone) {
      return res.status(400).json({ error: 'full_name, email e phone são obrigatórios' });
    }

    await ensureFirebaseAdmin();
    const supabase = getSupabaseServiceClient();

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      if (userRecord.disabled) {
        await admin.auth().updateUser(userRecord.uid, { disabled: false, displayName: fullName });
        userRecord = await admin.auth().getUser(userRecord.uid);
      }
    } catch (error: any) {
      const code = String(error?.code || '');
      if (!code.includes('auth/user-not-found')) throw error;
      userRecord = await admin.auth().createUser({
        email,
        emailVerified: false,
        disabled: false,
        displayName: fullName,
      });
    }

    const firebaseUid = userRecord.uid;
    const rpcParams = {
      p_firebase_uid: firebaseUid,
      p_email: email,
      p_role: 'client',
      p_full_name: fullName || null,
      p_company_name: null,
      p_cnpj: null,
      p_phone: phone || null,
      p_address: null,
    };

    const { error: profileRpcError } = await supabase.rpc('create_or_update_user_profile', rpcParams as any);
    if (profileRpcError) {
      await supabase
        .from('user_profiles')
        .upsert(
          {
            firebase_uid: firebaseUid,
            email,
            role: 'client',
            full_name: fullName || null,
            phone: phone || null,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'firebase_uid' }
        );
    }

    const { data: profileRow } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    const profilePatch: Record<string, any> = {
      full_name: fullName,
      phone,
      updated_at: new Date().toISOString(),
    };
    if (hasOwn(profileRow as any, 'is_trial')) profilePatch.is_trial = true;
    if (hasOwn(profileRow as any, 'trial_petition_used')) profilePatch.trial_petition_used = false;
    if (hasOwn(profileRow as any, 'regularization_required')) profilePatch.regularization_required = false;
    if (hasOwn(profileRow as any, 'trial_origin')) profilePatch.trial_origin = origin;
    if (hasOwn(profileRow as any, 'trial_started_at')) profilePatch.trial_started_at = new Date().toISOString();

    await supabase.from('user_profiles').update(profilePatch).eq('firebase_uid', firebaseUid);

    const farFuture = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: firebaseUid,
          plan_code: 'concierge',
          status: 'active',
          next_billing_date: farFuture,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    await admin.auth().setCustomUserClaims(firebaseUid, { role: 'client', trial: true });
    const customToken = await admin.auth().createCustomToken(firebaseUid, { role: 'client', trial: true });

    return res.status(200).json({ success: true, uid: firebaseUid, custom_token: customToken });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao criar acesso trial', details: error?.message || String(error) });
  }
};

export default POST;

