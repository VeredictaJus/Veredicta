// Plan types and pricing constants
export const PLAN_TYPES = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL', 
  PREMIUM: 'PREMIUM'
} as const;

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];

// Credit pricing by plan
export const CREDIT_PRICES: Record<PlanType, number> = {
  [PLAN_TYPES.STARTER]: 220.00,
  [PLAN_TYPES.PROFESSIONAL]: 210.00,
  [PLAN_TYPES.PREMIUM]: 200.00
};

// Plan monthly costs
export const PLAN_MONTHLY_COSTS = {
  [PLAN_TYPES.STARTER]: 2000.00,
  [PLAN_TYPES.PROFESSIONAL]: 5000.00,
  [PLAN_TYPES.PREMIUM]: 8000.00
};

// Plan included credits
export const PLAN_INCLUDED_CREDITS = {
  [PLAN_TYPES.STARTER]: 50,
  [PLAN_TYPES.PROFESSIONAL]: 150,
  [PLAN_TYPES.PREMIUM]: 300
};

// Credit purchase quantities
export const CREDIT_QUANTITIES = [1, 5, 10, 20, 50];

// Utility function to get credit price by plan
export const getCreditPrice = (planType: PlanType): number => {
  return CREDIT_PRICES[planType] || CREDIT_PRICES.STARTER;
};

// Calculate savings compared to Starter plan
export const getCreditSavings = (planType: PlanType): number => {
  return CREDIT_PRICES.STARTER - CREDIT_PRICES[planType];
};

// Format currency in Brazilian Real
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};