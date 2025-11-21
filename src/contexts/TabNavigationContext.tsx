import { createContext, useContext, useState, ReactNode } from 'react';

interface TabNavigationContextType {
  navigateToProfileTab: () => void;
  profileTabValue: string;
  setProfileTabValue: (value: string) => void;
}

const TabNavigationContext = createContext<TabNavigationContextType | undefined>(undefined);

export const useTabNavigation = () => {
  const context = useContext(TabNavigationContext);
  if (!context) {
    // Return default values instead of throwing error to prevent crashes
    console.warn('useTabNavigation called outside of TabNavigationProvider, using defaults');
    return {
      navigateToProfileTab: () => console.log('navigateToProfileTab called'),
      profileTabValue: 'profile',
      setProfileTabValue: (value: string) => console.log('setProfileTabValue called with:', value)
    };
  }
  return context;
};

interface TabNavigationProviderProps {
  children: ReactNode;
}

export const TabNavigationProvider = ({ children }: TabNavigationProviderProps) => {
  // Inicializar com valor do localStorage ou 'profile' como padrão
  const [profileTabValue, setProfileTabValue] = useState(() => {
    const saved = localStorage.getItem('profileTabValue');
    return saved || 'profile';
  });

  const navigateToProfileTab = () => {
    console.log('🔍 TabNavigation: navigateToProfileTab called');
    setProfileTabValue('profile');
    localStorage.setItem('profileTabValue', 'profile');
  };

  const setProfileTabValueWithLog = (value: string) => {
    console.log('🔍 TabNavigation: setProfileTabValue called with:', value);
    setProfileTabValue(value);
    localStorage.setItem('profileTabValue', value);
  };

  return (
    <TabNavigationContext.Provider value={{
      navigateToProfileTab,
      profileTabValue,
      setProfileTabValue: setProfileTabValueWithLog
    }}>
      {children}
    </TabNavigationContext.Provider>
  );
};