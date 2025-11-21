interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default rate limits
    this.configs.set('message', {
      maxRequests: 30,
      windowMs: 60000, // 1 minute
      blockDurationMs: 300000 // 5 minutes
    });

    this.configs.set('report', {
      maxRequests: 5,
      windowMs: 300000, // 5 minutes
      blockDurationMs: 600000 // 10 minutes
    });

    this.configs.set('file_upload', {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      blockDurationMs: 300000 // 5 minutes
    });

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  checkLimit(userId: string, action: string): { allowed: boolean; retryAfter?: number; reason?: string } {
    const config = this.configs.get(action);
    if (!config) {
      return { allowed: true };
    }

    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    // Check if user is currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
        reason: `Bloqueado temporariamente devido ao excesso de ${action}`
      };
    }

    // Initialize or reset if window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      // Block user temporarily
      entry.blockedUntil = now + config.blockDurationMs;
      this.limits.set(key, entry);

      return {
        allowed: false,
        retryAfter: Math.ceil(config.blockDurationMs / 1000),
        reason: `Limite de ${config.maxRequests} ${action}s por ${Math.ceil(config.windowMs / 60000)} minutos excedido`
      };
    }

    // Increment counter
    entry.count++;
    this.limits.set(key, entry);

    return { allowed: true };
  }

  getRemainingRequests(userId: string, action: string): number {
    const config = this.configs.get(action);
    if (!config) return Infinity;

    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  getResetTime(userId: string, action: string): number {
    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);
    return entry?.resetTime || Date.now();
  }

  isBlocked(userId: string, action: string): boolean {
    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);
    return entry?.blockedUntil ? Date.now() < entry.blockedUntil : false;
  }

  setCustomLimit(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  clearUserLimits(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.limits.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.limits.delete(key));
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      // Remove expired entries that are not blocked
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));
    console.log(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
  }

  getStats(): { totalEntries: number; blockedUsers: number; activeWindows: number } {
    const now = Date.now();
    let blockedUsers = 0;
    let activeWindows = 0;

    for (const entry of this.limits.values()) {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedUsers++;
      }
      if (now < entry.resetTime) {
        activeWindows++;
      }
    }

    return {
      totalEntries: this.limits.size,
      blockedUsers,
      activeWindows
    };
  }
}

export const rateLimiter = new RateLimiter();
export type { RateLimitConfig };