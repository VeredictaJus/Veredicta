import { useState } from 'react';
import SubscriptionManager from '@/components/Payment/SubscriptionManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, TrendingUp } from 'lucide-react';
import StripeCheckout from '@/components/Payment/StripeCheckout';

interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  amount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function Subscription() {
  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_123456789',
    planName: 'Profissional',
    status: 'active',
    amount: 5000,
    currentPeriodStart: '2024-07-01T00:00:00Z',
    currentPeriodEnd: '2024-08-01T00:00:00Z',
    cancelAtPeriodEnd: false
  });

  const creditPrices = {
    starter: 220,
    professional: 210,
    premium: 200
  };

  const getCurrentPlanId = () => {
    switch (subscription.planName.toLowerCase()) {
      case 'starter': return 'starter';
      case 'premium': return 'premium';
      default: return 'professional';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
          <p className="text-gray-600">
            Gerencie sua assinatura e créditos adicionais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Management */}
        <div className="lg:col-span-2">
          <SubscriptionManager
            subscription={subscription}
            onSubscriptionUpdate={setSubscription}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Buy Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Comprar Créditos</span>
              </CardTitle>
              <CardDescription>
                Adicione créditos extras à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  Preço por crédito: R$ {creditPrices[getCurrentPlanId() as keyof typeof creditPrices]}
                </p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Comprar Créditos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Comprar Créditos Adicionais</DialogTitle>
                    <DialogDescription>
                      Adicione créditos extras à sua conta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <StripeCheckout
                      planId={getCurrentPlanId() as 'starter' | 'professional' | 'premium'}
                      planName={subscription.planName}
                      price={creditPrices[getCurrentPlanId() as keyof typeof creditPrices]}
                      type="credits"
                      quantity={5}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Upgrade Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Upgrade de Plano</span>
              </CardTitle>
              <CardDescription>
                Melhore seu plano atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Ver Planos Disponíveis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upgrade para Premium</DialogTitle>
                    <DialogDescription>
                      Aproveite todos os recursos premium
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <StripeCheckout
                      planId="premium"
                      planName="Premium"
                      price={10000}
                      type="plan"
                      features={[
                        '50 petições por mês',
                        'Revisão pelo corretor antes do envio',
                        'Gestor de conta dedicado',
                        'Prazo express (1-2 dias)',
                        'Upload ilimitado'
                      ]}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-gray-600">
              <p>• Pagamentos processados com segurança pelo Stripe</p>
              <p>• Cobrança automática no cartão cadastrado</p>
              <p>• Cancele a qualquer momento</p>
              <p>• Suporte disponível 24/7</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}