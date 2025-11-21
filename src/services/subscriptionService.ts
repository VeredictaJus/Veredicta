import { Plan, PlanType, Subscription, SubscriptionStatus, PaymentHistory, BillingInfo } from '@/types/subscription';

// Available plans
export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Plano Starter',
    price: 2000,
    petitionsIncluded: 10,
    additionalCreditPrice: 220,
    features: [
      '10 petições incluídas por mês',
      'Créditos adicionais: R$ 220,00',
      'Suporte por email',
      'Acesso a biblioteca de modelos',
      'Chat com redatores'
    ]
  },
  {
    id: 'professional',
    name: 'Plano Profissional',
    price: 5000,
    petitionsIncluded: 25,
    additionalCreditPrice: 210,
    features: [
      '25 petições incluídas por mês',
      'Créditos adicionais: R$ 210,00',
      'Suporte prioritário',
      'Acesso a biblioteca premium',
      'Chat com redatores especialistas',
      'Revisões ilimitadas'
    ]
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 10000,
    petitionsIncluded: 50,
    additionalCreditPrice: 200,
    features: [
      '50 petições incluídas por mês',
      'Créditos adicionais: R$ 200,00',
      'Suporte VIP 24/7',
      'Acesso completo à biblioteca',
      'Redatores dedicados',
      'Revisões ilimitadas',
      'Consultoria jurídica inclusa',
      'API para integração'
    ]
  }
];

class SubscriptionService {
  private readonly STORAGE_KEY = 'veredicta_subscription';
  private readonly PAYMENT_HISTORY_KEY = 'veredicta_payment_history';

  // Get user's subscription status
  getUserSubscriptionStatus(userId: string): SubscriptionStatus {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return 'registered';
    
    // Check if subscription is expired
    if (new Date() > subscription.endDate) {
      return 'suspended';
    }
    
    return subscription.status;
  }

  // Get user's active subscription
  getUserSubscription(userId: string): Subscription | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const subscriptions: Subscription[] = JSON.parse(stored);
      return subscriptions.find(sub => sub.userId === userId) || null;
    } catch {
      return null;
    }
  }

  // Create new subscription
  createSubscription(userId: string, planId: PlanType, paymentMethod: 'pix' | 'credit_card'): Subscription {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Invalid plan');

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: 'payment_pending',
      startDate: now,
      endDate: nextMonth,
      nextBillingDate: nextMonth,
      amount: plan.price,
      paymentMethod
    };

    this.saveSubscription(subscription);
    return subscription;
  }

  // Update subscription status
  updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const subscriptions: Subscription[] = stored ? JSON.parse(stored) : [];
    
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      subscriptions[index].status = status;
      if (status === 'active') {
        // Extend end date when activated
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        subscriptions[index].endDate = nextMonth;
        subscriptions[index].nextBillingDate = nextMonth;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }

  // Save subscription
  private saveSubscription(subscription: Subscription): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const subscriptions: Subscription[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = subscriptions.findIndex(sub => sub.userId === subscription.userId);
    if (existingIndex !== -1) {
      subscriptions[existingIndex] = subscription;
    } else {
      subscriptions.push(subscription);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subscriptions));
  }

  // Simulate payment processing
  async processPayment(subscriptionId: string, paymentMethod: 'pix' | 'credit_card'): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      this.updateSubscriptionStatus(subscriptionId, 'active');
      this.addPaymentHistory(subscriptionId, 'completed', paymentMethod);
    } else {
      this.addPaymentHistory(subscriptionId, 'failed', paymentMethod);
    }
    
    return success;
  }

  // Add payment to history
  private addPaymentHistory(subscriptionId: string, status: 'pending' | 'completed' | 'failed' | 'cancelled', paymentMethod: 'pix' | 'credit_card'): void {
    const subscription = this.getSubscriptionById(subscriptionId);
    if (!subscription) return;

    const payment: PaymentHistory = {
      id: `pay_${Date.now()}`,
      subscriptionId,
      amount: subscription.amount,
      status,
      paymentMethod,
      paymentDate: new Date(),
      dueDate: subscription.nextBillingDate
    };

    const stored = localStorage.getItem(this.PAYMENT_HISTORY_KEY);
    const history: PaymentHistory[] = stored ? JSON.parse(stored) : [];
    history.push(payment);
    localStorage.setItem(this.PAYMENT_HISTORY_KEY, JSON.stringify(history));
  }

  // Get subscription by ID
  private getSubscriptionById(subscriptionId: string): Subscription | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const subscriptions: Subscription[] = JSON.parse(stored);
      return subscriptions.find(sub => sub.id === subscriptionId) || null;
    } catch {
      return null;
    }
  }

  // Get payment history for user
  getPaymentHistory(userId: string): PaymentHistory[] {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return [];

    const stored = localStorage.getItem(this.PAYMENT_HISTORY_KEY);
    if (!stored) return [];

    try {
      const history: PaymentHistory[] = JSON.parse(stored);
      return history.filter(payment => payment.subscriptionId === subscription.id);
    } catch {
      return [];
    }
  }

  // Get billing info for user
  getBillingInfo(userId: string): BillingInfo {
    const subscription = this.getUserSubscription(userId);
    const paymentHistory = this.getPaymentHistory(userId);
    const currentPlan = subscription ? PLANS.find(p => p.id === subscription.planId) || null : null;
    
    let daysUntilExpiry = 0;
    let isActive = false;

    if (subscription) {
      const now = new Date();
      const expiry = new Date(subscription.endDate);
      daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isActive = subscription.status === 'active' && daysUntilExpiry > 0;
    }

    return {
      subscription,
      paymentHistory,
      currentPlan,
      daysUntilExpiry,
      isActive
    };
  }

  // Check if user has access to services
  hasServiceAccess(userId: string): boolean {
    const status = this.getUserSubscriptionStatus(userId);
    return status === 'active';
  }

  // Get plan by ID
  getPlanById(planId: PlanType): Plan | null {
    return PLANS.find(p => p.id === planId) || null;
  }

  // Cancel subscription
  cancelSubscription(userId: string): void {
    const subscription = this.getUserSubscription(userId);
    if (subscription) {
      this.updateSubscriptionStatus(subscription.id, 'cancelled');
    }
  }

  // Renew subscription
  renewSubscription(userId: string): void {
    const subscription = this.getUserSubscription(userId);
    if (subscription) {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      subscription.endDate = nextMonth;
      subscription.nextBillingDate = nextMonth;
      subscription.status = 'active';
      
      this.saveSubscription(subscription);
      this.addPaymentHistory(subscription.id, 'completed', subscription.paymentMethod);
    }
  }
}

export const subscriptionService = new SubscriptionService();