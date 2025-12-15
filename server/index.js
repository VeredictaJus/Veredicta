import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'

const app = express()
const PORT = process.env.PORT || 3001
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET

if (!SUPABASE_JWT_SECRET) {
  console.error('❌ Faltou SUPABASE_JWT_SECRET no server/.env')
  process.exit(1)
}

// 🔐 Firebase
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  })
  console.log('✅ Firebase Admin inicializado com sucesso')
} catch (error) {
  console.error('❌ Firebase Admin init falhou:', error)
  process.exit(1)
}

// 🔓 CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`🚫 CORS bloqueado: ${origin}`)
      callback(new Error('CORS não permitido'))
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.options('*', cors(corsOptions)) // ✅ Corrigido

// 🏥 Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 🔑 Endpoint principal
app.post('/session', async (req, res) => {
  try {
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ error: 'idToken requerido' })
    }

    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    const payload = {
      sub: uid,
      role: 'authenticated',
      aud: 'authenticated'
    }

    const token = jwt.sign(payload, SUPABASE_JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h'
    })

    return res.json({ token })
  } catch (err) {
    console.error('Erro /session:', err)
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
})

// ✅ Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Auth bridge rodando em http://localhost:${PORT}`)
})