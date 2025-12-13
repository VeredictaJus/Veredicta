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

  // ✅ CORREÇÃO: Verificar se o role está válido - se não estiver, aguardar mais um pouco
  // Isso evita redirecionamento para "unauthorized" durante a sincronização inicial
  useEffect(() => {
    if (!user) return
    
    const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
    
    if (!isValidRole && !roleValidating) {
      setRoleValidating(true)
      // Aguardar até 2 segundos para o role ser sincronizado
      const timeout = setTimeout(() => {
        setRoleValidating(false)
      }, 2000)
      
      return () => clearTimeout(timeout)
    } else if (isValidRole) {
      setRoleValidating(false)
    }
  }, [user, roleValidating])

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
  const role = (user?.role ? String(user.role).toLowerCase() : 'client') as UserRole
  const isAuthorized =
    !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
