// Supabase Edge Function: Upload Petition
// Recebe arquivo e faz upload usando Service Role Key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { firebaseUid, fileName, fileData } = await req.json()

    if (!firebaseUid || !fileName || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o usuário existe na tabela user_profiles
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('firebase_uid, role')
      .eq('firebase_uid', firebaseUid)
      .single()

    if (!userProfile || userProfile.role !== 'writer') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User must be a writer' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Converter base64 de volta para File
    const binaryString = atob(fileData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const file = new File([bytes], fileName, { type: 'application/pdf' })

    // Fazer upload usando Service Role Key
    const filePath = `${firebaseUid}/${Date.now()}-${fileName}`
    const { data, error } = await supabaseClient.storage
      .from('writer-petitions')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabaseClient.storage
      .from('writer-petitions')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ url: urlData.publicUrl, path: filePath }),
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










