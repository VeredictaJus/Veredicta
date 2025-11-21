import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, QrCode, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StripePixService } from '@/services/stripePixService';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useNavigate } from 'react-router-dom';
import { PlansService } from '@/services/plansService';

interface PixPaymentProps {
  planId: string;
  planName: string;
  price: number;
  onPaymentSuccess: () => void;
}

export const PixPayment: React.FC<PixPaymentProps> = ({ 
  planId, 
  planName, 
  price, 
  onPaymentSuccess 
}) => {
  const { user } = useNewAuth();
  const navigate = useNavigate();
  const [pixData, setPixData] = useState<{
    paymentIntentId: string;
    clientSecret: string;
    pixCode: string;
    qrCodeImage: string;
    amount: number;
    expiresAt: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired' | 'error'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePix = async () => {
      if (!user?.uid) {
        toast.error('Usuário não autenticado.');
        return;
      }
      setLoading(true);
      try {
        const data = await StripePixService.createPixPayment(planId, planName, price, user.uid, user.email);
        setPixData(data);
        setTimeLeft(Math.floor((data.expiresAt - Date.now()) / 1000));
        setPaymentStatus('pending');
      } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        toast.error('Erro ao gerar PIX. Tente novamente.');
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    generatePix();
  }, [user?.uid, planId, price]);

  useEffect(() => {
    if (paymentStatus !== 'pending' || !pixData) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired');
          toast.error('PIX expirado. Gere um novo para continuar.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Verificar status do pagamento (sem simulação automática)
    const checkPaymentInterval = setInterval(async () => {
      if (pixData && user?.uid) {
        try {
          const paymentStatus = await StripePixService.checkPixPaymentStatus(pixData.paymentIntentId);
          
          if (paymentStatus.status === 'completed') {
            clearInterval(timer);
            clearInterval(checkPaymentInterval);
            setPaymentStatus('completed');
            toast.success('Pagamento PIX confirmado com sucesso!');
            onPaymentSuccess();
            navigate('/client/plans?pix_success=true');
          } else if (paymentStatus.status === 'expired') {
            clearInterval(timer);
            clearInterval(checkPaymentInterval);
            setPaymentStatus('expired');
            toast.error('PIX expirado. Gere um novo para continuar.');
          } else if (paymentStatus.status === 'failed') {
            clearInterval(timer);
            clearInterval(checkPaymentInterval);
            setPaymentStatus('error');
            toast.error('Pagamento PIX falhou. Tente novamente.');
          }
          // Se status for 'pending', continua aguardando
        } catch (error) {
          console.error('Erro ao verificar status do PIX:', error);
        }
      }
    }, 10000); // Verifica a cada 10 segundos (menos frequente)

    return () => {
      clearInterval(timer);
      clearInterval(checkPaymentInterval);
    };
  }, [pixData, paymentStatus, user?.uid, onPaymentSuccess, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      toast.info('Código PIX copiado!');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 !text-gray-900 dark:!text-white">
            <QrCode className="h-5 w-5 text-orange-600" />
            <span>Gerando PIX...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
          <p className="text-muted-foreground">Aguarde enquanto geramos seu código PIX.</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <Card className="w-full max-w-md border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Pagamento Confirmado!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg font-semibold text-foreground">Sua assinatura foi ativada com sucesso!</p>
          <Button onClick={() => navigate('/client/plans')} className="w-full bg-green-600 hover:bg-green-700">
            Ir para Meus Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Card className="w-full max-w-md border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro no Pagamento PIX</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg font-semibold text-foreground">Não foi possível processar seu pagamento PIX.</p>
          <Button onClick={() => setPaymentStatus('pending')} className="w-full bg-orange-600 hover:bg-orange-700">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 !text-gray-900 dark:!text-white">
          <QrCode className="h-5 w-5 text-orange-600" />
          <span>Pagamento via PIX</span>
        </CardTitle>
        <CardDescription className="flex items-center space-x-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Expira em: {formatTime(timeLeft)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Valor: {PlansService.formatPrice(price)}</p>
        </div>
        {pixData?.qrCodeImage && (
          <div className="flex justify-center p-2 bg-white rounded-lg">
            <img src={pixData.qrCodeImage} alt="QR Code PIX" className="w-48 h-48" />
          </div>
        )}
        {pixData?.pixCode && (
          <div className="space-y-2">
            <Label htmlFor="pix-code">Código PIX Copia e Cola</Label>
            <div className="flex items-center space-x-2">
              <Input id="pix-code" value={pixData.pixCode} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopyPixCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Como pagar:</p>
          <ul className="list-decimal list-inside space-y-1">
            <li>Abra o aplicativo do seu banco ou instituição financeira.</li>
            <li>Selecione a opção "PIX" e depois "Pagar com QR Code" ou "PIX Copia e Cola".</li>
            <li>Escaneie o QR Code acima ou cole o código PIX.</li>
            <li>Confirme o valor e finalize o pagamento.</li>
            <li>Aguarde a confirmação automática da sua assinatura.</li>
          </ul>
        </div>
        
        {/* Botão para simular pagamento (apenas para testes) */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            🧪 Para testes: Simular pagamento
          </p>
          <Button 
            onClick={async () => {
              if (pixData?.paymentIntentId) {
                try {
                  await StripePixService.confirmPixPayment(pixData.paymentIntentId);
                  toast.success('Pagamento simulado com sucesso!');
                } catch (error) {
                  toast.error('Erro ao simular pagamento');
                }
              }
            }}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Simular Pagamento (Teste)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};