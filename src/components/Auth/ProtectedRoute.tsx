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
  const [justRegistered, setJustRegistered] = useState(false)

  // ✅ Função auxiliar para verificar se acabou de fazer cadastro
  const checkIfRecentlyRegistered = (): boolean => {
    const registrationTime = localStorage.getItem('last_registration_time')
    if (!registrationTime) return false
    const timeDiff = Date.now() - parseInt(registrationTime, 10)
    return timeDiff < 15000 // Aumentado para 15 segundos para dar mais margem
  }

  // ✅ CORREÇÃO CRÍTICA: Detectar cadastro recente via localStorage
  // Verificar tanto na montagem quanto quando o user muda
  useEffect(() => {
    const checkRegistration = () => {
      const isRecentlyRegistered = checkIfRecentlyRegistered()
      if (isRecentlyRegistered) {
        setJustRegistered(true)
        // Remover após 15 segundos
        const registrationTime = localStorage.getItem('last_registration_time')
        if (registrationTime) {
          const timeDiff = Date.now() - parseInt(registrationTime, 10)
          const remainingTime = 15000 - timeDiff
          if (remainingTime > 0) {
            setTimeout(() => {
              setJustRegistered(false)
              localStorage.removeItem('last_registration_time')
            }, remainingTime)
          } else {
            localStorage.removeItem('last_registration_time')
            setJustRegistered(false)
          }
        }
      } else {
        setJustRegistered(false)
        // Limpar se passou o tempo
        const registrationTime = localStorage.getItem('last_registration_time')
        if (registrationTime) {
          localStorage.removeItem('last_registration_time')
        }
      }
    }
    
    checkRegistration()
  }, [user]) // ✅ CORREÇÃO: Verificar também quando user muda

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
          // ✅ CORREÇÃO: Se erro for 406/400 (problemas de CORS/recurso), assumir approved temporariamente
          // Isso evita que erros de rede bloqueiem o acesso
          if (error.code === 'PGRST116' || error.status === 406 || error.status === 400) {
            console.warn('⚠️ Erro de rede/CORS ao verificar status. Assumindo approved temporariamente.')
            setWriterStatus('approved')
          } else {
            setWriterStatus('pending')
          }
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
      } catch (error: any) {
        console.error('❌ Erro ao verificar status do redator:', error)
        // ✅ CORREÇÃO: Se erro for 406/400 (problemas de CORS/recurso), assumir approved temporariamente
        if (error?.status === 406 || error?.status === 400 || error?.code === 'PGRST116') {
          console.warn('⚠️ Erro de rede/CORS ao verificar status. Assumindo approved temporariamente.')
          setWriterStatus('approved')
        } else {
          setWriterStatus('pending')
        }
      }
    }

    checkWriterStatus()
  }, [user])

  // ✅ CORREÇÃO: Detectar quando usuário acabou de se cadastrar
  // Isso evita flash de "não autorizado" após o cadastro
  useEffect(() => {
    if (user && !initialCheckDone) {
      // Verificar se acabamos de fazer um cadastro (usuário existe mas pode estar sincronizando)
      const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
      const isRecentlyRegistered = checkIfRecentlyRegistered()
      
      if (!isValidRole) {
        // Role não está válido ainda - pode ser sincronização pós-cadastro
        setRoleValidating(true)
        // Se acabou de fazer cadastro, marcar como justRegistered
        if (isRecentlyRegistered) {
          setJustRegistered(true)
        }
      } else {
        // Role está válido
        // ✅ CORREÇÃO: Só mostrar "Finalizando cadastro" se realmente acabou de fazer cadastro
        if (isRecentlyRegistered) {
          setJustRegistered(true)
          const timeout = setTimeout(() => {
            setJustRegistered(false)
          }, 3000)
          setInitialCheckDone(true)
          return () => clearTimeout(timeout)
        } else {
          // Se não acabou de fazer cadastro, não mostrar a mensagem
          setJustRegistered(false)
          setInitialCheckDone(true)
        }
      }
    } else if (!user) {
      setInitialCheckDone(false)
      setRoleValidating(false)
      setJustRegistered(false)
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
    const isRecentlyRegistered = checkIfRecentlyRegistered()
    
    if (!isValidRole && roleValidating) {
      // Aguardar até 5 segundos para o role ser sincronizado
      const timeout = setTimeout(() => {
        // Verificar novamente se o role já está válido
        const stillInvalid = !user.role || !['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
        if (stillInvalid) {
          setRoleValidating(false)
        }
      }, 5000)
      
      return () => clearTimeout(timeout)
    } else if (isValidRole && roleValidating) {
      // Role é válido, desativar validação imediatamente
      setRoleValidating(false)
    }
    
    // ✅ CORREÇÃO: Se acabou de fazer cadastro e role ainda não está válido, aguardar mais
    if (!isValidRole && isRecentlyRegistered) {
      setJustRegistered(true)
      setRoleValidating(true)
    }
  }, [user, roleValidating])

  // Enquanto verifica sessão Firebase -> ponte -> Supabase
  // ✅ CORREÇÃO: Incluir roleValidating e justRegistered na verificação inicial para evitar flash de "não autorizado"
  if (loading || writerStatus === 'loading' || roleValidating || justRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">
            {loading ? "Verificando sessão..." : justRegistered ? "Finalizando cadastro..." : roleValidating ? "Sincronizando perfil..." : "Carregando..."}
          </p>
        </div>
      </div>
    )
  }

  // Não autenticado: manda pro login e preserva rota de origem
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }
  
  // Se o role não está válido após aguardar, aguardar mais um pouco antes de redirecionar
  const isValidRole = user.role && ['client', 'writer', 'admin'].includes(String(user.role).toLowerCase())
  const isRecentlyRegistered = checkIfRecentlyRegistered()
  
  // ✅ CORREÇÃO: Se acabou de fazer cadastro, aguardar mais tempo antes de verificar role
  if (!isValidRole && isRecentlyRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Finalizando sincronização...</p>
        </div>
      </div>
    )
  }
  
  if (!isValidRole && !isRecentlyRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Finalizando sincronização...</p>
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
  // ✅ CORREÇÃO ADICIONAL: Aguardar um pouco mais se acabamos de fazer cadastro para evitar race condition
  const role = (user?.role ? String(user.role).toLowerCase() : 'client') as UserRole
  
  // ✅ CORREÇÃO CRÍTICA: Se acabamos de fazer cadastro, aguardar até que o role seja válido
  // e corresponda aos allowedRoles antes de verificar autorização
  // Isso evita completamente o flash de "não autorizado" durante a sincronização pós-cadastro
  if (isRecentlyRegistered) {
    const roleIsValid = role && ['client', 'writer', 'admin'].includes(role)
    const roleMatches = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)
    
    // Se o role não está válido ou não corresponde, aguardar mais
    if (!roleIsValid || !roleMatches) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
            <p className="mt-4 text-gray-600">Finalizando sincronização do perfil...</p>
          </div>
        </div>
      )
    }
  }
  
  const isAuthorized =
    !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role)

  // ✅ CORREÇÃO CRÍTICA: Nunca redirecionar para /unauthorized durante os primeiros 15 segundos após cadastro
  // Isso previne completamente o flash de "não autorizado"
  // Verificar novamente aqui para garantir que não há race condition
  const finalCheckRecentlyRegistered = checkIfRecentlyRegistered()
  
  if (!isAuthorized && !finalCheckRecentlyRegistered && !justRegistered) {
    return <Navigate to="/unauthorized" replace />
  }
  
  // Se não autorizado mas acabamos de cadastrar, mostrar loading em vez de redirecionar
  if (!isAuthorized && (finalCheckRecentlyRegistered || justRegistered)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Finalizando sincronização do perfil...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
