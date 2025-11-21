/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Supabase Edge Function: Firebase Auth Bridge
// Converte tokens Firebase em tokens Supabase JWT

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Usar variáveis automáticas do Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface TokenResponse {
  token: string
  expires_at: number
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'idToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valida o token Firebase e extrai o UID
    // Para produção, você precisaria validar o idToken do Firebase aqui
    // Por enquanto, vamos decodificar o token para extrair o UID
    const parts = idToken.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(atob(parts[1]))
    const uid = payload.sub || payload.user_id

    if (!uid) {
      return new Response(
        JSON.stringify({ error: 'Invalid token: UID not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase com Service Role para gerenciar sessões
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar ou criar usuário no Supabase
    const { data: existingUser } = await supabase.auth.admin.getUserById(uid)
    
    let supabaseUserId = uid
    
    if (!existingUser?.user) {
      // Criar usuário no Supabase se não existir
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        id: uid,
        email: payload.email || `${uid}@firebase.local`,
        email_confirm: true,
        user_metadata: {
          firebase_uid: uid,
          provider: 'firebase'
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        // Se já existe, continua
        if (!createError.message.includes('already')) {
          throw createError
        }
      } else if (newUser.user) {
        supabaseUserId = newUser.user.id
      }
    } else {
      supabaseUserId = existingUser.user.id
    }

    // Criar token JWT manualmente usando o Service Role Key como secret
    const jwt = await import('https://deno.land/x/djwt@v2.8/mod.ts')
    
    const jwtToken = await jwt.create(
      { alg: 'HS256', typ: 'JWT' },
      {
        sub: supabaseUserId,
        role: 'authenticated',
        aud: 'authenticated',
        iss: 'supabase',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      },
      SUPABASE_SERVICE_ROLE_KEY // Usar Service Role Key como secret
    )

    return new Response(
      JSON.stringify({ token: jwtToken }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

