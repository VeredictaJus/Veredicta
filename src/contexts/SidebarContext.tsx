import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isDisabled: boolean;
  disableSidebar: () => void;
  enableSidebar: () => void;
  disabledReason?: string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string>();

  const disableSidebar = (reason?: string) => {
    setIsDisabled(true);
    setDisabledReason(reason);
  };

  const enableSidebar = () => {
    setIsDisabled(false);
    setDisabledReason(undefined);
  };

  const value = {
    isDisabled,
    disableSidebar,
    enableSidebar,
    disabledReason
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}











