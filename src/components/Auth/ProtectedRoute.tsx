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

  // Verificar status de aprovação do redator
  useEffect(() => {
    const checkWriterStatus = async () => {
      console.log('🔍 ProtectedRoute - checkWriterStatus:', { 
        userRole: user?.role, 
        uid: user?.uid,
        userObject: user 
      })
      
      if (!user || user.role !== 'writer') {
        console.log('🔍 ProtectedRoute - Não é redator, status aprovado')
        setWriterStatus('approved')
        return
      }

      try {
        console.log('🔍 ProtectedRoute - Buscando status do redator no Supabase...')
        console.log('🔍 ProtectedRoute - Firebase UID sendo consultado:', user.uid)
        
        // Aguardar um pouco para garantir que os dados sejam propagados
        await new Promise(resolve => setTimeout(resolve, 1000))
        
                // Buscar da tabela correta (user_profiles)
                const { data, error } = await supabase
                  .from('user_profiles')
                  .select('status, role, email, firebase_uid, full_name, created_at, updated_at')
                  .eq('firebase_uid', user.uid)
                  .single()

                console.log('🔍 ProtectedRoute - Resposta Supabase:', { 
                  data: data ? {
                    id: data.id,
                    firebase_uid: data.firebase_uid,
                    email: data.email,
                    role: data.role,
                    status: data.status,
                    full_name: data.full_name,
                    created_at: data.created_at,
                    updated_at: data.updated_at
                  } : null, 
                  error 
                })
                
                console.log('🔍 ProtectedRoute - Comparação de dados:')
                console.log('  - Contexto React role:', user.role)
                console.log('  - Banco de dados role:', data?.role)
                console.log('  - Contexto React uid:', user.uid)
                console.log('  - Banco de dados firebase_uid:', data?.firebase_uid)
        
        console.log('🔍 ProtectedRoute - Dados completos do usuário no contexto:', user)

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

        console.log('🔍 ProtectedRoute - Status encontrado:', rawStatus)
        console.log('🔍 ProtectedRoute - Status normalizado:', normalizedStatus)
        console.log('🔍 ProtectedRoute - Data completa:', data)
        
        if (normalizedStatus === 'pending_approval') {
          console.log('🔍 ProtectedRoute - Status: pending_approval -> pending')
          setWriterStatus('pending')
        } else if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
          console.log('🔍 ProtectedRoute - Status: liberado (approved/active)')
          setWriterStatus('approved')
        } else if (normalizedStatus === 'rejected') {
          console.log('🔍 ProtectedRoute - Status: rejected')
          setWriterStatus('rejected')
        } else {
          console.log('🔍 ProtectedRoute - Status desconhecido, definindo como pending')
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

  // Verificar se redator está aprovado ANTES da verificação de autorização
  console.log('🔍 ProtectedRoute - Verificando redirecionamentos:', { 
    userRole: user.role, 
    writerStatus, 
    allowedRoles 
  })
  
  if (user.role === 'writer' && writerStatus === 'pending') {
    console.log('🔍 ProtectedRoute - Redirecionando para /pending-approval')
    return <Navigate to="/pending-approval" replace />
  }

  if (user.role === 'writer' && writerStatus === 'rejected') {
    console.log('🔍 ProtectedRoute - Redirecionando para /rejected')
    return <Navigate to="/rejected" replace />
  }

  // Se houver restrição de papéis, checa autorização
  const role = (user.role as string).toLowerCase() as UserRole
  const isAuthorized =
    !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)

  console.log('🔍 ProtectedRoute - Verificação de autorização:', { 
    role, 
    allowedRoles, 
    isAuthorized 
  })

  if (!isAuthorized) {
    console.log('🔍 ProtectedRoute - Redirecionando para /unauthorized')
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
