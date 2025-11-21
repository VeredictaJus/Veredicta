import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService } from '@/services/subscriptionService';
import { BillingInfo } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, CreditCard, Calendar, DollarSign, AlertTriangle, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BillingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBillingInfo();
    }
  }, [user]);

  useEffect(() => {
    // Check for success message
    if (searchParams.get('success') === 'true') {
      toast.success('Pagamento processado com sucesso! Bem-vindo ao Veredicta!');
    }
  }, [searchParams]);

  const loadBillingInfo = () => {
    if (!user) return;
    
    const info = subscriptionService.getBillingInfo(user.id);
    setBillingInfo(info);
    setLoading(false);
  };

  const handleCancelSubscription = () => {
    if (!user) return;
    
    subscriptionService.cancelSubscription(user.id);
    loadBillingInfo();
    toast.success('Assinatura cancelada com sucesso');
  };

  const handleRenewSubscription = async () => {
    if (!user) return;
    
    try {
      subscriptionService.renewSubscription(user.id);
      loadBillingInfo();
      toast.success('Assinatura renovada com sucesso!');
    } catch (error) {
      toast.error('Erro ao renovar assinatura');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'payment_pending':
        return <Badge variant="outline">Pagamento Pendente</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/client')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cobrança</h1>
              <p className="text-gray-600">Gerencie sua assinatura e pagamentos</p>
            </div>
          </div>
          <Button onClick={loadBillingInfo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Plano Atual</span>
                  {billingInfo?.subscription && getStatusBadge(billingInfo.subscription.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingInfo?.currentPlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{billingInfo.currentPlan.name}</h3>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPrice(billingInfo.currentPlan.price)}
                          <span className="text-sm font-normal text-gray-600">/mês</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Próxima cobrança</p>
                        <p className="font-semibold">
                          {billingInfo.subscription ? formatDate(billingInfo.subscription.nextBillingDate) : '-'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {billingInfo.currentPlan.petitionsIncluded}
                        </div>
                        <div className="text-sm text-gray-600">Petições Incluídas</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatPrice(billingInfo.currentPlan.additionalCreditPrice)}
                        </div>
                        <div className="text-sm text-gray-600">Crédito Adicional</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {billingInfo.daysUntilExpiry > 0 ? billingInfo.daysUntilExpiry : 0}
                        </div>
                        <div className="text-sm text-gray-600">Dias Restantes</div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button onClick={() => navigate('/client/checkout')} variant="outline">
                        Alterar Plano
                      </Button>
                      
                      {billingInfo.subscription?.status === 'active' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-red-600 hover:text-red-700">
                              Cancelar Assinatura
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos serviços
                                no final do período atual de cobrança.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancelSubscription}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Confirmar Cancelamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {(billingInfo.subscription?.status === 'suspended' || billingInfo.subscription?.status === 'cancelled') && (
                        <Button onClick={handleRenewSubscription} className="bg-orange-600 hover:bg-orange-700">
                          Renovar Assinatura
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h3>
                    <p className="text-gray-600 mb-4">Você precisa assinar um plano para acessar nossos serviços.</p>
                    <Button onClick={() => navigate('/client/checkout')} className="bg-orange-600 hover:bg-orange-700">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Escolher Plano
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>
                  Visualize todos os seus pagamentos e faturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingInfo?.paymentHistory && billingInfo.paymentHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingInfo.paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell className="font-semibold">{formatPrice(payment.amount)}</TableCell>
                          <TableCell className="capitalize">
                            {payment.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}
                          </TableCell>
                          <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
                    <p className="text-gray-600">Seus pagamentos aparecerão aqui após a primeira cobrança.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Petições este mês</span>
                    <span className="font-semibold">0 / {billingInfo?.currentPlan?.petitionsIncluded || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Você ainda tem {billingInfo?.currentPlan?.petitionsIncluded || 0} petições disponíveis este mês.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/client/petitions/new')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Nova Petição
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/client/petitions')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Minhas Petições
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/client/credits')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Comprar Créditos
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe de suporte está sempre pronta para ajudá-lo com questões de cobrança.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/client/chat')}>
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}