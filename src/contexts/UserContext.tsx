import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNewAuth } from './NewAuthContext';
import ProductionAuthService from '@/services/productionAuthService';
import { ClientProfile, WriterProfile, AdminProfile } from '@/types';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateAvatar: (avatar: string) => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useNewAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const authService = ProductionAuthService;

  // Função para carregar perfil do banco de dados
  const loadProfile = async () => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }

    try {
      const dbProfile = await authService.getProfile(user.uid);
      
      // Determinar o nome baseado no tipo de perfil
      let displayName = '';
      if (dbProfile.company_name) {
        displayName = dbProfile.company_name; // Cliente
      } else if (dbProfile.full_name) {
        displayName = dbProfile.full_name; // Redator ou Admin
      } else {
        displayName = user.email?.split('@')[0] || 'Usuário';
      }

      setProfile({
        name: displayName,
        email: dbProfile.email || user.email || '',
        role: dbProfile.role || 'client',
        avatar: dbProfile.avatar_url || undefined
      });
    } catch (error) {
      console.error('❌ Erro ao carregar perfil no UserContext:', error);
      // Fallback para dados básicos do usuário
      setProfile({
        name: user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        role: user.role || 'client',
        avatar: undefined
      });
    }
  };

  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateAvatar = (avatar: string) => {
    setProfile(prev => prev ? { ...prev, avatar } : null);
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, updateAvatar, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};