import { getSupabaseForCurrentUser } from '@/lib/session'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface SendAlertParams {
  type: AlertType
  message: string
  targetRole?: string | null
}

/**
 * Insere um alerta vinculado ao usuário atual (uid do Firebase).
 * Evita spoofing: não aceita userId externo.
 */
export async function sendAlert({ type, message, targetRole = null }: SendAlertParams) {
  const { supabase, uid } = await getSupabaseForCurrentUser()

  const { error } = await supabase.from('alerts').insert({
    firebase_uid: uid,      // <- chave de vínculo por texto
    type,
    message,
    target_role: targetRole
  })

  if (error) {
    console.error('Erro ao enviar alerta:', error)
    throw error
  }
}