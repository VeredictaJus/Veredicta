// src/services/productionAuthService.ts
import { createClient } from '@supabase/supabase-js'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { EmailService } from './emailService'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dmsodonmkffyvbuxtxec.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg"

// Validar URLs antes de criar o cliente
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Cliente Supabase para produção - SINGLETON para evitar múltiplas instâncias
let supabase: any = null

const getSupabaseClient = () => {
  if (!supabase) {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && isValidUrl(SUPABASE_URL)) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      console.log('✅ Cliente Supabase criado (singleton)')
    } else {
      console.warn('⚠️ Supabase não configurado corretamente. URLs inválidas ou ausentes.')
    }
  }
  return supabase
}

export interface UserProfile {
  id: string
  firebase_uid: string
  email: string
  role: 'client' | 'writer' | 'admin'
  full_name?: string
  company_name?: string
  cnpj?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface AuthUser {
  uid: string
  email: string
  role: 'client' | 'writer' | 'admin'
  profile?: UserProfile
}

class ProductionAuthService {
  private static instance: ProductionAuthService
  public currentUser: AuthUser | null = null

  static getInstance(): ProductionAuthService {
    if (!ProductionAuthService.instance) {
      ProductionAuthService.instance = new ProductionAuthService()
    }
    return ProductionAuthService.instance
  }

  // Login com Firebase + criação automática de perfil
  async login(email: string, password: string, roleHint?: 'client' | 'writer' | 'admin'): Promise<AuthUser> {
    try {
      console.log('🔐 Iniciando login de produção...')
      
      // 1. Autenticar com Firebase
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password)
      if (!fbUser) throw new Error('Falha na autenticação Firebase')

      console.log('✅ Firebase auth successful:', fbUser.uid)

      // 2. Buscar ou criar perfil no Supabase
      const profile = await this.getOrCreateProfile(fbUser.uid, email, roleHint)

      // 3. Criar objeto de usuário
      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: profile.email,
        role: profile.role,
        profile
      }

      this.currentUser = authUser
      console.log('✅ Login completo:', authUser)
      
      return authUser
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      throw new Error(this.translateError(error.message))
    }
  }

  // Registro com Firebase + criação automática de perfil
  async register(email: string, password: string, role: 'client' | 'writer' | 'admin', profileData?: any): Promise<AuthUser> {
    try {
      console.log('📝 Iniciando registro de produção...')
      console.log('🔍 ProductionAuthService - ROLE RECEBIDO DO NewAuthContext:', role)
      console.log('🔍 ProductionAuthService - role === "writer":', role === 'writer')
      console.log('🔍 ProductionAuthService - typeof role:', typeof role)
      
      // 1. Criar usuário no Firebase
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)
      if (!fbUser) throw new Error('Falha no registro Firebase')

      console.log('✅ Firebase registration successful:', fbUser.uid)

      // 2. Criar perfil no Supabase
      console.log('🔍 ProductionAuthService - CHAMANDO createProfile com role:', role)
      const profile = await this.createProfile(fbUser.uid, email, role, profileData)

      // 3. Criar objeto de usuário
      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: profile.email,
        role: profile.role,
        profile
      }

      this.currentUser = authUser
      console.log('✅ Registro completo:', authUser)
      
      // Enviar email de boas-vindas para clientes
      if (role === 'client') {
        try {
          const clientName = profileData?.company_name || profileData?.full_name || email.split('@')[0]
          await EmailService.sendWelcomeEmail(email, clientName)
          console.log('📧 Email de boas-vindas enviado para cliente:', email)
        } catch (emailError) {
          console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError)
          // Não falhar o registro se o email falhar
        }
      }

      // Enviar email de confirmação
      try {
        const baseApiUrl = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : ''
        const endpoint = `${baseApiUrl}/api/auth/email-confirmation-link`

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            redirectTo: `${window.location.origin}/#/auth/email-confirmed`
          })
        })

        if (response.ok) {
          const { confirmationLink } = await response.json()
          if (confirmationLink) {
            await EmailService.sendEmailConfirmation(email, confirmationLink)
            console.log('📧 Email de confirmação enviado:', email)
          } else {
            console.warn('⚠️ API de confirmação não retornou link válido')
          }
        } else {
          const result = await response.json().catch(() => ({}))
          console.warn('⚠️ Falha ao gerar link de confirmação personalizado:', result)
        }
      } catch (confirmationError) {
        console.error('⚠️ Erro ao enviar email de confirmação:', confirmationError)
      }
      
      return authUser
    } catch (error: any) {
      console.error('❌ Erro no registro:', error)
      throw new Error(this.translateError(error.message))
    }
  }

  // Buscar perfil do usuário (sem criar se não existir)
  public async getProfile(firebaseUid: string): Promise<UserProfile> {
    try {
      console.log('🔍 ProductionAuthService - Buscando perfil para:', firebaseUid)
      
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        throw new Error('Supabase não disponível')
      }

      const { data: profile, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single()

      if (error) {
        throw error
      }

      if (!profile) {
        throw new Error('Perfil não encontrado')
      }

      console.log('✅ Perfil encontrado:', profile)
      return profile
    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil:', error)
      throw error
    }
  }

  // Buscar ou criar perfil (método público)
  public async getOrCreateProfile(firebaseUid: string, email: string, roleHint?: 'client' | 'writer' | 'admin'): Promise<UserProfile> {
    try {
      // Verificar se Supabase está disponível
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        console.warn('⚠️ Supabase não disponível, usando fallback')
        return this.createFallbackProfile(firebaseUid, email, roleHint)
      }

      // 1. Tentar buscar perfil existente usando função RPC
      const { data: existingProfile, error: fetchError } = await supabaseClient
        .rpc('get_user_profile', { p_firebase_uid: firebaseUid })

      if (!fetchError && existingProfile) {
        console.log('✅ Perfil encontrado:', existingProfile)
        return existingProfile
      }

      // 2. Se não encontrou, criar novo perfil
      console.log('🔄 Criando novo perfil...')
      return await this.createProfile(firebaseUid, email, roleHint || 'client')
    } catch (error: any) {
      console.error('❌ Erro ao buscar/criar perfil:', error)
      
      // Fallback: criar perfil básico sem Supabase
      return this.createFallbackProfile(firebaseUid, email, roleHint)
    }
  }

  // Criar perfil usando função RPC
  private async createProfile(firebaseUid: string, email: string, role: 'client' | 'writer' | 'admin', profileData?: any): Promise<UserProfile> {
    try {
      console.log('🔍 ProductionAuthService - createProfile:', { firebaseUid, email, role, profileData })
      
      // Verificar se Supabase está disponível
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        console.warn('⚠️ Supabase não disponível, usando fallback')
        return this.createFallbackProfile(firebaseUid, email, role)
      }

      const rpcParams = {
        p_firebase_uid: firebaseUid,
        p_email: email,
        p_role: role,
        p_full_name: profileData?.full_name || null,
        p_company_name: profileData?.company_name || null,
        p_cnpj: profileData?.cnpj || null,
        p_phone: profileData?.phone || null,
        p_address: profileData?.address || null
      }
      
            console.log('🔍 ProductionAuthService - Chamando RPC create_or_update_user_profile com:', rpcParams)
            
            const { data, error } = await supabaseClient.rpc('create_or_update_user_profile', rpcParams)
            
            // NOVO LOG CRÍTICO: O que a RPC retornou para a aplicação
            console.log('🔍 ProductionAuthService - RESPOSTA DIRETA DO RPC:', { data, error })
            console.log('🔍 ProductionAuthService - DADOS COMPLETOS DA RPC:', JSON.stringify(data, null, 2))

      if (error) throw error
      if (!data) throw new Error('Falha ao criar perfil')

      // VALIDAÇÃO CRÍTICA: Verificar se o role foi salvo corretamente
      console.log('🔍 ProductionAuthService - COMPARANDO ROLES:')
      console.log('  - Role enviado para RPC:', role)
      console.log('  - Role retornado pela RPC:', data.role)
      console.log('  - São iguais?', data.role === role)
      
      if (data.role !== role) {
        console.error('❌ ERRO CRÍTICO: Role não foi salvo corretamente!')
        console.error('❌ Role esperado:', role)
        console.error('❌ Role salvo:', data.role)
        console.error('❌ Dados completos:', data)
        
        // Tentar corrigir imediatamente - MÚLTIPLAS TENTATIVAS
        console.log('🔄 Tentando corrigir o role...')
        
        let correctionSuccess = false
        let attempts = 0
        const maxAttempts = 3
        
        while (!correctionSuccess && attempts < maxAttempts) {
          attempts++
          console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de correção...`)
          
          const { error: updateError } = await supabaseClient
            .from('user_profiles')
            .update({ 
              role: role,
              status: role === 'writer' ? 'pending_approval' : 'approved',
              updated_at: new Date().toISOString()
            })
            .eq('firebase_uid', firebaseUid)
          
          if (updateError) {
            console.error(`❌ Falha na tentativa ${attempts}:`, updateError)
            if (attempts < maxAttempts) {
              // Aguardar um pouco antes da próxima tentativa
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } else {
            console.log(`✅ Correção bem-sucedida na tentativa ${attempts}!`)
            correctionSuccess = true
          }
        }
        
        if (!correctionSuccess) {
          console.error('❌ FALHA CRÍTICA: Não foi possível corrigir o role após', maxAttempts, 'tentativas')
          throw new Error(`Falha crítica: Role não foi salvo corretamente após ${maxAttempts} tentativas de correção`)
        }
        
        // Buscar o perfil atualizado após correção
        console.log('🔍 Buscando perfil atualizado após correção...')
        const { data: updatedData, error: fetchError } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .single()
        
        if (fetchError) {
          console.error('❌ Erro ao buscar perfil atualizado:', fetchError)
          throw new Error('Falha ao verificar correção do role')
        }
        
        if (updatedData) {
          console.log('✅ Perfil atualizado encontrado:', {
            role: updatedData.role,
            status: updatedData.status
          })
          data.role = updatedData.role
          data.status = updatedData.status
        }
      } else {
        console.log('✅ Role salvo corretamente:', data.role)
      }

      console.log('✅ Perfil criado:', data)
      
      // Se for cliente, atribuir plano gratuito automaticamente
      if (role === 'client') {
        await this.assignFreePlan(firebaseUid)
      }
      
      return data
    } catch (error: any) {
      console.error('❌ Erro ao criar perfil:', error)
      
      // Fallback: retornar perfil básico
      return this.createFallbackProfile(firebaseUid, email, role)
    }
  }

  // Atribuir plano gratuito automaticamente para novos clientes
  private async assignFreePlan(firebaseUid: string): Promise<void> {
    try {
      console.log('🆓 Atribuindo plano gratuito para:', firebaseUid)
      
      // Usar função RPC para atribuir plano gratuito
      const supabaseClient = getSupabaseClient()
      if (supabaseClient) {
        const { error } = await supabaseClient.rpc('assign_free_plan_to_user', {
          p_firebase_uid: firebaseUid
        })

        if (error) {
          console.error('❌ Erro ao atribuir plano gratuito:', error)
          // Não falhar o cadastro se não conseguir atribuir o plano
          console.warn('⚠️ Continuando cadastro sem plano gratuito')
        } else {
          console.log('✅ Plano gratuito atribuído com sucesso')
        }
      } else {
        console.warn('⚠️ Supabase não disponível para atribuir plano gratuito')
      }
    } catch (error) {
      console.error('❌ Erro ao atribuir plano gratuito:', error)
      // Não falhar o cadastro se não conseguir atribuir o plano
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth)
      this.currentUser = null
      console.log('✅ Logout realizado')
    } catch (error: any) {
      console.error('❌ Erro no logout:', error)
      throw error
    }
  }

  // Recuperar senha
  async forgotPassword(email: string): Promise<void> {
    try {
      // 1. Gerar link oficial via backend (Firebase Admin)
      const baseApiUrl = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : ''
      const endpoint = `${baseApiUrl}/api/auth/password-reset-link`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/#/auth/reset-password`
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao gerar link de reset personalizado')
      }

      const { resetLink } = await response.json()

      if (!resetLink) {
        throw new Error('Link de reset não retornado pelo backend')
      }

      // Converter o link do Firebase para a rota personalizada da aplicação
      const buildCustomResetLink = (firebaseLink: string): string => {
        try {
          // Validar firebaseLink antes de usar
          if (!firebaseLink || !isValidUrl(firebaseLink)) {
            throw new Error('Link do Firebase inválido')
          }
          
          const parsed = new URL(firebaseLink)
          const oobCode = parsed.searchParams.get('oobCode')
          const mode = parsed.searchParams.get('mode') || 'resetPassword'
          const lang = parsed.searchParams.get('lang')
          const continueUrl = parsed.searchParams.get('continueUrl')

          // Garantir que appBaseUrl seja uma URL válida
          // Sempre usar window.location.origin como fallback seguro
          let appBaseUrl = window.location.origin
          
          // Tentar usar VITE_APP_URL se for válida
          const envAppUrl = import.meta.env.VITE_APP_URL
          if (envAppUrl && typeof envAppUrl === 'string' && envAppUrl.trim() !== '' && isValidUrl(envAppUrl)) {
            appBaseUrl = envAppUrl.replace(/\/$/, '')
          }
          
          // Garantir que appBaseUrl seja válida antes de construir URL
          if (!isValidUrl(appBaseUrl)) {
            appBaseUrl = window.location.origin
          }
          
          const customUrl = new URL(`${appBaseUrl}/#/auth/reset-password`)

          if (oobCode) customUrl.searchParams.set('oobCode', oobCode)
          if (mode) customUrl.searchParams.set('mode', mode)
          if (lang) customUrl.searchParams.set('lang', lang)
          if (continueUrl) customUrl.searchParams.set('continueUrl', continueUrl)

          return customUrl.toString()
        } catch (error) {
          console.warn('⚠️ Não foi possível converter o link de reset. Usando link original do Firebase.', error)
          return firebaseLink
        }
      }

      const customResetLink = buildCustomResetLink(resetLink)

      // 2. Buscar nome do usuário no perfil (quando disponível)
      let userName = email.split('@')[0]

      try {
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, company_name')
            .eq('email', email)
            .single()

          if (profile) {
            userName = profile.full_name || profile.company_name || userName
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Não foi possível obter nome do usuário para o reset:', profileError)
      }

      // 3. Enviar apenas o email customizado com link funcional
      await EmailService.sendPasswordResetEmail(email, userName, customResetLink)
      console.log('📧 Email customizado de reset enviado:', email)
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de recuperação customizado:', error)

      // Fallback: tentar enviar email padrão do Firebase
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/#/auth/reset-password`
        })
        console.log('✅ Email padrão do Firebase enviado como fallback')
      } catch (fallbackError: any) {
        console.error('❌ Falha também no fallback do Firebase:', fallbackError)
        const message = fallbackError?.message || error?.message || 'Não foi possível enviar o email de redefinição'
        throw new Error(this.translateError(message))
      }
    }
  }

  // Obter usuário atual
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  // Obter cliente Supabase
  // NOTA: Não precisa de autenticação Supabase porque as políticas RLS 
  // verificam o Firebase UID diretamente na tabela user_profiles
  async getSupabaseClient() {
    return getSupabaseClient()
  }

  // Criar perfil de fallback quando Supabase não está disponível
  private createFallbackProfile(firebaseUid: string, email: string, role?: 'client' | 'writer' | 'admin'): UserProfile {
    return {
      id: `fallback_${Date.now()}`,
      firebase_uid: firebaseUid,
      email: email,
      role: role || 'client',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    }
  }

  // Traduzir erros
  private translateError(message: string): string {
    const errorMap: { [key: string]: string } = {
      'auth/invalid-credential': 'Email ou senha incorretos',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/invalid-email': 'Email inválido'
    }

    for (const [key, value] of Object.entries(errorMap)) {
      if (message.includes(key)) {
        return value
      }
    }

    return message || 'Erro desconhecido'
  }
}

export default ProductionAuthService.getInstance()

// Exportar a função getSupabaseClient para uso em outros arquivos
export { getSupabaseClient }
