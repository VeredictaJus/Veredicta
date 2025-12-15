interface ModerationResult {
  isViolation: boolean;
  violationType: 'offensive' | 'adult_content' | 'inappropriate_image' | 'spam' | 'none';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  blockedWords?: string[];
  reportedToAdmin: boolean;
  reason?: string;
}

interface ViolationReport {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  violationType: string;
  severity: string;
  content: string;
  timestamp: Date;
  reviewed: boolean;
}

class ContentModerator {
  private offensiveWords = [
    // Portuguese offensive words
    'merda', 'porra', 'caralho', 'puta', 'cu', 'buceta', 'piroca', 'cacete',
    'desgraça', 'fdp', 'filho da puta', 'vai se foder', 'vai tomar no cu',
    'pqp', 'vsf', 'vtmnc', 'krl', 'filha da puta', 'babaca', 'otário',
    'imbecil', 'idiota', 'burro', 'estúpido', 'retardado', 'viado',
    // English offensive words
    'fuck', 'shit', 'bitch', 'asshole', 'damn', 'crap', 'bastard',
    'slut', 'whore', 'dickhead', 'moron', 'stupid', 'idiot'
  ];

  private adultContentKeywords = [
    'sexo', 'nude', 'nua', 'pelada', 'gostosa', 'tesão', 'foder', 'transar',
    'buceta', 'pênis', 'vagina', 'masturbação', 'pornô', 'xxx', 'sex',
    'pussy', 'dick', 'cock', 'tits', 'boobs', 'ass', 'porn', 'naked',
    'horny', 'sexy', 'hot', 'fuck me', 'suck', 'blow job', 'orgasm'
  ];

  private suspiciousUrls = [
    'pornhub', 'xvideos', 'redtube', 'xhamster', 'youporn', 'tube8',
    'onlyfans', 'chaturbate', 'livejasmin', 'cam4', 'bongacams',
    'bit.ly', 'tinyurl', 'short.link', 't.co'
  ];

  private spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /[A-Z]{10,}/, // Too many caps
    /🎉{3,}|💰{3,}|🔥{3,}/, // Excessive emojis
    /(compre|buy|venda|sale).*(agora|now|urgente|urgent)/i,
    /(ganhe|earn|lucro|profit).*(dinheiro|money|cash)/i
  ];

  async moderateMessage(content: string, userId: string, conversationId: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      isViolation: false,
      violationType: 'none',
      severity: 'low',
      confidence: 0,
      reportedToAdmin: false
    };

    // Check offensive language
    const offensiveCheck = this.checkOffensiveLanguage(content);
    if (offensiveCheck.isViolation) {
      return this.handleViolation({
        ...offensiveCheck,
        userId,
        conversationId,
        content
      });
    }

    // Check adult content
    const adultCheck = this.checkAdultContent(content);
    if (adultCheck.isViolation) {
      return this.handleViolation({
        ...adultCheck,
        userId,
        conversationId,
        content
      });
    }

    // Check for suspicious URLs
    const urlCheck = this.checkSuspiciousUrls(content);
    if (urlCheck.isViolation) {
      return this.handleViolation({
        ...urlCheck,
        userId,
        conversationId,
        content
      });
    }

    // Check for spam
    const spamCheck = this.checkSpam(content);
    if (spamCheck.isViolation) {
      return this.handleViolation({
        ...spamCheck,
        userId,
        conversationId,
        content
      });
    }

    return result;
  }

  async moderateImage(file: File, userId: string, conversationId: string): Promise<ModerationResult> {
    const result: ModerationResult = {
      isViolation: false,
      violationType: 'none',
      severity: 'low',
      confidence: 0,
      reportedToAdmin: false
    };

    // Basic image validation
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return {
        ...result,
        isViolation: true,
        violationType: 'spam',
        severity: 'medium',
        confidence: 1.0,
        reason: 'Arquivo muito grande'
      };
    }

    // Check file name for inappropriate content
    const nameCheck = await this.moderateMessage(file.name, userId, conversationId);
    if (nameCheck.isViolation) {
      return {
        ...nameCheck,
        violationType: 'inappropriate_image',
        reason: 'Nome do arquivo inapropriado'
      };
    }

    // In a real implementation, you would use an AI service like:
    // - Google Cloud Vision API Safe Search
    // - AWS Rekognition Content Moderation
    // - Microsoft Azure Content Moderator
    // For now, we'll do basic checks

    return result;
  }

  private checkOffensiveLanguage(content: string): Partial<ModerationResult> {
    const lowerContent = content.toLowerCase();
    const foundWords: string[] = [];

    for (const word of this.offensiveWords) {
      if (lowerContent.includes(word)) {
        foundWords.push(word);
      }
    }

    if (foundWords.length > 0) {
      const severity = foundWords.length >= 3 ? 'high' : 
                     foundWords.length >= 2 ? 'medium' : 'low';
      
      return {
        isViolation: true,
        violationType: 'offensive',
        severity: severity as 'low' | 'medium' | 'high',
        confidence: Math.min(foundWords.length * 0.3, 1.0),
        blockedWords: foundWords,
        reason: `Linguagem ofensiva detectada: ${foundWords.join(', ')}`
      };
    }

    return { isViolation: false };
  }

  private checkAdultContent(content: string): Partial<ModerationResult> {
    const lowerContent = content.toLowerCase();
    const foundKeywords: string[] = [];

    for (const keyword of this.adultContentKeywords) {
      if (lowerContent.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    if (foundKeywords.length > 0) {
      return {
        isViolation: true,
        violationType: 'adult_content',
        severity: 'high',
        confidence: Math.min(foundKeywords.length * 0.4, 1.0),
        blockedWords: foundKeywords,
        reason: `Conteúdo adulto detectado: ${foundKeywords.join(', ')}`
      };
    }

    return { isViolation: false };
  }

  private checkSuspiciousUrls(content: string): Partial<ModerationResult> {
    const foundUrls: string[] = [];

    for (const domain of this.suspiciousUrls) {
      if (content.toLowerCase().includes(domain)) {
        foundUrls.push(domain);
      }
    }

    if (foundUrls.length > 0) {
      return {
        isViolation: true,
        violationType: 'adult_content',
        severity: 'critical',
        confidence: 1.0,
        reason: `URL suspeita detectada: ${foundUrls.join(', ')}`
      };
    }

    return { isViolation: false };
  }

  private checkSpam(content: string): Partial<ModerationResult> {
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        return {
          isViolation: true,
          violationType: 'spam',
          severity: 'medium',
          confidence: 0.8,
          reason: 'Padrão de spam detectado'
        };
      }
    }

    return { isViolation: false };
  }

  private async handleViolation(violation: {
    isViolation: boolean;
    violationType: string;
    severity: string;
    confidence: number;
    userId: string;
    conversationId: string;
    content: string;
    blockedWords?: string[];
    reason?: string;
  }): Promise<ModerationResult> {
    // Create violation report
    const report: ViolationReport = {
      id: `violation-${Date.now()}`,
      userId: violation.userId,
      conversationId: violation.conversationId,
      messageId: `msg-${Date.now()}`,
      violationType: violation.violationType,
      severity: violation.severity,
      content: violation.content,
      timestamp: new Date(),
      reviewed: false
    };

    // Store violation report
    this.saveViolationReport(report);

    // Auto-report to admin for high severity violations
    const shouldReport = violation.severity === 'high' || violation.severity === 'critical';
    if (shouldReport) {
      await this.reportToAdmin(report);
    }

    return {
      isViolation: violation.isViolation,
      violationType: violation.violationType as any,
      severity: violation.severity as any,
      confidence: violation.confidence,
      blockedWords: violation.blockedWords,
      reportedToAdmin: shouldReport,
      reason: violation.reason
    };
  }

  private saveViolationReport(report: ViolationReport) {
    // Save to localStorage for now, in production this would go to a database
    const existingReports = JSON.parse(localStorage.getItem('violation-reports') || '[]');
    existingReports.push(report);
    localStorage.setItem('violation-reports', JSON.stringify(existingReports));
  }

  private async reportToAdmin(report: ViolationReport) {
    // In production, this would send to admin dashboard/notification system
    console.warn('🚨 VIOLATION REPORTED TO ADMIN:', report);
    
    // Simulate admin notification
    const adminNotification = {
      id: `admin-notif-${Date.now()}`,
      type: 'violation_report',
      title: '🚨 Violação de Conteúdo Detectada',
      message: `Usuário ${report.userId} violou política de conteúdo`,
      severity: report.severity,
      timestamp: new Date(),
      data: report
    };

    // Store admin notification
    const adminNotifications = JSON.parse(localStorage.getItem('admin-notifications') || '[]');
    adminNotifications.push(adminNotification);
    localStorage.setItem('admin-notifications', JSON.stringify(adminNotifications));
  }

  getViolationReports(): ViolationReport[] {
    return JSON.parse(localStorage.getItem('violation-reports') || '[]');
  }

  getAdminNotifications(): any[] {
    return JSON.parse(localStorage.getItem('admin-notifications') || '[]');
  }
}

export const contentModerator = new ContentModerator();
export type { ModerationResult, ViolationReport };