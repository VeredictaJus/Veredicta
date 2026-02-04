interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  requireInteraction?: boolean;
}

const TAB_FAVICON_TRANSPARENT =
  'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';

class NotificationManager {
  private permission: NotificationPermission = 'default';
  private audioContext: AudioContext | null = null;
  private notificationSound: AudioBuffer | null = null;

  constructor() {
    this.checkPermission();
    this.initializeAudio();
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      return;
    }

    // Check if page is focused
    if (document.hasFocus()) {
      return; // Don't show notification if user is already looking at the page
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/images/notification.jpg',
      tag: options.tag || 'veredicta-chat',
      silent: options.silent || false,
      requireInteraction: options.requireInteraction || false
    });

    // Play sound if not silent
    if (!options.silent) {
      this.playNotificationSound();
    }

    // Auto close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  private async initializeAudio() {
    try {
      // Create a simple notification beep
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create notification sound buffer
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / this.audioContext.sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 3);
      }
      
      this.notificationSound = buffer;
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  private playNotificationSound() {
    if (!this.audioContext || !this.notificationSound) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.notificationSound;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.value = 0.1; // Low volume
      source.start();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  updateFaviconBadge(count: number) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) return;

    if (count === 0) {
      // Volta para o favicon transparente (ícone da aba), sem mexer no HTML base.
      favicon.href = TAB_FAVICON_TRANSPARENT;
      return;
    }

    // Create canvas to draw badge
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 32;
    
    canvas.width = size;
    canvas.height = size;

    if (ctx) {
      // Draw red circle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(size - 8, 8, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw count
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count.toString(), size - 8, 8);

      favicon.href = canvas.toDataURL('image/x-icon');
    }
  }

  clearFaviconBadge() {
    this.updateFaviconBadge(0);
  }
}

export const notificationManager = new NotificationManager();