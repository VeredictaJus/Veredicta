// src/contexts/NotificationSoundContext.tsx
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

type Ctx = {
  enabled: boolean;
  toggle: () => void;
  play: (file?: string) => Promise<void>;
};

const NotificationSoundContext = createContext<Ctx | null>(null);

export const NotificationSoundProvider: React.FC<{ children: React.ReactNode; src?: string }> = ({
  children,
  src = '/sounds/ding.mp3/light-562.mp3',
}) => {
  const [enabled, setEnabled] = useState(true);

  const play = useCallback(async (override?: string) => {
    if (!enabled) return;
    try {
      const audio = new Audio(override || src);
      await audio.play();
    } catch {
      /* ignore */
    }
  }, [enabled, src]);

  const toggle = useCallback(() => setEnabled(v => !v), []);
  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return (
    <NotificationSoundContext.Provider value={value}>
      {children}
    </NotificationSoundContext.Provider>
  );
};

export const useNotificationSound = () => {
  const ctx = useContext(NotificationSoundContext);
  if (!ctx) {
    // Silenciar aviso para evitar ruído quando o provider ainda não montou
    // Retornar um contexto padrão ao invés de lançar erro
    return {
      enabled: true,
      toggle: () => {},
      play: async () => {}
    } as Ctx;
  }
  return ctx;
};
