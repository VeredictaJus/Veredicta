// server/bridge.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

const app = express();
app.use(express.json());

// CORS: libere seu app local (ajuste a URL se necessário)
const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));

// ---- Firebase Admin (validação do idToken do usuário) ----
if (!admin.apps.length) {
  // Dois jeitos de inicializar: por GOOGLE_APPLICATION_CREDENTIALS (arquivo .json)
  // ou por variáveis FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
  const hasFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (hasFile) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // IMPORTANTE: private key precisa com \n escapado no .env (entre aspas)
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

// ---- Supabase: assinar um JWT com o segredo do seu projeto ----
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
if (!SUPABASE_JWT_SECRET) {
  console.error('Faltou SUPABASE_JWT_SECRET no .env');
  process.exit(1);
}

app.get('/health', (_req, res) => res.json({ ok: true }));

// Recebe { idToken } do frontend, valida no Firebase e devolve um JWT do Supabase
app.post('/session', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'idToken ausente' });

    // Valida o idToken e extrai o uid
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Gera o JWT do Supabase com o "role" authenticated e subject = uid
    const token = jwt.sign(
      {
        role: 'authenticated',
        iss: 'supabase',
        sub: uid,                 // importante: subject = uid
        aud: 'authenticated',
      },
      SUPABASE_JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (e) {
    console.error('Erro no /session:', e);
    res.status(401).json({ error: 'token inválido' });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`🔐 Bridge rodando em http://localhost:${PORT}`);
  console.log(`CORS liberado para: ${origin}`);
});