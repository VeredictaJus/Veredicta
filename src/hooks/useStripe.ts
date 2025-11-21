import { useState } from 'react';
import { redirectToCheckout, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useNewAuth();

  const purchasePlan = async (planId: 'start' | 'pro' | 'elite') => {
    setLoading(true);
    try {
      const priceId = STRIPE_PRICE_IDS[planId];
      await redirectToCheckout(priceId, 1, 'subscription', user?.uid, planId);
      toast.success('Redirecionando para pagamento...');
    } catch (error) {
      toast.error('Erro ao processar pagamento. Tente novamente.');
      console.error('Purchase plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWriterPayment = async (petitionType: string, amount: number) => {
    setLoading(true);
    try {
      // Simulate writer payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Pagamento de R$ ${amount} processado com sucesso!`);
      return true;
    } catch (error) {
      toast.error('Erro ao processar pagamento do redator.');
      console.error('Writer payment error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    purchasePlan,
    processWriterPayment,
  };
};