import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'

type TypingUser = { id: string; name: string };

export function useTyping(conversationId: string, userId: string, userName: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutMap = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const u = payload as TypingUser;
        if (!u || u.id === userId) return;

        setTypingUsers(prev => {
          const next = [...prev.filter(p => p.id !== u.id), u];
          clearTimeout(timeoutMap.current[u.id]);
          timeoutMap.current[u.id] = setTimeout(() => {
            setTypingUsers(p => p.filter(x => x.id !== u.id));
          }, 3000);
          return next;
        });
      })
      .subscribe();

    return () => {
      Object.values(timeoutMap.current).forEach(clearTimeout);
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  const startTyping = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { id: userId, name: userName } as TypingUser,
    });
  };

  return { typingUsers, startTyping };
}
