// Edge Function: Upload de Notas Fiscais com validação Firebase
// Deploy: supabase functions deploy upload-invoice

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-firebase-uid, x-file-name, x-invoice-amount',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Obter dados do request
    const firebaseUid = req.headers.get('x-firebase-uid')
    const fileName = req.headers.get('x-file-name')
    const invoiceAmountStr = req.headers.get('x-invoice-amount')
    
    if (!firebaseUid || !fileName || !invoiceAmountStr) {
      return new Response(
        JSON.stringify({ error: 'Missing firebase UID, file name, or invoice amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar e converter o valor da nota fiscal
    const invoiceAmount = parseFloat(invoiceAmountStr)
    if (isNaN(invoiceAmount) || invoiceAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid invoice amount. Must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validar que o usuário existe no banco
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: userProfile, error: profileError} = await supabaseAdmin
      .from('user_profiles')
      .select('id, role, full_name, email')
      .eq('firebase_uid', firebaseUid)
      .single()

    if (profileError || !userProfile) {
      console.error('User not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'User not found or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verificar que é um writer
    if (userProfile.role !== 'writer') {
      return new Response(
        JSON.stringify({ error: 'Only writers can upload invoices' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Nome do writer (usar full_name ou email como fallback)
    const writerName = userProfile.full_name || userProfile.email || 'Redator Desconhecido'

    // 4. Obter o arquivo do request
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Validar que é um PDF
    if (file.type !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: 'Only PDF files are allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Validar tamanho (50MB)
    if (file.size > 52428800) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 50MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Fazer upload usando service key (bypassa RLS)
    const filePath = `${firebaseUid}/${fileName}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data, error } = await supabaseAdmin.storage
      .from('invoices')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Registrar na tabela de invoices
    const month = parseInt(fileName.split('-')[1]) // Extrai mês do nome do arquivo
    const year = parseInt(fileName.split('-')[0]) // Extrai ano do nome do arquivo
    
    console.log('Attempting to insert invoice record:', {
      submitted_by: firebaseUid,
      period_year: year,
      period_month: month,
      amount: invoiceAmount,
      file_path: filePath
    })
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('app_2d8133c678_invoices')
      .insert({
        submitted_by: firebaseUid,
        client_id: firebaseUid, // Por enquanto, usar o mesmo UUID (pode ser ajustado depois)
        period_year: year,
        period_month: month,
        amount: invoiceAmount, // Valor informado pelo redator
        file_path: filePath,
        status: 'submitted'
      })
      .select()

    if (insertError) {
      console.error('❌ Error inserting invoice record:', insertError)
      console.error('❌ Error details:', JSON.stringify(insertError, null, 2))
      // Não falha o upload se não conseguir inserir o registro, mas retorna warning
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: 'File uploaded but database record failed',
          path: data.path,
          error: insertError.message 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('✅ Invoice record inserted successfully:', insertData)

    // 9. Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        path: data.path,
        message: 'Invoice uploaded successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})



