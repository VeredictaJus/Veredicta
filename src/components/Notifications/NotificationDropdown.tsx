import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { BellOff } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { user } = useNewAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    const userRole = user?.role?.toLowerCase();
    if (userRole) {
      navigate(`/${userRole}/notifications`);
    }
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 z-50"
    >
      <div className="w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
        {/* Header fixo */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notificações
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 text-xs px-2 py-1"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        {/* Área de scroll */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma notificação no momento
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Você será notificado sobre atualizações importantes
              </p>
            </div>
          )}
        </div>
        
        {/* Footer fixo */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewAll}
              className="w-full text-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 font-medium py-2"
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}