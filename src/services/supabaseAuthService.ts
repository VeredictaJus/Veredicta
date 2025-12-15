import { supabase } from '../lib/supabase'

export interface SupabaseUser {
  id: string
  email: string
  role: 'client' | 'writer' | 'admin'
}

export interface LoginCredentials {
  email: string
  password: string
  userType: 'client' | 'writer' | 'admin'
}

class SupabaseAuthService {
  async signIn(credentials: LoginCredentials): Promise<SupabaseUser | null> {
    try {
      const { email, password, userType } = credentials
      
      console.log('🔍 LOGIN START:', { email, userType, timestamp: new Date().toISOString() })
      
      // First authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔍 Auth result:', { 
        user: authData?.user ? 'authenticated' : 'not authenticated', 
        error: authError?.message || 'no error' 
      })

      if (authError) {
        console.error('❌ Supabase signIn error:', authError)
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.')
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.')
        }
        if (authError.message.includes('signup_disabled')) {
          throw new Error('Cadastro desabilitado. Entre em contato com o suporte.')
        }
        throw new Error(`Erro ao fazer login: ${authError.message}`)
      }

      if (authData.user) {
        console.log('✅ User authenticated:', authData.user.id)
        
        // Verify user type matches profile in database
        const isValidUserType = await this.verifyUserType(authData.user.email || email, userType)
        console.log('🔍 User type validation:', { email, expectedType: userType, isValid: isValidUserType })
        
        if (!isValidUserType && userType !== 'admin') {
          // Don't sign out immediately - let them try different user type
          console.log('❌ Wrong user type, but not signing out')
          throw new Error(`Este email não está registrado como ${userType === 'client' ? 'cliente' : userType === 'writer' ? 'redator' : 'administrador'}. Tente outro tipo de usuário.`)
        }

        console.log('✅ Login successful')
        return {
          id: authData.user.id,
          email: authData.user.email || email,
          role: userType,
        }
      }

      console.log('❌ No user returned from signIn')
      return null
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  private async verifyUserType(email: string, expectedUserType: string): Promise<boolean> {
    try {
      console.log('🔍 Verifying user type:', { email, expectedUserType })
      
      // For admin users, check against hardcoded list first
      if (expectedUserType === 'admin') {
        const isAdmin = email === 'contato@veredictajus.com' || email === 'admin@veredicta.com'
        console.log('🔍 Admin check:', { email, isAdmin })
        return isAdmin
      }
      
      // For client/writer, check if user exists in the correct profile table
      if (expectedUserType === 'client') {
        const { data, error } = await supabase
          .from('profiles_v2')
          .select('email')
          .eq('email', email)
          .single()
        console.log('🔍 Client check:', { found: !!data, error: error?.code })
        return !!data && !error
      } else if (expectedUserType === 'writer') {
        const { data, error } = await supabase
          .from('app_2d8133c678_redatores')
          .select('email')
          .eq('email', email)
          .single()
        console.log('🔍 Writer check:', { found: !!data, error: error?.code })
        return !!data && !error
      }
      
      return false
    } catch (error) {
      console.error('❌ Error verifying user type:', error)
      return false
    }
  }

  // New method to get current user
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }

      if (user) {
        // Try to determine role from user metadata or profile tables
        let role: 'client' | 'writer' | 'admin' = 'client'
        
        // Check metadata first
        if (user.user_metadata?.role || user.user_metadata?.user_type) {
          role = user.user_metadata.role || user.user_metadata.user_type
        } else {
          // Fallback: check profile tables
          const isClient = await this.verifyUserType(user.email!, 'client')
          const isWriter = await this.verifyUserType(user.email!, 'writer')
          const isAdmin = await this.verifyUserType(user.email!, 'admin')
          
          if (isAdmin) role = 'admin'
          else if (isWriter) role = 'writer'
          else if (isClient) role = 'client'
        }

        return {
          id: user.id,
          email: user.email!,
          role
        }
      }

      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async signUp(email: string, password: string, role: 'client' | 'writer' | 'admin' = 'client'): Promise<SupabaseUser | null> {
    try {
      console.log('🔍 SIGNUP START:', { email, role, timestamp: new Date().toISOString() })
      
      // Check if email exists in profile tables first (this is allowed)
      const { data: existingProfile } = await supabase
        .from('profiles_v2')
        .select('email')
        .eq('email', email)
        .single()
      
      const { data: existingRedator } = await supabase
        .from('app_2d8133c678_redatores')
        .select('email')
        .eq('email', email)
        .single()

      console.log('🔍 Profile checks:', { existingProfile: !!existingProfile, existingRedator: !!existingRedator })

      if (existingProfile || existingRedator) {
        console.log('❌ Email already exists in profile tables')
        throw new Error('Este email já está cadastrado. Tente fazer login.')
      }
      
      // Attempt signup with user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: role,
            role: role
          }
        }
      })

      console.log('🔍 Supabase signUp result:', { 
        user: data?.user ? { id: data.user.id, email: data.user.email, confirmed: !!data.user.email_confirmed_at } : 'no user', 
        session: !!data?.session,
        error: error?.message || 'no error' 
      })

      if (error) {
        console.error('❌ Supabase signUp error:', error)
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.')
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
        }
        if (error.message.includes('signup_disabled')) {
          throw new Error('Cadastro temporariamente desabilitado. Tente novamente mais tarde.')
        }
        throw new Error(`Erro no cadastro: ${error.message}`)
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id)
        return {
          id: data.user.id,
          email: data.user.email || email,
          role,
        }
      }

      console.log('❌ No user returned from signUp')
      return null
    } catch (error) {
      console.error('❌ SignUp error:', error)
      throw error
    }
  }



  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService()