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
      console.log('⏭️ [AVATAR LOAD] Pulando reload - atualização manual recente')
      setSkipNextLoad(false)
      return
    }
    
    loadUserAvatar().catch((e) => {
      console.error('Avatar: load error', e)
      setAvatarUrl(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const loadUserAvatar = async () => {
    if (!user?.uid || !getClient) return
    try {
      console.log('🔍 [AVATAR LOAD] Iniciando carregamento para:', user.uid)
      const { supabase } = await getClient()
      
      // Primeiro tenta ler de profiles_v2 (tabela principal usada pelo chat)
      // Usar ilike para case-insensitive
      let { data, error } = await supabase
        .from('profiles_v2')
        .select('avatar_url')
        .ilike('firebase_uid', user.uid)
        .maybeSingle()

      console.log('📊 [AVATAR LOAD] Resultado profiles_v2:', {
        hasData: !!data,
        avatar_url: data?.avatar_url,
        error: error?.message
      })

      // Se não encontrar em profiles_v2, tenta em user_profiles (fallback)
      if ((!data?.avatar_url || error) && error?.code === 'PGRST116') {
        console.log('⚠️ [AVATAR LOAD] Tentando user_profiles como fallback...')
        const result = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .ilike('firebase_uid', user.uid)
          .maybeSingle()
        
        data = result.data
        error = result.error
        
        console.log('📊 [AVATAR LOAD] Resultado user_profiles:', {
          hasData: !!data,
          avatar_url: data?.avatar_url,
          error: error?.message
        })
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [AVATAR LOAD] Erro na query:', error)
        return
      }

      let finalUrl = data?.avatar_url ?? null
      
      // Se temos uma URL, verificar o tipo
      if (finalUrl) {
        // Se é base64 (data:image/...), usar diretamente sem modificações
        if (finalUrl.startsWith('data:image/')) {
          console.log('✅ [AVATAR LOAD] Base64 detectado, usando diretamente')
          setAvatarUrl(finalUrl)
          return
        }
        
        // Se é URL pública (não contém /sign/), tentar gerar URL assinada como fallback
        if (finalUrl.includes('/object/public/')) {
          console.log('🔄 [AVATAR LOAD] URL pública detectada, tentando gerar URL assinada...')
          
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
                console.log('✅ [AVATAR LOAD] URL assinada gerada com sucesso')
                finalUrl = signedData.signedUrl
              } else {
                console.warn('⚠️ [AVATAR LOAD] Não foi possível gerar URL assinada, usando URL pública')
                // Adicionar timestamp à URL pública para evitar cache
                if (!finalUrl.includes('?t=')) {
                  finalUrl = `${finalUrl}?t=${Date.now()}`
                }
              }
            } catch (err) {
              console.warn('⚠️ [AVATAR LOAD] Erro ao gerar URL assinada:', err)
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
          console.log('✅ [AVATAR LOAD] URL assinada detectada, usando diretamente')
        } else {
          // Outro tipo de URL, adicionar timestamp
          if (!finalUrl.includes('?t=')) {
            finalUrl = `${finalUrl}?t=${Date.now()}`
          }
        }
      }
      
      console.log('✅ [AVATAR LOAD] Avatar final:', {
        hasAvatar: !!finalUrl,
        url: finalUrl,
        userId: user.uid
      })
      setAvatarUrl(finalUrl)
    } catch (error) {
      console.error('Avatar: load error', error)
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
      console.log('💾 [AVATAR SAVE] Iniciando salvamento:', {
        userId: user.uid,
        publicUrl: publicUrl
      })
      
      // Primeiro tenta salvar em profiles_v2 (tabela principal usada pelo chat)
      // Usar ilike para case-insensitive
      const { error: dbErr1 } = await supabase
        .from('profiles_v2')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString() 
        })
        .ilike('firebase_uid', user.uid)
      
      console.log('📊 [AVATAR SAVE] Resultado profiles_v2:', {
        success: !dbErr1,
        error: dbErr1?.message
      })
      
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
      
      console.log('📊 [AVATAR SAVE] Resultado user_profiles:', {
        success: !dbErr2,
        error: dbErr2?.message
      })
      
      // Se ambos falharem, lança erro
      if (dbErr1 && dbErr2) {
        console.error('❌ [AVATAR SAVE] Ambos falharam:', { dbErr1, dbErr2 })
        throw new Error('Erro ao salvar avatar no banco de dados')
      }
      
      console.log('✅ [AVATAR SAVE] Avatar salvo com sucesso:', {
        profiles_v2: !dbErr1 ? '✅' : '❌',
        user_profiles: !dbErr2 ? '✅' : '❌',
        finalUrl: publicUrl
      })

      setAvatarUrl(publicUrl)
      return publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  const updateAvatarFromBase64 = (base64Url: string) => {
    console.log('🔄 [AVATAR UPDATE] Atualizando avatar via Base64:', {
      hasUrl: !!base64Url,
      urlLength: base64Url?.length || 0,
      isBase64: base64Url?.startsWith('data:image/'),
      timestamp: new Date().toISOString()
    })
    
    // Marcar para pular o próximo reload automático
    setSkipNextLoad(true)
    
    // Atualizar o estado
    setAvatarUrl(base64Url)
    console.log('✅ [AVATAR UPDATE] avatarUrl atualizado no estado')
  }

  const reloadAvatar = async () => {
    console.log('Avatar: Recarregando avatar do banco...')
    await loadUserAvatar()
  }

  // Debug: Log quando avatarUrl mudar
  useEffect(() => {
    console.log('🔍 [DEBUG] AvatarContext - avatarUrl changed:', {
      avatarUrl: avatarUrl,
      hasUrl: !!avatarUrl,
      timestamp: new Date().toISOString()
    });
  }, [avatarUrl]);

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl, updateAvatar, updateAvatarFromBase64, reloadAvatar, isUploading }}>
      {children}
    </AvatarContext.Provider>
  )
}