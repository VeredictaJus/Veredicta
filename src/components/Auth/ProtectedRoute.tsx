// src/routes/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useNewAuth } from '@/contexts/NewAuthContext'
import { supabase } from '@/lib/supabase'

type UserRole = 'client' | 'writer' | 'admin'

type Props = {
  allowedRoles?: UserRole[]            // se omitido, basta estar logado
  children: React.ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, loading } = useNewAuth()
  const location = useLocation()
  const [writerStatus, setWriterStatus] = useState<'pending' | 'approved' | 'rejected' | 'loading'>('loading')
  const [roleValidating, setRoleValidating] = useState(false)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  // ✅ CORREÇÃO CRÍTICA: Todos os hooks devem ser chamados ANTES de qualquer return condicional
  // Verificar status de aprovação do redator
  useEffect(() => {
    const checkWriterStatus = async () => {
      if (!user || user.role !== 'writer') {
        setWriterStatus('approved')
        return
      }

      try {
        // Aguardar um pouco para garantir que os dados sejam propagados
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Buscar da tabela correta (user_profiles)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('status, role, email, firebase_uid, full_name, created_at, updated_at')
          .eq('firebase_uid', user.uid)
          .single()

        if (error) {
          console.error('❌ Erro ao verificar status do redator:', error)
          setWriterStatus('pending')
          return
        }

        // Se não tem status definido, considerar como pending
        const rawStatus = data?.status ?? 'pending_approval'
        const normalizedStatus =
          typeof rawStatus === 'string'
            ? rawStatus.toLowerCase().trim()
            : 'pending_approval'
        
        if (normalizedStatus === 'pending_approval') {
          setWriterStatus('pending')
        } else if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          setWriterStatus('approved')
        } else if (normalizedStatus === 'rejected') {
          setWriterStatus('rejected')
        } else {
          setWriterStatus('pending')
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status do redator:', error)
        setWriterStatus('pending')
      }
    }

    checkWriterStatus()
  }, [user])

  // ✅ CORREÇÃO: Inicializar roleValidating quando user aparece pela primeira vez
  // Isso evita flash de "não autorizado" no primeiro render após cadastro
  useEffect(() => {
    if (user && !initialCheckDone) {
      const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
      if (!isValidRole) {
        setRoleValidating(true)
      }
      setInitialCheckDone(true)
    } else if (!user) {
      setInitialCheckDone(false)
      setRoleValidating(false)
    }
  }, [user, initialCheckDone])

  // ✅ CORREÇÃO: Verificar se o role está válido - se não estiver, aguardar mais um pouco
  // Isso evita redirecionamento para "unauthorized" durante a sincronização inicial
  useEffect(() => {
    if (!user) {
      setRoleValidating(false)
      return
    }
    
    const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
    
    if (!isValidRole && roleValidating) {
      // Aguardar até 3 segundos para o role ser sincronizado
      const timeout = setTimeout(() => {
        // Verificar novamente se o role já está válido
        const stillInvalid = !user.role || !['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
        if (stillInvalid) {
          setRoleValidating(false)
        }
      }, 3000)
      
      return () => clearTimeout(timeout)
    } else if (isValidRole && roleValidating) {
      // Role é válido, desativar validação imediatamente
      setRoleValidating(false)
    }
  }, [user, roleValidating])

  // Enquanto verifica sessão Firebase -> ponte -> Supabase
  if (loading || writerStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  // Não autenticado: manda pro login e preserva rota de origem
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Mostrar loading enquanto o role está sendo validado
  if (roleValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Sincronizando perfil...</p>
        </div>
      </div>
    )
  }
  
  // Se o role não está válido após aguardar, não redirecionar ainda - deixar o useEffect resolver
  const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
  if (!isValidRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  // Verificar se redator está aprovado ANTES da verificação de autorização
  if (user.role === 'writer' && writerStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  if (user.role === 'writer' && writerStatus === 'rejected') {
    return <Navigate to="/rejected" replace />
  }

  // Se houver restrição de papéis, checa autorização
  // ✅ CORREÇÃO: Verificar se user.role existe antes de chamar toLowerCase
  // ✅ CORREÇÃO: Se roleValidating ainda estiver ativo, não verificar autorização ainda
  if (roleValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Finalizando carregamento...</p>
        </div>
      </div>
    )
  }
  
  const role = (user?.role ? String(user.role).toLowerCase() : 'client') as UserRole
  const isAuthorized =
    !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
