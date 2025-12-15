import DOMPurify from 'isomorphic-dompurify';

// Content moderation
const BANNED_WORDS = [
  // Offensive language
  'merda', 'porra', 'caralho', 'puta', 'vagabundo', 'filho da puta',
  'fdp', 'desgraça', 'idiota', 'imbecil', 'burro', 'estúpido',
  
  // Discriminatory language
  'corno', 'viado', 'gay', 'bicha', 'sapata', 'traveco',
  'negro', 'preto', 'macaco', 'favelado', 'pobre', 'mendigo',
  
  // Spam/Scam indicators
  'spam', 'scam', 'fraude', 'golpe', 'phishing',
  'clique aqui', 'ganhe dinheiro', 'oportunidade única',
  
  // Legal risks
  'suborno', 'propina', 'corrupção', 'documento falso',
  'falsificação', 'lavagem de dinheiro'
];

const SUSPICIOUS_PATTERNS = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF pattern
  /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ pattern
  /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/g, // URLs
];

export interface ModerationResult {
  isAllowed: boolean;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sanitizedContent: string;
}

export const moderateContent = (content: string): ModerationResult => {
  const violations: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  const lowerContent = content.toLowerCase();
  
  // Check for banned words
  const foundBannedWords = BANNED_WORDS.filter(word => 
    lowerContent.includes(word.toLowerCase())
  );
  
  if (foundBannedWords.length > 0) {
    violations.push('Linguagem inadequada detectada');
    riskLevel = foundBannedWords.length > 2 ? 'high' : 'medium';
  }
  
  // Check for suspicious patterns
  const suspiciousMatches = SUSPICIOUS_PATTERNS.filter(pattern => 
    pattern.test(content)
  );
  
  if (suspiciousMatches.length > 0) {
    violations.push('Informações sensíveis detectadas');
    riskLevel = 'high';
  }
  
  // Check for excessive caps (shouting)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 10) {
    violations.push('Texto em maiúsculas excessivo');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }
  
  // Check for spam indicators
  const repeatedChar = /(.)\1{4,}/g;
  if (repeatedChar.test(content)) {
    violations.push('Caracteres repetitivos detectados');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }
  
  // Sanitize content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  const isAllowed = violations.length === 0 || riskLevel === 'low';
  
  return {
    isAllowed,
    violations,
    riskLevel,
    sanitizedContent
  };
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove dangerous characters from file names
  // eslint-disable-next-line no-control-regex
  return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

export const validateFileUpload = (file: File, allowedTypes: string[], maxSize: number): {
  isValid: boolean;
  error?: string;
} => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido'
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Arquivo muito grande'
    };
  }
  
  // Check for suspicious file names
  const suspiciousNames = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs'];
  if (suspiciousNames.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não seguro'
    };
  }
  
  return { isValid: true };
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (userId: string, maxRequests: number = 50, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Simple encryption for client-side (not secure for production)
export const encryptMessage = (message: string, key: string): string => {
  if (!key) return message;
  
  let encrypted = '';
  for (let i = 0; i < message.length; i++) {
    const messageChar = message.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(messageChar ^ keyChar);
  }
  
  return btoa(encrypted);
};

export const decryptMessage = (encryptedMessage: string, key: string): string => {
  if (!key) return encryptedMessage;
  
  try {
    const encrypted = atob(encryptedMessage);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const encryptedChar = encrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return decrypted;
  } catch {
    return encryptedMessage;
  }
};

// Audit logging
export interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high';
}

export const logChatActivity = (
  userId: string,
  action: string,
  details: Record<string, unknown>,
  riskLevel: 'low' | 'medium' | 'high' = 'low'
): void => {
  const logEntry: AuditLog = {
    timestamp: new Date(),
    userId,
    action,
    details,
    riskLevel
  };
  
  // In production, send to audit service
  console.log('AUDIT LOG:', logEntry);
  
  // Store high-risk activities locally for immediate action
  if (riskLevel === 'high') {
    const highRiskLogs = JSON.parse(localStorage.getItem('veredicta_high_risk_logs') || '[]');
    highRiskLogs.push(logEntry);
    localStorage.setItem('veredicta_high_risk_logs', JSON.stringify(highRiskLogs.slice(-100))); // Keep last 100
  }
};