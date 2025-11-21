import { supabase } from '@/lib/supabase';

export interface StripePixData {
  paymentIntentId: string;
  clientSecret: string;
  pixCode?: string;
  qrCodeImage?: string;
  amount: number;
  expiresAt: number;
}

export class StripePixService {
  /**
   * Cria um pagamento PIX via Stripe
   */
  static async createPixPayment(
    planId: string,
    planName: string,
    amount: number,
    userId: string,
    userEmail?: string
  ): Promise<StripePixData> {
    try {
      // Chamar API para criar Payment Intent
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName,
          price: amount,
          userId,
          userEmail,
          paymentMethod: 'pix'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento PIX');
      }

      const data = await response.json();

      if (data.type !== 'pix') {
        throw new Error('Resposta inválida do servidor');
      }

      // Salvar no banco de dados
      const { data: payment, error } = await supabase
        .from('stripe_payments')
        .insert({
          user_id: userId,
          plan_code: planId,
          amount: Math.round(amount * 100), // Converter para centavos
          currency: 'brl',
          status: 'pending',
          payment_method: 'pix',
          stripe_payment_intent_id: data.paymentIntentId,
          metadata: {
            plan_name: planName,
            user_email: userEmail || '',
            expires_at: Date.now() + (15 * 60 * 1000), // 15 minutos
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao salvar pagamento: ${error.message}`);
      }

      // Gerar QR Code simulado (em produção, usar dados reais do Stripe)
      const pixCode = this.generatePixCode(amount, planId);
      const qrCodeImage = this.generateQrCodeImage(pixCode);
      const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutos

      return {
        paymentIntentId: data.paymentIntentId,
        clientSecret: data.clientSecret,
        pixCode,
        qrCodeImage,
        amount,
        expiresAt
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  /**
   * Verifica status do pagamento PIX
   */
  static async checkPixPaymentStatus(paymentIntentId: string): Promise<{
    status: 'pending' | 'completed' | 'expired' | 'failed';
    payment?: any;
  }> {
    try {
      const { data: payment, error } = await supabase
        .from('stripe_payments')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (error) {
        throw new Error(`Erro ao verificar pagamento: ${error.message}`);
      }

      // Verificar se expirou
      const now = Date.now();
      const expiresAt = payment.metadata?.expires_at || 0;
      
      if (now > expiresAt && payment.status === 'pending') {
        // Marcar como expirado
        await supabase
          .from('stripe_payments')
          .update({ status: 'expired' })
          .eq('stripe_payment_intent_id', paymentIntentId);
        
        return { status: 'expired', payment };
      }

      return { status: payment.status, payment };
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error);
      throw error;
    }
  }

  /**
   * Confirma pagamento PIX (chamado pelo webhook)
   */
  static async confirmPixPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stripe_payments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) {
        throw new Error(`Erro ao confirmar pagamento: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao confirmar pagamento PIX:', error);
      return false;
    }
  }

  /**
   * Gera código PIX simulado (em produção, usar dados reais do Stripe)
   */
  private static generatePixCode(amount: number, planId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `PIX-${timestamp}-${random}`;
  }

  /**
   * Gera QR Code simulado (em produção, usar dados reais do Stripe)
   */
  private static generateQrCodeImage(pixCode: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixCode)}`;
  }
}




















