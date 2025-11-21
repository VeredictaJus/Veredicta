import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService, PLANS } from '@/services/subscriptionService';
import { PlanType } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle, CreditCard, QrCode, Star, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('professional');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('credit_card');
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const selectedPlanDetails = PLANS.find(p => p.id === selectedPlan)!;

  const handlePlanSelect = (planId: PlanType) => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    if (!user) return;

    // Basic validation
    if (paymentMethod === 'credit_card') {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        toast.error('Por favor, preencha todos os dados do cartão');
        return;
      }
    }

    setProcessing(true);

    try {
      // Create subscription
      const subscription = subscriptionService.createSubscription(
        user.id,
        selectedPlan,
        paymentMethod
      );

      // Process payment
      const success = await subscriptionService.processPayment(subscription.id, paymentMethod);

      if (success) {
        toast.success('Pagamento processado com sucesso!');
        navigate('/client/billing?success=true');
      } else {
        toast.error('Falha no processamento do pagamento. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/client')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Escolha seu Plano</h1>
            <p className="text-muted-foreground">Selecione o plano ideal para suas necessidades</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plans Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecione seu Plano</CardTitle>
                <CardDescription>
                  Todos os planos incluem acesso completo à plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {PLANS.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <RadioGroup
                              value={selectedPlan}
                              onValueChange={(value) => handlePlanSelect(value as PlanType)}
                            >
                              <RadioGroupItem value={plan.id} id={plan.id} />
                            </RadioGroup>
                            <div>
                              <h3 className="font-semibold text-lg">{plan.name}</h3>
                              <p className="text-2xl font-bold text-primary">
                                {formatPrice(plan.price)}
                                <span className="text-sm font-normal text-muted-foreground">/mês</span>
                              </p>
                            </div>
                          </div>
                          {plan.id === 'professional' && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              Mais Popular
                            </Badge>
                          )}
                        </div>
                        <div className="mt-4 pl-7">
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>
                  Escolha como deseja pagar sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'pix' | 'credit_card')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credit_card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cartão de Crédito
                    </TabsTrigger>
                    <TabsTrigger value="pix" className="flex items-center">
                      <QrCode className="h-4 w-4 mr-2" />
                      PIX
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit_card" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="card-number">Número do Cartão</Label>
                        <Input
                          id="card-number"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-name">Nome no Cartão</Label>
                        <Input
                          id="card-name"
                          placeholder="Nome como impresso no cartão"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Validade</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input
                            id="card-cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pix" className="mt-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <QrCode className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <h4 className="font-semibold text-blue-900">Pagamento via PIX</h4>
                            <p className="text-sm text-blue-700">
                              Após confirmar, você receberá o código PIX para pagamento
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{selectedPlanDetails.name}</span>
                    <span>{formatPrice(selectedPlanDetails.price)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPlanDetails.petitionsIncluded} petições incluídas
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(selectedPlanDetails.price)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cobrança mensal • Cancele a qualquer momento
                  </div>
                </div>

                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="/legal/terms" className="text-primary hover:underline">
                    Termos de Serviço
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a assinar o {selectedPlanDetails.name} por {formatPrice(selectedPlanDetails.price)}/mês.
              O pagamento será processado via {paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePayment}
              disabled={processing}
              className="bg-primary hover:bg-primary/90"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}