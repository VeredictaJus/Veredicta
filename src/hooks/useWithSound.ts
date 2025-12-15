import { useRef, useEffect } from 'react';

export function useWithSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
  }, [src]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // erro silencioso se o navegador bloquear autoplay
      });
    }
  };

  return playSound;
}
