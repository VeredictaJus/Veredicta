import type { Handler } from 'vite-plugin-api-routes';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
      console.warn('[email-confirmation-link] Não foi possível ler firebaseAdmin.local.json:', error);
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

    console.log('[email-confirmation-link] Inicializando Firebase Admin', {
      projectId,
      clientEmail,
      keyLength: normalizedKey.length,
      sample: `${normalizedKey.split('\n')[0]} ... ${normalizedKey.split('\n').slice(-1)[0]}`,
    });

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

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const POST: Handler = async (req, res) => {
  const requestId = uuid();

  try {
    await ensureFirebaseAdmin();

    const { email, redirectTo } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    const startedAt = Date.now();
    console.log(`[email-confirmation-link][${requestId}] recebendo request`);

    const defaultRedirect = `${process.env.APP_PUBLIC_URL || 'http://localhost:5176'}/#/auth/email-confirmed`;
    const actionCodeSettings = {
      url: redirectTo || defaultRedirect,
      handleCodeInApp: true,
    };

    console.log(`[email-confirmation-link][${requestId}] gerando link para ${email}`);

    const link = await Promise.race([
      admin.auth().generateEmailVerificationLink(email, actionCodeSettings),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao gerar link com Firebase Admin')), REQUEST_TIMEOUT_MS),
      ),
    ]);

    console.log(`[email-confirmation-link][${requestId}] link gerado em ${Date.now() - startedAt}ms`);

    return res.status(200).json({ confirmationLink: link });
  } catch (error: any) {
    console.error(`[email-confirmation-link][${requestId}] erro:`, error);

    const message = error?.message || 'Não foi possível gerar o link de confirmação';
    const status = message.includes('Timeout') ? 504 : 500;

    return res.status(status).json({ error: message });
  }
};

export default POST;






