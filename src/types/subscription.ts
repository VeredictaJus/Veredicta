export type SubscriptionStatus = 'registered' | 'payment_pending' | 'active' | 'suspended' | 'cancelled';

export type PlanType = 'starter' | 'professional' | 'premium';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: string[];
  petitionsIncluded: number;
  additionalCreditPrice: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  amount: number;
  paymentMethod: 'pix' | 'credit_card';
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'pix' | 'credit_card';
  paymentDate: Date;
  dueDate: Date;
}

export interface BillingInfo {
  subscription: Subscription | null;
  paymentHistory: PaymentHistory[];
  currentPlan: Plan | null;
  daysUntilExpiry: number;
  isActive: boolean;
}