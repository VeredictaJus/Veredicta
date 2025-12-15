export interface Notification {
  id: string;
  type: 'petition' | 'message' | 'payment' | 'status' | 'support';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  userId?: string;
  icon?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}