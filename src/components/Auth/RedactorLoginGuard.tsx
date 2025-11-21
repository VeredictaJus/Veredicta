// src/components/auth/RedactorLoginGuard.tsx
import React from 'react'
import { RedactorApprovalService } from '../../services/redactorApprovalService'
import { AlertCircle, Clock, XCircle } from 'lucide-react'

type UserType = 'client' | 'writer' | 'admin' | 'redactor' // compat antigo

interface RedactorLoginGuardProps {
  email: string
  userType: UserType
  onLoginAttempt: (allowed: boolean, message?: string) => void
}

// Helper: normaliza userType (aceita "redactor" antigo como "writer")
function normalizeUserType(t: UserType): 'client' | 'writer' | 'admin' {
  if (t === 'redactor') return 'writer'
  return t
}

export const RedactorLoginGuard: React.FC<RedactorLoginGuardProps> = ({
  email,
  userType,
  onLoginAttempt,
}) => {
  React.useEffect(() => {
    let cancelled = false

    const run = async () => {
      const t = normalizeUserType(userType)

      // Se não for redator/escritor, libera direto
      if (t !== 'writer') {
        if (!cancelled) onLoginAttempt(true)
        return
      }

      try {
        // Suporta serviço síncrono ou assíncrono
        const res = RedactorApprovalService.getRedactorByEmail(email)
        const redactor = (res instanceof Promise) ? await res : res

        if (!redactor) {
          if (!cancelled) onLoginAttempt(false, 'Redator não encontrado. Faça seu cadastro primeiro.')
          return
        }

        switch (redactor.status) {
          case 'pending_approval':
            if (!cancelled) onLoginAttempt(false, 'Seu cadastro está aguardando aprovação. Você receberá um email quando for aprovado.')
            break
          case 'rejected':
            if (!cancelled) onLoginAttempt(false, `Cadastro rejeitado. Motivo: ${redactor.rejectionReason || 'Não especificado'}`)
            break
          case 'approved':
            if (!cancelled) onLoginAttempt(true)
            break
          default:
            if (!cancelled) onLoginAttempt(false, 'Status do cadastro inválido.')
        }
      } catch (e) {
        if (!cancelled) onLoginAttempt(false, 'Não foi possível verificar o status do redator.')
      }
    }

    if (email) run()
    else onLoginAttempt(false, 'Informe o email para continuar.')

    return () => { cancelled = true }
  }, [email, userType, onLoginAttempt])

  return null
}

export const RedactorStatusMessage: React.FC<{
  email: string
  userType: UserType
}> = ({ email, userType }) => {
  const t = normalizeUserType(userType)
  if (t !== 'writer') return null

  // idem: funciona com serviço sync/async
  const [status, setStatus] = React.useState<null | {
    state: 'none' | 'pending_approval' | 'rejected' | 'approved' | 'unknown'
    rejectionReason?: string | null
    createdAt?: string | null
  }>(null)

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = RedactorApprovalService.getRedactorByEmail(email)
        const redactor = (res instanceof Promise) ? await res : res

        if (!redactor) {
          if (!cancelled) setStatus({ state: 'none' })
          return
        }

        if (!cancelled) {
          setStatus({
            state: redactor.status ?? 'unknown',
            rejectionReason: redactor.rejectionReason ?? null,
            createdAt: redactor.createdAt ?? null,
          })
        }
      } catch {
        if (!cancelled) setStatus({ state: 'unknown' })
      }
    }
    if (email) run()
    return () => { cancelled = true }
  }, [email])

  if (!status) return null

  if (status.state === 'none') {
    return (
      <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-start">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Cadastro não encontrado</h3>
            <p className="mt-1 text-sm text-red-700">
              Você precisa se cadastrar como redator primeiro.
              <a href="/auth/redactor-register" className="font-medium underline ml-1">
                Clique aqui para se cadastrar
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status.state === 'pending_approval') {
    return (
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Aguardando Aprovação</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Seu cadastro está sendo analisado pela nossa equipe. Você receberá um email quando for aprovado.
              <br />
              {status.createdAt && (
                <span className="text-xs">
                  Cadastro enviado em: {new Date(status.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status.state === 'rejected') {
    return (
      <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-start">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Cadastro Rejeitado</h3>
            <p className="mt-1 text-sm text-red-700">
              Motivo: {status.rejectionReason || 'Não especificado'}
              <br />
              <a href="/auth/redactor-register" className="font-medium underline">
                Tentar novo cadastro
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // approved => sem mensagem
  if (status.state === 'approved') return null

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-gray-800">Status Desconhecido</h3>
          <p className="mt-1 text-sm text-gray-700">
            Entre em contato com o suporte: contato@veredictajus.com
          </p>
        </div>
      </div>
    </div>
  )
}