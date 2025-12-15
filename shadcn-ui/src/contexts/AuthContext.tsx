import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, ClientProfile, WriterProfile, AdminProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: ClientProfile | WriterProfile | AdminProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, role: UserRole, profileData: any) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'cliente@escritorio.com',
    password: '123456',
    role: 'CLIENT',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  {
    id: '2',
    email: 'redator@juridico.com',
    password: '123456',
    role: 'WRITER',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  {
    id: '3',
    email: 'admin@veredicta.com',
    password: '123456',
    role: 'ADMIN',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
];

const mockProfiles = {
  '1': {
    id: '1',
    user_id: '1',
    company_name: 'Escritório Advocacia Silva & Associados',
    cnpj: '12.345.678/0001-90',
    plan_id: '2',
    credits_balance: 85,
    contact_person: 'Dr. João Silva',
    phone: '(11) 99999-9999',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    created_at: '2024-01-01T00:00:00Z',
  } as ClientProfile,
  '2': {
    id: '2',
    user_id: '2',
    full_name: 'Maria Santos',
    cpf: '123.456.789-00',
    oab_number: 'OAB/SP 123456',
    specializations: ['Direito Civil', 'Direito Trabalhista'],
    hourly_rate: 150,
    rating: 4.8,
    completed_petitions: 47,
    pending_payment: 1250.00,
    created_at: '2024-01-01T00:00:00Z',
  } as WriterProfile,
  '3': {
    id: '3',
    user_id: '3',
    full_name: 'Carlos Admin',
    permissions: ['all'],
    department: 'Tecnologia',
    created_at: '2024-01-01T00:00:00Z',
  } as AdminProfile,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClientProfile | WriterProfile | AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('veredicta_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setProfile(mockProfiles[userData.id]);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setProfile(mockProfiles[foundUser.id]);
      localStorage.setItem('veredicta_user', JSON.stringify(userWithoutPassword));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('veredicta_user');
  };

  const register = async (email: string, password: string, role: UserRole, profileData: any): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration success
    const newUser: User = {
      id: Date.now().toString(),
      email,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };
    
    setUser(newUser);
    localStorage.setItem('veredicta_user', JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      logout,
      register,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}