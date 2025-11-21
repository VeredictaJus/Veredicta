import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotificationSound } from '@/contexts/NotificationSoundContext';

type Props = { className?: string };

const NotificationBell: React.FC<Props> = ({ className = '' }) => {
  const { enabled, toggle, play } = useNotificationSound();

  return (
    <button
      type="button"
      onClick={() => {
        // se estava desligado, ao ligar tocamos um ding rápido
        const wasDisabled = !enabled;
        toggle();
        if (wasDisabled) {
          // pequeno atraso para evitar bloqueio do autoplay em alguns browsers
          setTimeout(() => play(), 0);
        }
      }}
      title={enabled ? 'Desativar som de notificações' : 'Ativar som de notificações'}
      aria-label="Alternar som de notificações"
      className={`rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10 transition ${className}`}
    >
      {enabled ? (
        <Bell size={18} className="text-orange-600" />
      ) : (
        <BellOff size={18} className="text-gray-400" />
      )}
    </button>
  );
};

export default NotificationBell;
