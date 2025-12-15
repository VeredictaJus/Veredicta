import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Star, Zap, ArrowRight } from 'lucide-react';

interface PetitionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  planCode: string;
  usage: number;
  limit: number;
  validityDays?: number;
}

const planIcons = {
  free: AlertTriangle,
  start: Star,
  pro: Crown,
  elite: Zap
};

const planColors = {
  free: 'text-gray-600',
  start: 'text-blue-600',
  pro: 'text-purple-600',
  elite: 'text-orange-600'
};

const planNames = {
  free: 'Gratuito',
  start: 'Start',
  pro: 'Pro',
  elite: 'Elite'
};

export const PetitionLimitModal: React.FC<PetitionLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  planCode,
  usage,
  limit,
  validityDays
}) => {
  const IconComponent = planIcons[planCode as keyof typeof planIcons] || AlertTriangle;
  const planName = planNames[planCode as keyof typeof planNames] || 'Desconhecido';
  const planColor = planColors[planCode as keyof typeof planColors] || 'text-gray-600';

  const getValidityText = () => {
    if (planCode === 'free') return 'total';
    if (validityDays === 30) return '30 dias';
    if (validityDays === 60) return '60 dias';
    if (validityDays === 90) return '90 dias';
    return 'período';
  };

  const getUpgradeMessage = () => {
    switch (planCode) {
      case 'free':
        return 'Assine um plano para criar mais petições e ter acesso a recursos exclusivos!';
      case 'start':
        return 'Upgrade para Pro ou Elite para ter mais petições e recursos avançados!';
      case 'pro':
        return 'Upgrade para Elite para ter ainda mais petições e recursos premium!';
      default:
        return 'Considere adquirir créditos extras ou aguarde a renovação do seu plano.';
    }
  };

  const getUpgradeOptions = () => {
    switch (planCode) {
      case 'free':
        return [
          { name: 'Start', limit: '4 petições/30 dias', price: 'R$ 520/mês' },
          { name: 'Pro', limit: '14 petições/60 dias', price: 'R$ 1.680/60 dias' },
          { name: 'Elite', limit: '70 petições/90 dias', price: 'R$ 7.000/90 dias' }
        ];
      case 'start':
        return [
          { name: 'Pro', limit: '14 petições/60 dias', price: 'R$ 1.680/60 dias' },
          { name: 'Elite', limit: '70 petições/90 dias', price: 'R$ 7.000/90 dias' }
        ];
      case 'pro':
        return [
          { name: 'Elite', limit: '70 petições/90 dias', price: 'R$ 7.000/90 dias' }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <IconComponent className={`h-6 w-6 ${planColor}`} />
            Limite de Petições Atingido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status atual */}
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    Plano {planName} - Limite Atingido
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                    Você usou {usage} de {limit} petições disponíveis ({getValidityText()})
                  </p>
                </div>
                <Badge variant="destructive" className="text-sm">
                  {usage}/{limit}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem explicativa */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {getUpgradeMessage()}
            </p>
          </div>

          {/* Opções de upgrade */}
          {getUpgradeOptions().length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-center text-foreground">
                {planCode === 'free' ? 'Escolha seu plano:' : 'Upgrade disponível:'}
              </h4>
              <div className="grid gap-3">
                {getUpgradeOptions().map((option, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer bg-card border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-foreground">{option.name}</h5>
                          <p className="text-sm text-muted-foreground">{option.limit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">{option.price}</p>
                          <Button
                            size="sm"
                            onClick={onUpgrade}
                            className="mt-2"
                          >
                            Assinar
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {getUpgradeOptions().length > 0 && (
              <Button onClick={onUpgrade}>
                Ver Planos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};




