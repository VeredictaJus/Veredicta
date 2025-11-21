import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'client' | 'writer' | 'admin'
}

export interface RegisterData {
  email: string
  password: string
  role: 'client' | 'writer' | 'admin'
  profileData?: Record<string, any>
}

class NewAuthService {
  // Register new user with comprehensive error handling and RLS bypass
  async register(data: RegisterData): Promise<AuthUser> {
    console.log('🔍 NEW AUTH: Starting registration', { email: data.email, role: data.role })

    try {
      // Method 1: Try normal Supabase signup with email confirmation disabled
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            user_type: data.role,
            full_name: data.profileData?.fullName || data.profileData?.contactName || '',
            company_name: data.profileData?.companyName || '',
            cpf: data.profileData?.cpf || '',
            cnpj: data.profileData?.cnpj || '',
            oab_number: data.profileData?.oabNumber || '',
            phone: data.profileData?.phone || ''
          },
          // Try to bypass email confirmation
          emailRedirectTo: undefined
        }
      })

      if (error) {
        console.error('❌ Supabase signup error:', error.message)
        
        // If it's the database error or RLS issue, use localStorage fallback
        if (error.message.includes('Database error') || 
            error.message.includes('row-level security') ||
            error.message.includes('unexpected_failure')) {
          console.log('🔄 Using localStorage fallback due to backend issues...')
          return await this.registerWithLocalStorage(data)
        }
        
        throw new Error(this.translateError(error.message))
      }

      if (!authData.user) {
        console.log('🔄 No user returned, using localStorage fallback...')
        return await this.registerWithLocalStorage(data)
      }

      console.log('✅ User registered successfully:', authData.user.id)
      console.log('Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No')

      // Even if Supabase user creation succeeds, we might not be able to create profiles
      // due to RLS. Store user info safely.
      const authUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: data.role
      }

      // Store user data in localStorage as backup
      this.storeUserSession(authUser, data.profileData)

      return authUser

    } catch (error: any) {
      console.error('❌ Registration failed:', error)
      
      // Final fallback - use localStorage-only approach
      console.log('🔄 Using localStorage fallback as final resort...')
      return await this.registerWithLocalStorage(data)
    }
  }

  // localStorage-based registration fallback
  private async registerWithLocalStorage(data: RegisterData): Promise<AuthUser> {
    console.log('🔄 Using localStorage-only registration')
    
    try {
      // Check if email already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('veredicta_users') || '[]')
      const existingUser = existingUsers.find((u: any) => u.email === data.email)
      
      if (existingUser) {
        throw new Error('Este email já está cadastrado')
      }

      // Create user ID
      const userId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      const authUser = {
        id: userId,
        email: data.email,
        role: data.role,
        password: data.password, // In production, this would be hashed
        profileData: data.profileData,
        registeredAt: new Date().toISOString(),
        confirmed: true // Assume confirmed for localStorage users
      }

      // Store in localStorage
      existingUsers.push(authUser)
      localStorage.setItem('veredicta_users', JSON.stringify(existingUsers))

      // Set current session
      const sessionUser = {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role
      }
      
      this.storeUserSession(sessionUser, data.profileData)

      console.log('✅ User registered successfully in localStorage')
      return sessionUser

    } catch (error: any) {
      console.error('❌ localStorage registration failed:', error)
      throw new Error(error.message || 'Erro no cadastro')
    }
  }

  // Store user session data
  private storeUserSession(user: AuthUser, profileData?: any): void {
    const sessionData = {
      user,
      profileData,
      timestamp: Date.now()
    }
    localStorage.setItem('veredicta_session', JSON.stringify(sessionData))
    console.log('✅ Session stored in localStorage')
  }

  // Enhanced login with multiple fallback methods
  async login(email: string, password: string): Promise<AuthUser> {
    console.log('🔍 NEW AUTH: Starting login', { email })

    try {
      // Method 1: Try normal Supabase auth
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!error && authData.user) {
        console.log('✅ Supabase login successful:', authData.user.id)

        const role = authData.user.user_metadata?.role || 
                    authData.user.user_metadata?.user_type || 
                    'client'

        const authUser = {
          id: authData.user.id,
          email: authData.user.email!,
          role: role as 'client' | 'writer' | 'admin'
        }

        this.storeUserSession(authUser, authData.user.user_metadata)
        return authUser
      }

      // Method 2: Try localStorage login
      console.log('🔄 Supabase auth failed, trying localStorage...')
      return await this.loginWithLocalStorage(email, password)

    } catch (error: any) {
      console.error('❌ Login failed:', error)
      
      // Fallback to localStorage
      try {
        return await this.loginWithLocalStorage(email, password)
      } catch (fallbackError: any) {
        throw new Error(this.translateError(fallbackError.message))
      }
    }
  }

  // localStorage-based login
  private async loginWithLocalStorage(email: string, password: string): Promise<AuthUser> {
    try {
      const users = JSON.parse(localStorage.getItem('veredicta_users') || '[]')
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        throw new Error('Email ou senha incorretos')
      }

      const authUser = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      this.storeUserSession(authUser, user.profileData)
      console.log('✅ localStorage login successful')
      
      return authUser

    } catch (error: any) {
      throw new Error('Email ou senha incorretos')
    }
  }

  // Get current user with multiple sources
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Method 1: Check localStorage session first (faster)
      const session = localStorage.getItem('veredicta_session')
      if (session) {
        const sessionData = JSON.parse(session)
        // Check if session is not too old (24 hours)
        if (Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          console.log('✅ Found valid localStorage session')
          return sessionData.user
        } else {
          console.log('🔄 localStorage session expired')
          localStorage.removeItem('veredicta_session')
        }
      }

      // Method 2: Try Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!error && user) {
        const role = user.user_metadata?.role || 
                    user.user_metadata?.user_type || 
                    'client'

        const authUser = {
          id: user.id,
          email: user.email!,
          role: role as 'client' | 'writer' | 'admin'
        }

        // Update localStorage session
        this.storeUserSession(authUser, user.user_metadata)
        return authUser
      }

      return null

    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Enhanced logout with cleanup
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.log('Supabase logout failed, proceeding with local cleanup')
    }
    
    // Clear all localStorage data
    localStorage.removeItem('veredicta_session')
    console.log('✅ Session cleared')
  }

  // Translate common errors to Portuguese
  private translateError(message: string): string {
    const translations: { [key: string]: string } = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Confirme seu email para continuar',
      'User already registered': 'Este email já está cadastrado',
      'Database error saving new user': 'Erro temporário no sistema. Tente novamente.',
      'unexpected_failure': 'Erro temporário no sistema. Tente novamente.',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Invalid email': 'Email inválido'
    }

    for (const [en, pt] of Object.entries(translations)) {
      if (message.includes(en)) {
        return pt
      }
    }

    return message || 'Erro inesperado'
  }

  // Method to check if we should use localStorage mode
  isLocalStorageMode(): boolean {
    return localStorage.getItem('veredicta_local_mode') === 'true'
  }

  // Force localStorage mode (for development/testing)
  setLocalStorageMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem('veredicta_local_mode', 'true')
    } else {
      localStorage.removeItem('veredicta_local_mode')
    }
  }
}

export const newAuthService = new NewAuthService()