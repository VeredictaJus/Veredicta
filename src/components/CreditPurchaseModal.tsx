import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Check } from 'lucide-react';
import { PlanType, getCreditPrice, formatCurrency, CREDIT_QUANTITIES } from '@/lib/constants';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPlan: PlanType;
  onPurchase: (quantity: number, total: number) => void;
}

export default function CreditPurchaseModal({ isOpen, onClose, userPlan, onPurchase }: CreditPurchaseModalProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const creditPrice = getCreditPrice(userPlan);
  const total = selectedQuantity * creditPrice;

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPurchase(selectedQuantity, total);
    setIsProcessing(false);
    onClose();
  };

  const getPlanBadgeColor = (plan: PlanType) => {
    switch (plan) {
      case 'STARTER': return 'bg-blue-100 text-blue-800';
      case 'PROFESSIONAL': return 'bg-orange-100 text-orange-800';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: PlanType) => {
    switch (plan) {
      case 'STARTER': return 'Starter';
      case 'PROFESSIONAL': return 'Profissional';
      case 'PREMIUM': return 'Premium';
      default: return 'Starter';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Comprar Créditos</span>
          </DialogTitle>
          <DialogDescription>
            Adicione créditos à sua conta para solicitar mais petições
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Seu plano atual:</p>
              <Badge className={getPlanBadgeColor(userPlan)}>
                {getPlanName(userPlan)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Preço por crédito:</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(creditPrice)}</p>
            </div>
          </div>

          {/* Quantity Selection */}
          <div>
            <p className="text-sm font-medium mb-3">Selecione a quantidade:</p>
            <div className="grid grid-cols-3 gap-2">
              {CREDIT_QUANTITIES.map((quantity) => (
                <Card
                  key={quantity}
                  className={`cursor-pointer transition-all ${
                    selectedQuantity === quantity 
                      ? 'ring-2 ring-orange-500 bg-orange-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedQuantity(quantity)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {selectedQuantity === quantity && (
                        <Check className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {quantity === 1 ? 'crédito' : 'créditos'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-700">Total a pagar:</span>
              <span className="text-2xl font-bold text-green-700">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="text-xs text-green-600">
              {selectedQuantity} × {formatCurrency(creditPrice)}
            </div>
          </div>

          {/* Savings Message */}
          {userPlan !== 'STARTER' && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700">
                💰 <strong>Economia do seu plano:</strong> Você economiza{' '}
                {formatCurrency(220 - creditPrice)} por crédito comparado ao plano Starter!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processando...' : `Comprar ${formatCurrency(total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}