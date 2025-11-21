// Edge Function: Deletar Nota Fiscal
// Deploy: supabase functions deploy delete-invoice

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-firebase-uid, x-file-path',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Obter dados do request
    const firebaseUid = req.headers.get('x-firebase-uid')
    const filePath = req.headers.get('x-file-path')
    
    if (!firebaseUid || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing firebase UID or file path' }),
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
      .select('id, role')
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
        JSON.stringify({ error: 'Only writers can delete invoices' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Verificar se o arquivo pertence ao usuário (path deve começar com firebaseUid/)
    if (!filePath.startsWith(`${firebaseUid}/`)) {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own invoices' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Buscar o registro da nota fiscal no banco
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('app_2d8133c678_invoices')
      .select('id, status, submitted_by')
      .eq('file_path', filePath)
      .single()

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError)
      // Se não encontrar o registro, ainda assim tenta deletar o arquivo
      console.log('Invoice record not found, will try to delete file anyway')
    } else {
      // 6. Validar que a nota pertence ao usuário
      if (invoice.submitted_by !== firebaseUid) {
        return new Response(
          JSON.stringify({ error: 'You can only delete your own invoices' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 7. Validar que a nota ainda não foi aprovada/paga (apenas 'submitted' pode ser deletada)
      if (invoice.status !== 'submitted') {
        return new Response(
          JSON.stringify({ 
            error: 'Cannot delete invoice', 
            message: `Esta nota fiscal já foi ${invoice.status === 'approved' ? 'aprovada' : invoice.status === 'paid' ? 'paga' : 'processada'} e não pode ser excluída.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 8. Deletar o registro do banco
      const { error: deleteDbError } = await supabaseAdmin
        .from('app_2d8133c678_invoices')
        .delete()
        .eq('id', invoice.id)

      if (deleteDbError) {
        console.error('Error deleting invoice record:', deleteDbError)
        return new Response(
          JSON.stringify({ error: 'Failed to delete invoice record', details: deleteDbError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('✅ Invoice record deleted successfully')
    }

    // 9. Deletar o arquivo do storage
    const { error: deleteStorageError } = await supabaseAdmin.storage
      .from('invoices')
      .remove([filePath])

    if (deleteStorageError) {
      console.error('Error deleting file from storage:', deleteStorageError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete file from storage', details: deleteStorageError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ File deleted from storage successfully')

    // 10. Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice deleted successfully' 
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










