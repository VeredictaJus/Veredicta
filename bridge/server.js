// bridge/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import Stripe from 'stripe'

// ======================
// ⚙️ CONFIGURAÇÕES INICIAIS
// ======================
dotenv.config()

const PORT = process.env.PORT || 3001
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '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'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5176'
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176').split(',')

if (!SUPABASE_JWT_SECRET) {
  console.error('❌ Erro: SUPABASE_JWT_SECRET ausente no .env')
  process.exit(1)
}

// ======================
// 💳 STRIPE SETUP
// ======================
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

const PLAN_PRICES = {
  'start': 52000,   // R$ 520.00 em centavos
  'pro': 168000,    // R$ 1.680.00 em centavos
  'elite': 700000,  // R$ 7.000.00 em centavos
  'test': 100       // R$ 1.00 em centavos (plano de teste)
}

// ======================
// 🔐 FIREBASE ADMIN SDK
// ======================
if (!admin.apps.length) {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
    console.log('✅ Firebase Admin inicializado com sucesso')
  } catch (err) {
    console.error('❌ Erro ao inicializar Firebase Admin:', err)
    process.exit(1)
  }
}

// ======================
// 🚀 EXPRESS APP
// ======================
const app = express()

// ======================
// 🧠 CONFIGURAÇÃO DE CORS (primeiro middleware!)
// ======================
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    console.warn(`🚫 CORS bloqueou origem não autorizada: ${origin}`)
    return callback(new Error('CORS: origem não permitida'))
  },
  credentials: false,
}

app.use(cors(corsOptions)) // ✅ aplica o CORS corretamente
app.options('/session', cors(corsOptions)) // ✅ habilita o preflight sem erro

// ✅ Lida explicitamente com preflight requests (OPTIONS)
app.options('/session', cors())
app.options('/health', cors())

// Segurança e parsing
app.use(helmet())
app.use(express.json())

// ======================
// ⚡ RATE LIMIT
// ======================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,             // 60 requisições por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// ======================
// 🩺 HEALTHCHECK
// ======================
app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }))

// ======================
// 💳 STRIPE CHECKOUT ENDPOINT
// ======================
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { plan, include_free_bonus, user_id } = req.body

    console.log('📦 Criando sessão Stripe para:', { plan, include_free_bonus, user_id })

    if (!plan || !user_id) {
      return res.status(400).json({ error: 'Plano e user_id são obrigatórios' })
    }

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Plano não encontrado' })
    }

    const price = PLAN_PRICES[plan]
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1)

    // Criar sessão no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${planName}`,
              description: `Assinatura do plano ${planName} para Veredicta`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/client?payment=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}&free_bonus=${include_free_bonus ? 'true' : 'false'}`,
      cancel_url: `${FRONTEND_URL}/client/plans?payment=cancelled`,
      metadata: {
        plan: plan,
        include_free_bonus: include_free_bonus ? 'true' : 'false',
        userId: user_id,
      },
      client_reference_id: user_id,
    })

    console.log('✅ Sessão Stripe criada:', session.id)
    res.json({ url: session.url })
    
  } catch (error) {
    console.error('❌ Erro ao criar sessão Stripe:', error.message)
    res.status(500).json({ error: 'Erro ao criar sessão de checkout', details: error.message })
  }
})

// ======================
// 🔑 ENDPOINT /session
// ======================
/**
 * POST /session
 * Body: { idToken: string }
 * 1) Valida o idToken do Firebase via Admin SDK
 * 2) Cria e retorna um JWT compatível com o Supabase
 */
app.post('/session', async (req, res) => {
  try {
    const { idToken } = req.body || {}

    if (!idToken) {
      return res.status(400).json({ error: 'idToken ausente no corpo da requisição' })
    }

    // 🔍 Valida o token do Firebase
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    if (!uid) {
      return res.status(401).json({ error: 'UID inválido no token Firebase' })
    }

    // 🔐 Cria o JWT compatível com Supabase
    const token = jwt.sign(
      {
        sub: uid,
        role: 'authenticated',
        email: decoded.email || '',
        aud: 'authenticated',
      },
      SUPABASE_JWT_SECRET,
      { expiresIn: '1h' }
    )

    console.log(`✅ Novo token emitido para UID: ${uid}`)
    return res.json({ token })
  } catch (err) {
    console.error('❌ Erro no endpoint /session:', err)
    return res.status(401).json({ error: 'idToken inválido ou expirado' })
  }
})

// ======================
// 🔐 PASSWORD RESET LINK
// ======================
app.post('/api/auth/password-reset-link', async (req, res) => {
  try {
    const { email, redirectTo } = req.body || {}

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' })
    }

    const defaultRedirect = `${process.env.APP_PUBLIC_URL || 'http://localhost:5176'}/#/auth/reset-password`
    const actionCodeSettings = {
      url: redirectTo || defaultRedirect,
      handleCodeInApp: true
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings)

    console.log('✅ Link de reset gerado com sucesso para', email)

    return res.json({ resetLink })
  } catch (error) {
    console.error('❌ Erro ao gerar link de reset:', error)
    return res.status(500).json({ error: 'Não foi possível gerar o link de reset' })
  }
})

// ======================
// 🚀 START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`✅ Bridge rodando em http://localhost:${PORT}`)
  console.log(`🔓 CORS permitido para: ${ALLOWED_ORIGINS.join(', ')}`)
})