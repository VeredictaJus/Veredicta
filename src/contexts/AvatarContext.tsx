// src/contexts/AvatarContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNewAuth } from '@/contexts/NewAuthContext'

type Ctx = {
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  updateAvatar: (file: File) => Promise<string>
  updateAvatarFromBase64: (base64Url: string) => void
  reloadAvatar: () => Promise<void>
  isUploading: boolean
}

const AvatarContext = createContext<Ctx | undefined>(undefined)

export const useAvatar = () => {
  const ctx = useContext(AvatarContext)
  if (!ctx) throw new Error('useAvatar must be used within an AvatarProvider')
  return ctx
}

export const AvatarProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [skipNextLoad, setSkipNextLoad] = useState(false)
  
  // Use the hook defensively - check if context is available
  let user, getClient
  try {
    const authContext = useNewAuth()
    user = authContext.user
    getClient = authContext.getClient
  } catch (error) {
    // Context not available yet, use fallback values
    user = null
    getClient = null
  }

  useEffect(() => {
    if (!user?.uid) {
      setAvatarUrl(null)
      return
    }
    
    // Se acabamos de atualizar manualmente, pular o reload
    if (skipNextLoad) {
      setSkipNextLoad(false)
      return
    }
    
    console.log('🔄 [AVATAR] Carregando avatar para usuário:', user.uid)
    loadUserAvatar().catch((e) => {
      console.error('❌ [AVATAR] Erro ao carregar avatar:', e)
      setAvatarUrl(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const loadUserAvatar = async () => {
    if (!user?.uid || !getClient) {
      console.warn('⚠️ [AVATAR] Não é possível carregar avatar - usuário ou cliente não disponível')
      return
    }
    try {
      const { supabase } = await getClient()
      
      console.log('🔍 [AVATAR] Buscando avatar em profiles_v2 para:', user.uid)
      // Primeiro tenta ler de profiles_v2 (tabela principal usada pelo chat)
      // Usar ilike para case-insensitive
      let { data, error } = await supabase
        .from('profiles_v2')
        .select('avatar_url')
        .ilike('firebase_uid', user.uid)
        .maybeSingle()

      console.log('🔍 [AVATAR] Resultado profiles_v2:', { hasData: !!data, hasAvatar: !!data?.avatar_url, error: error?.code })

      // Se não encontrar em profiles_v2, tenta em user_profiles (fallback)
      if ((!data?.avatar_url || error) && error?.code === 'PGRST116') {
        console.log('🔍 [AVATAR] Buscando avatar em user_profiles (fallback)')
        const result = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .ilike('firebase_uid', user.uid)
          .maybeSingle()
        
        data = result.data
        error = result.error
        console.log('🔍 [AVATAR] Resultado user_profiles:', { hasData: !!data, hasAvatar: !!data?.avatar_url, error: error?.code })
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [AVATAR LOAD] Erro na query:', error)
        return
      }

      let finalUrl = data?.avatar_url ?? null
      console.log('📸 [AVATAR] Avatar encontrado:', finalUrl ? 'Sim' : 'Não', finalUrl ? `(${finalUrl.substring(0, 50)}...)` : '')
      
      // Se temos uma URL, verificar o tipo
      if (finalUrl) {
        // Se é base64 (data:image/...), usar diretamente sem modificações
        if (finalUrl.startsWith('data:image/')) {
          setAvatarUrl(finalUrl)
          return
        }
        
        // Se é URL pública (não contém /sign/), tentar gerar URL assinada como fallback
        if (finalUrl.includes('/object/public/')) {
          // Extrair o path do arquivo da URL pública
          // Exemplo: https://xxx.supabase.co/storage/v1/object/public/avatars/userId/file.jpg
          const pathMatch = finalUrl.match(/\/avatars\/(.+)$/)
          if (pathMatch) {
            const filePath = pathMatch[1].split('?')[0] // Remove query params
            
            try {
              const { data: signedData, error: signedError } = await supabase.storage
                .from('avatars')
                .createSignedUrl(filePath, 3600 * 24 * 365) // 1 ano
              
              if (!signedError && signedData?.signedUrl) {
                finalUrl = signedData.signedUrl
              } else {
                // Adicionar timestamp à URL pública para evitar cache
                if (!finalUrl.includes('?t=')) {
                  finalUrl = `${finalUrl}?t=${Date.now()}`
                }
              }
            } catch (err) {
              // Adicionar timestamp à URL pública para evitar cache
              if (!finalUrl.includes('?t=')) {
                finalUrl = `${finalUrl}?t=${Date.now()}`
              }
            }
          } else {
            // Se não conseguir extrair o path, usar URL pública com timestamp
            if (!finalUrl.includes('?t=')) {
              finalUrl = `${finalUrl}?t=${Date.now()}`
            }
          }
        } else if (finalUrl.includes('/object/sign/')) {
          // Já é URL assinada, usar diretamente
        } else {
          // Outro tipo de URL, adicionar timestamp
          if (!finalUrl.includes('?t=')) {
            finalUrl = `${finalUrl}?t=${Date.now()}`
          }
        }
      }
      
      setAvatarUrl(finalUrl)
      console.log('✅ [AVATAR] Avatar carregado com sucesso:', finalUrl ? 'Sim' : 'Não (usando fallback)')
    } catch (error) {
      console.error('❌ [AVATAR] Erro ao carregar avatar:', error)
      setAvatarUrl(null)
    }
  }

  const updateAvatar = async (file: File): Promise<string> => {
    if (!user?.uid || !getClient) throw new Error('Usuário não autenticado')

    if (file.size > 2 * 1024 * 1024) throw new Error('Arquivo muito grande (máx. 2MB)')
    const okTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!okTypes.includes(file.type)) throw new Error('Use JPG, PNG, GIF ou WEBP')

    setIsUploading(true)
    try {
      const { supabase } = await getClient()

      // 1) Upload no bucket "avatars"
      const ext = file.name.split('.').pop() || 'png'
      const path = `avatar-${user.uid}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true })
      if (upErr) throw upErr

      // 2) URL pública
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = pub.publicUrl

      // 3) Salva no perfil em AMBAS as tabelas para compatibilidade
      // Primeiro tenta salvar em profiles_v2 (tabela principal usada pelo chat)
      // Usar ilike para case-insensitive
      const { error: dbErr1 } = await supabase
        .from('profiles_v2')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString() 
        })
        .ilike('firebase_uid', user.uid)
      
      // Depois tenta em user_profiles (se existir)
      // Buscar email para incluir no upsert (campo obrigatório)
      const { data: emailData } = await supabase
        .from('profiles_v2')
        .select('email')
        .ilike('firebase_uid', user.uid)
        .single()
      
      const { error: dbErr2 } = await supabase
        .from('user_profiles')
        .upsert({ 
          firebase_uid: user.uid,
          email: emailData?.email || user.email || '',
          avatar_url: publicUrl 
        }, { 
          onConflict: 'firebase_uid' 
        })
      
      // Se ambos falharem, lança erro
      if (dbErr1 && dbErr2) {
        console.error('❌ [AVATAR SAVE] Ambos falharam:', { dbErr1, dbErr2 })
        throw new Error('Erro ao salvar avatar no banco de dados')
      }

      setAvatarUrl(publicUrl)
      return publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  const updateAvatarFromBase64 = (base64Url: string) => {
    // Marcar para pular o próximo reload automático
    setSkipNextLoad(true)
    
    // Atualizar o estado
    setAvatarUrl(base64Url)
  }

  const reloadAvatar = async () => {
    await loadUserAvatar()
  }

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl, updateAvatar, updateAvatarFromBase64, reloadAvatar, isUploading }}>
      {children}
    </AvatarContext.Provider>
  )
}