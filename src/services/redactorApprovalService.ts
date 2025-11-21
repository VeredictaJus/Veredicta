export interface RedactorData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  oab: string;
  specialty: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  petitions: string[]; // File names
}

export class RedactorApprovalService {
  private static readonly STORAGE_KEY = 'pendingRedactors';
  private static readonly APPROVED_KEY = 'approvedRedactors';
  private static readonly REJECTED_KEY = 'rejectedRedactors';

  static savePendingRedactor(redactor: RedactorData): void {
    const pending = this.getPendingRedactors();
    const newRedactor = {
      ...redactor,
      id: this.generateId(),
      status: 'pending_approval' as const,
      createdAt: new Date().toISOString()
    };
    pending.push(newRedactor);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));
  }

  static getPendingRedactors(): RedactorData[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getApprovedRedactors(): RedactorData[] {
    const stored = localStorage.getItem(this.APPROVED_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getRejectedRedactors(): RedactorData[] {
    const stored = localStorage.getItem(this.REJECTED_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static approveRedactor(redactorId: string): boolean {
    const pending = this.getPendingRedactors();
    const redactorIndex = pending.findIndex(r => r.id === redactorId);
    
    if (redactorIndex === -1) return false;

    const redactor = pending[redactorIndex];
    redactor.status = 'approved';
    redactor.approvedAt = new Date().toISOString();

    // Move to approved list
    const approved = this.getApprovedRedactors();
    approved.push(redactor);
    localStorage.setItem(this.APPROVED_KEY, JSON.stringify(approved));

    // Remove from pending
    pending.splice(redactorIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));

    // Send approval email to redactor
    this.sendApprovalNotification(redactor);

    return true;
  }

  static rejectRedactor(redactorId: string, reason: string): boolean {
    const pending = this.getPendingRedactors();
    const redactorIndex = pending.findIndex(r => r.id === redactorId);
    
    if (redactorIndex === -1) return false;

    const redactor = pending[redactorIndex];
    redactor.status = 'rejected';
    redactor.rejectedAt = new Date().toISOString();
    redactor.rejectionReason = reason;

    // Move to rejected list
    const rejected = this.getRejectedRedactors();
    rejected.push(redactor);
    localStorage.setItem(this.REJECTED_KEY, JSON.stringify(rejected));

    // Remove from pending
    pending.splice(redactorIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));

    // Send rejection email to redactor
    this.sendRejectionNotification(redactor);

    return true;
  }

  static isRedactorApproved(email: string): boolean {
    const approved = this.getApprovedRedactors();
    return approved.some(r => r.email === email);
  }

  static getRedactorByEmail(email: string): RedactorData | null {
    // Check approved first
    const approved = this.getApprovedRedactors();
    let redactor = approved.find(r => r.email === email);
    if (redactor) return redactor;

    // Check pending
    const pending = this.getPendingRedactors();
    redactor = pending.find(r => r.email === email);
    if (redactor) return redactor;

    // Check rejected
    const rejected = this.getRejectedRedactors();
    redactor = rejected.find(r => r.email === email);
    if (redactor) return redactor;

    return null;
  }

  static getRedactorById(id: string): RedactorData | null {
    // Check all lists for the redactor by ID
    const all = [
      ...this.getApprovedRedactors(),
      ...this.getPendingRedactors(),
      ...this.getRejectedRedactors()
    ];
    
    return all.find(r => r.id === id) || null;
  }

  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private static async sendApprovalNotification(redactor: RedactorData): Promise<void> {
    try {
      console.log(`Sending approval email to ${redactor.email}`);
      
      const emailParams = {
        to_email: redactor.email,
        to_name: redactor.name,
        subject: 'Cadastro Aprovado - Veredicta Jus',
        message: `
          Olá ${redactor.name},

          Parabéns! Seu cadastro como redator foi aprovado.
          
          Suas petições autorais foram analisadas e aprovadas por nossa equipe.
          Agora você pode fazer login na plataforma e começar a trabalhar conosco.
          
          Dados do seu cadastro:
          - Email: ${redactor.email}
          - OAB: ${redactor.oab}
          - Especialidade: ${redactor.specialty}
          
          Bem-vindo ao time Veredicta Jus!
          
          Atenciosamente,
          Equipe Veredicta Jus
        `
      };

      // In a real app, implement actual email sending here
      console.log('Approval notification sent to:', redactor.email);
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }

  private static async sendRejectionNotification(redactor: RedactorData): Promise<void> {
    try {
      console.log(`Sending rejection email to ${redactor.email}`);
      
      const emailParams = {
        to_email: redactor.email,
        to_name: redactor.name,
        subject: 'Cadastro não aprovado - Veredicta Jus',
        message: `
          Olá ${redactor.name},

          Infelizmente, seu cadastro como redator não foi aprovado.
          
          Motivo: ${redactor.rejectionReason}
          
          Você pode tentar novamente enviando novas petições autorais que atendam aos nossos critérios.
          
          Para mais informações, entre em contato conosco através do email contato@veredictajus.com
          
          Atenciosamente,
          Equipe Veredicta Jus
        `
      };

      // In a real app, implement actual email sending here
      console.log('Rejection notification sent to:', redactor.email);
    } catch (error) {
      console.error('Error sending rejection email:', error);
    }
  }
}