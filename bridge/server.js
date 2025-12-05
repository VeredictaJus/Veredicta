// bridge/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import Stripe from 'stripe'
import { Resend } from 'resend'

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
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true)
    }
    // Permitir origens da lista ou qualquer origem em desenvolvimento
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
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
app.options('/api/send-email', cors())
app.options('/api/auth/password-reset-link', cors())

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

    const defaultRedirect = `${process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:5176'}/#/auth/reset-password`
    const actionCodeSettings = {
      url: redirectTo || defaultRedirect,
      handleCodeInApp: true
    }

    console.log(`📡 [password-reset-link] Gerando link para: ${email}`)
    console.log(`📡 [password-reset-link] Redirect URL: ${actionCodeSettings.url}`)

    const firebaseResetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings)

    console.log('✅ Link de reset gerado com sucesso para', email)
    console.log(`✅ Link do Firebase: ${firebaseResetLink.substring(0, 80)}...`)

    // Extrair o oobCode do link do Firebase e construir link customizado para o site
    let customResetLink = firebaseResetLink
    try {
      const firebaseUrl = new URL(firebaseResetLink)
      const oobCode = firebaseUrl.searchParams.get('oobCode')
      const mode = firebaseUrl.searchParams.get('mode') || 'resetPassword'
      
      if (oobCode) {
        const appPublicUrl = process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || 'https://www.veredictajus.com.br'
        const customUrl = new URL(`${appPublicUrl}/#/auth/reset-password`)
        customUrl.searchParams.set('oobCode', oobCode)
        customUrl.searchParams.set('mode', mode)
        customResetLink = customUrl.toString()
        console.log(`✅ Link customizado criado: ${customResetLink.substring(0, 80)}...`)
      }
    } catch (urlError) {
      console.warn('⚠️ Erro ao construir link customizado, usando link do Firebase:', urlError)
    }

    // Enviar email customizado via Resend
    try {
      const resendApiKey = getResendApiKey()
      
      if (!resendApiKey) {
        console.warn('⚠️ RESEND_API_KEY não configurada, apenas retornando link')
        return res.json({ resetLink: customResetLink })
      }

      const resend = new Resend(resendApiKey)

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Redefinição de Senha</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Veredicta</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${customResetLink}" style="display: inline-block; background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
            </div>
            <p style="font-size: 14px; color: #666;">Ou copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${customResetLink}</p>
            <div style="background: #fef3c7; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0 0; padding-left: 20px;">
                <li>Este link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
              </ul>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Se você não solicitou esta redefinição, pode ignorar este email com segurança.
            </p>
            <p style="margin-top: 30px;">
              Atenciosamente,<br>
              <strong style="color: #ea580c;">Equipe Veredicta</strong>
            </p>
          </div>
        </body>
        </html>
      `

      await resend.emails.send({
        from: 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
        to: [email],
        subject: '🔐 Redefinição de Senha - Veredicta',
        html: emailHtml,
      })

      console.log('✅ Email customizado enviado com sucesso via Resend')
      
      return res.json({ 
        success: true,
        message: 'Link de redefinição de senha enviado por email',
        resetLink: customResetLink // Retornar o link customizado
      })
    } catch (emailError) {
      console.error('❌ Erro ao enviar email customizado:', emailError)
      // Mesmo se falhar o email, retornar o link para o frontend enviar
      return res.json({ 
        resetLink: customResetLink,
        warning: 'Link gerado, mas falha ao enviar email customizado'
      })
    }
  } catch (error) {
    console.error('❌ Erro ao gerar link de reset:', error)
    
    // Se o email não existe, retornar sucesso por segurança
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ 
        success: true,
        message: 'Se este email estiver cadastrado, você receberá um link de redefinição de senha.'
      })
    }
    
    return res.status(500).json({ 
      error: 'Não foi possível gerar o link de reset',
      details: error.message 
    })
  }
})

// ======================
// 📧 SEND EMAIL (Resend)
// ======================
function getResendApiKey() {
  return process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || ''
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from, replyTo } = req.body || {}

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      })
    }

    const apiKey = getResendApiKey()
    
    if (!apiKey) {
      console.error('❌ API key do Resend não encontrada')
      return res.status(500).json({ 
        error: 'Email service not configured',
        message: 'RESEND_API_KEY not found in environment variables'
      })
    }

    const resend = new Resend(apiKey)

    const resendPayload = {
      from: from || 'Veredicta - Plataforma de Petições Jurídicas <contato@veredictajus.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    }

    if (replyTo) {
      resendPayload.reply_to = replyTo
    }

    const { data, error } = await resend.emails.send(resendPayload)

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: error 
      })
    }

    console.log('✅ Email enviado com sucesso via Resend:', data)

    return res.json({ 
      success: true, 
      data 
    })

  } catch (error) {
    console.error('❌ Erro geral ao enviar email:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// ======================
// 🚀 START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`✅ Bridge rodando em http://localhost:${PORT}`)
  console.log(`🔓 CORS permitido para: ${ALLOWED_ORIGINS.join(', ')}`)
})