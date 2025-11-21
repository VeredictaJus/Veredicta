import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  login as fbLogin,
  register as fbRegister,
  getSupabaseForCurrentUser,
} from '@/lib/session'

// --- Tipos do seu projeto (ajuste se necessário)
import { User, UserRole, ClientProfile, WriterProfile, AdminProfile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: ClientProfile | WriterProfile | AdminProfile | null
  login: (email: string, password: string, userType: 'client' | 'writer' | 'admin') => Promise<boolean>
  logout: () => Promise<void>
  register: (
    email: string,
    password: string,
    role: UserRole,
    profileData: Record<string, unknown>
  ) => Promise<boolean>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function routeFor(userType: 'client' | 'writer' | 'admin') {
  if (userType === 'client') return '/client'
  if (userType === 'writer') return '/writer'
  return '/admin'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ClientProfile | WriterProfile | AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega sessão Firebase e sincroniza profile no Supabase (tabela public.profiles com firebase_uid)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // Gera cliente Supabase com o token via ponte e busca/cria profile
        const { supabase, uid } = await getSupabaseForCurrentUser()
        const { data: prof } = await supabase
          .from('profiles_v2')
          .select('firebase_uid, email, role')
          .eq('firebase_uid', uid)
          .maybeSingle()

        // Se não existir perfil, cria um mínimo com role 'client'
        const effectiveRole = (prof?.role as string) || 'client'
        if (!prof) {
          await supabase.from('profiles_v2').upsert(
            {
              firebase_uid: uid,
              email: fbUser.email ?? '',
              role: effectiveRole,
            },
            { onConflict: 'firebase_uid' }
          )
        }

        // Monta User no formato do seu projeto
        const appUser: User = {
          id: uid, // agora usamos UID do Firebase
          email: fbUser.email ?? '',
          role: (effectiveRole || 'client').toUpperCase() as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        }

        setUser(appUser)
        localStorage.setItem('veredicta_user', JSON.stringify(appUser))

        // Se você mantém perfis detalhados por tipo, carregue aqui (opcional):
        setProfile(null) // ou carregue sua estrutura específica
      } catch (e) {
        console.error('Erro no bootstrap da sessão:', e)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // LOGIN via Firebase
  const login = async (email: string, password: string, userType: 'client' | 'writer' | 'admin'): Promise<boolean> => {
    setLoading(true)
    try {
      const { supabase, uid } = await fbLogin(email, password)

      // Garante que o profile exista; se já existe, preserva a role existente
      const { data: existing } = await supabase
        .from('profiles_v2')
        .select('role,email')
        .eq('firebase_uid', uid)
        .maybeSingle()

      const role = (existing?.role as string) || userType
      const effectiveEmail = existing?.email || email

      if (!existing) {
        await supabase.from('profiles_v2').upsert(
          { firebase_uid: uid, email: effectiveEmail, role },
          { onConflict: 'firebase_uid' }
        )
      }

      const appUser: User = {
        id: uid,
        email: effectiveEmail,
        role: role.toUpperCase() as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      }

      setUser(appUser)
      localStorage.setItem('veredicta_user', JSON.stringify(appUser))
      navigate(routeFor(role as any), { replace: true })
      return true
    } catch (err: any) {
      console.error('❌ Login error:', err?.message || err)
      throw new Error(err?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  // REGISTER via Firebase, depois cria perfil no Supabase
  const register = async (
    email: string,
    password: string,
    role: UserRole,
    profileData: Record<string, unknown>
  ): Promise<boolean> => {
    setLoading(true)
    try {
      const { supabase, uid } = await fbRegister(email, password)

      // Cria/atualiza perfil principal (tabela public.profiles) — usa firebase_uid
      await supabase.from('profiles_v2').upsert(
        {
          firebase_uid: uid,
          email,
          role: role.toLowerCase(), // guardo em minúsculo; sua UI usa upper
          ...profileData,
        },
        { onConflict: 'firebase_uid' }
      )
         const appUser: User = {
        id: uid,
        email,
        role: role.toUpperCase() as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      }

      setUser(appUser)
      localStorage.setItem('veredicta_user', JSON.stringify(appUser))
      navigate(routeFor(role.toLowerCase() as any), { replace: true })
      return true
    } catch (err: any) {
      console.error('❌ Registration error:', err?.message || err)
      throw new Error(err?.message || 'Erro ao registrar')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth) // sai só do Firebase
    setUser(null)
    setProfile(null)
    localStorage.removeItem('veredicta_user')
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        register,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}