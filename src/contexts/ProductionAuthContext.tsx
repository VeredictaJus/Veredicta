// src/contexts/ProductionAuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ProductionAuthService, { AuthUser, UserProfile } from '@/services/productionAuthService'

// ---- Tipagens ---------------------------------------------------------------
type UserRole = 'client' | 'writer' | 'admin'

interface RegisterData {
  email: string
  password: string
  role: UserRole
  profileData?: {
    full_name?: string
    company_name?: string
    cnpj?: string
    phone?: string
    address?: string
  }
}

interface ProductionAuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, roleHint?: UserRole) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  getSupabaseClient: () => any
  refreshProfile: () => Promise<void>
}

// ---- Contexto ---------------------------------------------------------------
export const ProductionAuthContext = createContext<ProductionAuthContextType | undefined>(undefined)

export const useProductionAuth = () => {
  const ctx = useContext(ProductionAuthContext)
  if (!ctx) throw new Error('useProductionAuth deve ser usado dentro de ProductionAuthProvider')
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
export function ProductionAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const authService = ProductionAuthService

  // Carregar perfil do usuário atual
  const loadUserProfile = async (firebaseUser: any) => {
    try {
      console.log('🔄 Carregando perfil do usuário:', firebaseUser.uid)
      
      // Buscar perfil usando o serviço de produção
      const profile = await authService.getOrCreateProfile(
        firebaseUser.uid, 
        firebaseUser.email, 
        'client' // role padrão
      )

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: profile.email,
        role: profile.role,
        profile
      }

      setUser(authUser)
      authService.currentUser = authUser
      console.log('✅ Perfil carregado:', authUser)
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil:', error)
      
      // Fallback: usuário básico
      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: 'client'
      }
      
      setUser(authUser)
      authService.currentUser = authUser
    }
  }

  // Observar mudanças na autenticação Firebase
  useEffect(() => {
    let alive = true
    
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!alive) return

        if (!firebaseUser) {
          // Usuário não autenticado
          setUser(null)
          authService.currentUser = null
          setLoading(false)
          navigate('/auth/login')
          return
        }

        // Usuário autenticado - carregar perfil
        await loadUserProfile(firebaseUser)
        setLoading(false)
      } catch (error: any) {
        console.error('❌ Erro no estado de autenticação:', error)
        setUser(null)
        setLoading(false)
      }
    })

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
      setUser(authUser)
      
      // Navegar para a rota correta
      navigate(routeForRole(authUser.role), { replace: true })
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
      const authUser = await authService.register(
        data.email, 
        data.password, 
        data.role, 
        data.profileData
      )
      setUser(authUser)
      
      // Navegar para a rota correta
      navigate(routeForRole(authUser.role), { replace: true })
    } catch (error: any) {
      console.error('❌ Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
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

  const getSupabaseClient = () => {
    return authService.getSupabaseClient()
  }

  const refreshProfile = async () => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      await loadUserProfile({ uid: currentUser.uid, email: currentUser.email })
    }
  }

  const value = useMemo<ProductionAuthContextType>(() => ({
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    getSupabaseClient,
    refreshProfile,
  }), [user, loading])

  return (
    <ProductionAuthContext.Provider value={value}>
      {children}
    </ProductionAuthContext.Provider>
  )
}
