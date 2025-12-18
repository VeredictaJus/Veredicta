import React from 'react';
import { useAvatar } from '@/contexts/AvatarContext';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export function UserAvatar({ size = 'md', className = '' }: UserAvatarProps) {
  const { avatarUrl } = useAvatar();
  const { user } = useNewAuth();
  const { profile: userProfile } = useUser();

  // Verificar se é admin - se for, usar logo fixo
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin' || 
                  user?.email?.includes('@veredictajus.com') || 
                  user?.email?.includes('contato@veredictajus.com');
  
  // Se for admin, usar logo fixo da Veredicta do Supabase Storage
  const logoUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';
  const finalAvatarUrl = isAdmin ? logoUrl : avatarUrl;


  const getInitials = () => {
    if (!user) return 'U';
    
    // Usar o nome do UserContext que já está sincronizado com o banco
    if (userProfile?.name) {
      return userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    // Fallback: tentar pegar do perfil completo do NewAuthContext
    if (user?.profile) {
      const profile = user.profile as any;
      if (profile.company_name) {
        return profile.company_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      }
      if (profile.full_name) {
        return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      }
    }
    
    // Último fallback: usar email
    return user.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  // SOLUÇÃO SIMPLES: Renderizar img diretamente se houver avatarUrl
  if (finalAvatarUrl) {
    // Adicionar timestamp ou hash para forçar re-render quando URL mudar
    const imageKey = finalAvatarUrl.startsWith('data:') 
      ? `base64-${finalAvatarUrl.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '')}`
      : finalAvatarUrl;
    
    return (
      <div className={`${sizeClass} ${className} relative flex shrink-0 overflow-hidden rounded-full`}>
        <img
          key={imageKey}
          src={finalAvatarUrl}
          alt={user?.fullName || user?.email || 'Avatar'}
          className="h-full w-full object-cover"
          style={{ display: 'block' }}
          onLoad={() => {
          }}
          onError={(e) => {
            console.error('❌ [UserAvatar] Erro ao carregar imagem:', finalAvatarUrl?.substring(0, 50));
            // Se falhar, mostrar fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div 
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-blue-500 ${textSizeClass} text-white font-medium`}
          style={{ display: 'none' }}
        >
          {getInitials()}
        </div>
      </div>
    );
  }

  // Fallback quando não há avatar
  return (
    <div className={`${sizeClass} ${className} relative flex shrink-0 overflow-hidden rounded-full bg-blue-500`}>
      <div className={`flex h-full w-full items-center justify-center ${textSizeClass} text-white font-medium`}>
        {getInitials()}
      </div>
    </div>
  );
}