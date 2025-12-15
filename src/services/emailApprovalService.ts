import emailjs from '@emailjs/browser';

export interface ApprovalEmailData {
  redactorId: string;
  redactorName: string;
  redactorEmail: string;
  petitionFiles: string[]; // base64 files
}

export class EmailApprovalService {
  private static readonly SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID'; // Configure in production
  private static readonly TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID'; // Configure in production
  private static readonly PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Configure in production

  // Send approval request email to admin
  static async sendApprovalRequest(data: ApprovalEmailData): Promise<boolean> {
    try {
      console.log('Sending approval request email to contato@veredictajus.com');
      
      const templateParams = {
        to_email: 'contato@veredictajus.com',
        from_name: 'Sistema Veredicta Jus',
        subject: `Nova Solicitação de Cadastro - Redator: ${data.redactorName}`,
        message: this.generateApprovalRequestMessage(data),
        redactor_name: data.redactorName,
        redactor_email: data.redactorEmail,
        redactor_id: data.redactorId,
        // Include approval/rejection links
        approve_link: `${window.location.origin}/api/approve-redactor/${data.redactorId}`,
        reject_link: `${window.location.origin}/api/reject-redactor/${data.redactorId}`,
        // Attach petition files (base64)
        petition_1: data.petitionFiles[0] || '',
        petition_2: data.petitionFiles[1] || '',
        petition_3: data.petitionFiles[2] || '',
      };

      // For development, log the email data
      console.log('Email template params:', templateParams);
      
      // In production, uncomment this:
      // await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams, this.PUBLIC_KEY);
      
      return true;
    } catch (error) {
      console.error('Error sending approval request email:', error);
      return false;
    }
  }

  // Generate approval request message
  private static generateApprovalRequestMessage(data: ApprovalEmailData): string {
    return `
Nova solicitação de cadastro como redator:

DADOS DO REDATOR:
Nome: ${data.redactorName}
Email: ${data.redactorEmail}
ID: ${data.redactorId}

PETIÇÕES ANEXADAS: 3 arquivos PDF

AÇÕES DISPONÍVEIS:

Para APROVAR este redator:
- Responda este email com "APROVADO: ${data.redactorId}" no assunto
- Ou clique no link: ${window.location.origin}/api/approve-redactor/${data.redactorId}

Para REJEITAR este redator:
- Responda este email com "REJEITADO: ${data.redactorId} - [MOTIVO]" no assunto
- Ou clique no link: ${window.location.origin}/api/reject-redactor/${data.redactorId}

IMPORTANTE: O redator não poderá fazer login até que seja aprovado.

Sistema Veredicta Jus
`;
  }

  // Send approval confirmation to redactor
  static async sendApprovalConfirmation(redactorEmail: string, redactorName: string): Promise<boolean> {
    try {
      console.log(`Sending approval confirmation to ${redactorEmail}`);
      
      const templateParams = {
        to_email: redactorEmail,
        to_name: redactorName,
        from_name: 'Equipe Veredicta Jus',
        subject: 'Cadastro Aprovado - Bem-vindo ao Veredicta Jus!',
        message: this.generateApprovalConfirmationMessage(redactorName),
        login_link: `${window.location.origin}/login`,
      };

      console.log('Approval confirmation email params:', templateParams);
      
      // In production, uncomment this:
      // await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams, this.PUBLIC_KEY);
      
      return true;
    } catch (error) {
      console.error('Error sending approval confirmation email:', error);
      return false;
    }
  }

  // Generate approval confirmation message
  private static generateApprovalConfirmationMessage(redactorName: string): string {
    return `
Olá ${redactorName},

🎉 PARABÉNS! Seu cadastro como redator foi APROVADO!

Suas petições autorais foram analisadas e aprovadas por nossa equipe.
Agora você pode fazer login na plataforma e começar a trabalhar conosco.

PRÓXIMOS PASSOS:
1. Acesse: ${window.location.origin}/login
2. Faça login com seu email e senha
3. Complete seu perfil na plataforma
4. Comece a criar conteúdo jurídico de qualidade

Bem-vindo ao time Veredicta Jus! 🚀

Atenciosamente,
Equipe Veredicta Jus

---
Se você tiver dúvidas, responda este email ou entre em contato:
contato@veredictajus.com
`;
  }

  // Send rejection notification to redactor
  static async sendRejectionNotification(redactorEmail: string, redactorName: string, reason: string): Promise<boolean> {
    try {
      console.log(`Sending rejection notification to ${redactorEmail}`);
      
      const templateParams = {
        to_email: redactorEmail,
        to_name: redactorName,
        from_name: 'Equipe Veredicta Jus',
        subject: 'Atualização sobre seu Cadastro - Veredicta Jus',
        message: this.generateRejectionMessage(redactorName, reason),
        register_link: `${window.location.origin}/auth/redactor-register`,
      };

      console.log('Rejection notification email params:', templateParams);
      
      // In production, uncomment this:
      // await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams, this.PUBLIC_KEY);
      
      return true;
    } catch (error) {
      console.error('Error sending rejection notification email:', error);
      return false;
    }
  }

  // Generate rejection message
  private static generateRejectionMessage(redactorName: string, reason: string): string {
    return `
Olá ${redactorName},

Obrigado por seu interesse em se juntar ao time Veredicta Jus.

Após análise de sua solicitação de cadastro, informamos que não foi possível aprovà-la neste momento.

MOTIVO: ${reason}

NOVA TENTATIVA:
Você pode enviar uma nova solicitação com petições autorais que atendam aos nossos critérios de qualidade e originalidade.

Link para novo cadastro: ${window.location.origin}/auth/redactor-register

CRITÉRIOS PARA APROVAÇÃO:
- Petições autorais originais
- Qualidade técnica jurídica
- Conformidade com padrões da plataforma
- Experiência demonstrada na área

Para dúvidas sobre os critérios, entre em contato:
contato@veredictajus.com

Atenciosamente,
Equipe Veredicta Jus
`;
  }
}