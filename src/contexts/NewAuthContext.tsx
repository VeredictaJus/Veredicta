// src/contexts/NewAuthContext.tsx - MIGRADO PARA SISTEMA DE PRODUÇÃO
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ProductionAuthService, { AuthUser } from '@/services/productionAuthService'
import { PlanNotificationService } from '@/services/planNotificationService'

// ---- Tipagens ---------------------------------------------------------------
type UserRole = 'client' | 'writer' | 'admin'

interface RegisterData {
  email: string
  password: string
  role: UserRole
  profileData?: {
    companyName?: string
    cnpj?: string
    contactPerson?: string
    phone?: string
    address?: string
  }
}

interface NewAuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, roleHint?: UserRole) => Promise<void>
  register: (data: RegisterData) => Promise<AuthUser>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  getClient: () => Promise<{ supabase: any; uid: string }>
}

// ---- Contexto ---------------------------------------------------------------
export const NewAuthContext = createContext<NewAuthContextType | undefined>(undefined)

export const useNewAuth = () => {
  const ctx = useContext(NewAuthContext)
  if (!ctx) {
    console.warn('⚠️ useNewAuth chamado fora do NewAuthProvider - retornando valores padrão')
    // Retornar valores padrão em vez de lançar erro
    return {
      user: null,
      loading: true,
      login: async () => { throw new Error('Auth não inicializado') },
      register: async () => { throw new Error('Auth não inicializado') },
      logout: async () => { throw new Error('Auth não inicializado') },
      forgotPassword: async () => { throw new Error('Auth não inicializado') },
      getClient: async () => { throw new Error('Auth não inicializado') }
    } as NewAuthContextType
  }
  return ctx
}

// ---- Helper de rota por papel ----------------------------------------------
function routeForRole(role: UserRole): string {
  switch (role) {
    case 'client': return '/client'
    case 'writer': return '/writer'
    case 'admin': return '/admin'
    default: return '/'
  }
}

// ---- Provider ---------------------------------------------------------------
export function NewAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = ProductionAuthService

  // Carregar perfil do usuário atual usando o serviço de produção
  const loadUserProfile = async (firebaseUser: any) => {
    try {
      console.log('🔄 Carregando perfil do usuário:', firebaseUser.uid)
      
      let profile
      
      try {
        // Tentar buscar perfil existente
        profile = await authService.getProfile(firebaseUser.uid)
        console.log('✅ Perfil encontrado no banco')
      } catch (profileError: any) {
        // Se não encontrar, aguardar um pouco e tentar novamente (timing issue)
        console.log('⚠️ Perfil não encontrado, aguardando 500ms e tentando novamente...')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          profile = await authService.getProfile(firebaseUser.uid)
          console.log('✅ Perfil encontrado após retry')
        } catch (retryError: any) {
          // Se ainda não encontrar, usar fallback apenas se realmente não existir
          console.log('⚠️ Perfil ainda não encontrado após retry, usando fallback')
          // Criar perfil mínimo sem especificar role (será client por padrão)
          profile = await authService.getOrCreateProfile(firebaseUser.uid, firebaseUser.email || '')
          console.log('✅ Perfil criado com fallback')
        }
      }

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: profile.email,
        role: profile.role,
        profile
      }

      setUser(authUser)
      authService.currentUser = authUser
      console.log('✅ Perfil carregado:', authUser)
      
      // Verificar limite de plano e vencimentos (apenas para clientes)
      if (authUser.role === 'client') {
        PlanNotificationService.runAllChecks(authUser.uid).catch(err => {
          console.error('Erro ao verificar planos:', err)
        })
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil:', error)
      
      // Se não conseguir carregar o perfil, não definir usuário
      // Deixar que o sistema de autenticação resolva
      console.log('⚠️ Erro ao carregar perfil - não definindo usuário temporariamente')
      setUser(null)
      authService.currentUser = null
    }
  }

  // Observar mudanças na autenticação Firebase
  useEffect(() => {
    let alive = true
    
    const unsub = onAuthStateChanged(
      auth, 
      async (firebaseUser) => {
        try {
          if (!alive) return

          if (!firebaseUser) {
            // Usuário não autenticado
            setUser(null)
            authService.currentUser = null
            setLoading(false)
            // Não redirecionar automaticamente - deixar o roteamento do App.tsx decidir
            return
          }

          // Usuário autenticado - carregar perfil
          await loadUserProfile(firebaseUser)
          setLoading(false)
        } catch (error: any) {
          console.error('❌ Erro no estado de autenticação:', error)
          // ✅ CORREÇÃO: Não quebrar a aplicação se houver erro no Firebase
          // Continuar funcionando mesmo com erro de autenticação
          setUser(null)
          setLoading(false)
        }
      },
      (error) => {
        // ✅ CORREÇÃO: Handler de erro específico para onAuthStateChanged
        // Isso captura erros como 400 do Identity Toolkit
        console.error('❌ Erro no listener de autenticação Firebase:', error)
        console.warn('⚠️ Possíveis causas do erro 400:')
        console.warn('  1. Domínio não autorizado no Firebase Console')
        console.warn('  2. API key incorreta ou expirada')
        console.warn('  3. Problema com a configuração do Firebase Auth')
        console.warn('  4. Verifique se www.veredictajus.com.br está na lista de domínios autorizados')
        
        // Não quebrar a aplicação - apenas logar o erro
        setLoading(false)
      }
    )

    return () => { 
      alive = false
      unsub()
    }
  }, [])

  // ---- Ações ---------------------------------------------------------------

  const login = async (email: string, password: string, roleHint?: UserRole) => {
    setLoading(true)
    try {
      const authUser = await authService.login(email, password, roleHint)
      console.log('🔍 NewAuthContext - Login realizado:', { role: authUser.role, uid: authUser.uid })
      setUser(authUser)
      
      // Navegar para a rota correta
      const redirectPath = routeForRole(authUser.role)
      console.log('🔍 NewAuthContext - Redirecionando para:', redirectPath)
      navigate(redirectPath, { replace: true })
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setLoading(true)
    try {
      console.log('🔍 NewAuthContext - DADOS RECEBIDOS DO Register.tsx:', data)
      console.log('🔍 NewAuthContext - role recebido:', data.role)
      console.log('🔍 NewAuthContext - role === "writer":', data.role === 'writer')
      
      const authUser = await authService.register(
        data.email, 
        data.password, 
        data.role, 
        data.profileData
      )
      console.log('🔍 NewAuthContext - Register realizado:', { 
        role: authUser.role, 
        uid: authUser.uid,
        authUserObject: authUser 
      })
      setUser(authUser)
      
      // ✅ CORREÇÃO: Aguardar mais tempo para garantir que o estado seja sincronizado
      // antes de navegar e desativar loading, evitando race condition com ProtectedRoute
      // Aumentado para 1000ms para dar mais tempo de sincronização completa
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Para redatores, não redirecionar automaticamente - deixar o componente decidir
      if (data.role !== 'writer') {
        navigate(routeForRole(authUser.role), { replace: true })
      }
      
      // ✅ CORREÇÃO ADICIONAL: Aguardar mais um pouco antes de desativar loading
      // Isso garante que o ProtectedRoute tenha tempo de verificar o usuário antes do loading ser false
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return authUser
    } catch (error: any) {
      console.error('❌ Erro no registro:', error)
      throw error
    } finally {
      // ✅ CORREÇÃO: Aguardar um pouco mais antes de desativar loading
      // Isso evita que o ProtectedRoute veja loading=false antes do usuário estar completamente sincronizado
      setTimeout(() => {
        setLoading(false)
      }, 300)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      navigate('/', { replace: true })
    } catch (error: any) {
      console.error('❌ Erro no logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email)
    } catch (error: any) {
      console.error('❌ Erro ao recuperar senha:', error)
      throw error
    }
  }

  const getClient = async () => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) throw new Error('Usuário não autenticado')
    
    // Obter cliente Supabase autenticado via bridge Firebase->Supabase
    const supabaseClient = await authService.getSupabaseClient()
    
    return { 
      supabase: supabaseClient, 
      uid: currentUser.uid 
    }
  }

  const value = useMemo<NewAuthContextType>(() => ({
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    getClient,
  }), [user, loading])

  return (
    <NewAuthContext.Provider value={value}>
      {children}
    </NewAuthContext.Provider>
  )
}