import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { DatabaseService } from '@/services/databaseService';
type Notification = Awaited<
  ReturnType<typeof DatabaseService.getUserNotifications>
>[number];
import { useNewAuth } from './NewAuthContext';
import { useNotificationSound } from '@/contexts/NotificationSoundContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  /** Enfileira uma notificação local (ex.: evento interno) */
  push: (n: Partial<Notification> & { title: string; body?: string }) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // CORREÇÃO CRÍTICA: Verificar se o contexto está disponível antes de usar
  let user = null;
  
  try {
    const authContext = useNewAuth();
    user = authContext.user;
  } catch (error) {
    console.warn('NotificationProvider: NewAuthContext não disponível ainda');
  }
  
  const { play } = useNotificationSound(); // 🔊 som global
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // guarda ids conhecidos pra detectar novas e tocar som
  const knownIdsRef = useRef<Set<string>>(new Set());
  const askedPermissionRef = useRef(false);

  // 🔔 pedir permissão para Notification API (uma vez)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default' && !askedPermissionRef.current) {
      askedPermissionRef.current = true;
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // carga + realtime
  useEffect(() => {
    let unsub: { unsubscribe?: () => void } | null = null;

    const load = async () => {
      if (!user?.uid) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const list = await DatabaseService.getUserNotifications(user.uid);
      setNotifications(list);
      // registra ids carregados
      knownIdsRef.current = new Set(list.map((n) => n.id));
      setLoading(false);

      // assinatura realtime
      unsub = DatabaseService.subscribeToUserNotifications(user.uid, (next) => {
        // detecta novos pelo id
        const prevIds = knownIdsRef.current;
        const nextIds = new Set(next.map((n) => n.id));

        // quais são realmente novos (ex.: INSERT no banco)
        const newlyArrived = next.filter((n) => !prevIds.has(n.id));

        // toca som e dispara desktop p/ cada novo não lido
        if (newlyArrived.length) {
          try { play(); } catch {}
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            newlyArrived.forEach((n) => {
              try {
                new Notification(n.title ?? 'Atualização', {
                  body: n.body ?? '',
                  tag: n.id, // evita duplicadas
                });
              } catch {}
            });
          }
        }

        knownIdsRef.current = nextIds;
        setNotifications(next);
      });
    };

    load();
    return () => {
      unsub?.unsubscribe?.();
    };
  }, [user?.uid, play]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const markAsRead = async (notificationId: string) => {
    const ok = await DatabaseService.markNotificationAsRead(notificationId);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    const ok = await DatabaseService.markAllNotificationsAsRead(user.uid);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const clearAll = async () => {
    if (!user?.uid) return;
    // se você tiver no DatabaseService:
    // await DatabaseService.clearAllNotifications(user.uid);
    // se não tiver, ao menos limpa local:
    setNotifications([]);
    knownIdsRef.current = new Set();
  };

  // push local (ex.: algum evento do app que você quer notificar imediatamente)
  const push: NotificationContextType['push'] = (n) => {
    const id = n.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: Notification = {
      id,
      user_id: user?.uid ?? 'local',
      title: n.title,
      body: n.body ?? '',
      type: (n as any).type ?? 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      // se seu tipo Notification tiver mais campos, adicione aqui…
    } as Notification;

    setNotifications((prev) => [item, ...prev]);
    try { play(); } catch {}
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(item.title, { body: item.body, tag: item.id });
      } catch {}
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    push,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
