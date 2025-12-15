import { Navigate } from 'react-router-dom';
import { useSuspensionCheck } from '@/hooks/useSuspensionCheck';
import { Card, CardContent } from '@/components/ui/card';
import { Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuspendedAccessBlockProps {
  feature: 'petitions' | 'calculator' | 'payments';
  children: React.ReactNode;
}

export default function SuspendedAccessBlock({ feature, children }: SuspendedAccessBlockProps) {
  const { suspensionInfo, loading, canAccess } = useSuspensionCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Se pode acessar, mostrar conteúdo normal
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  // Se não pode acessar, mostrar mensagem de bloqueio
  const featureNames = {
    petitions: 'Petições Disponíveis',
    calculator: 'Calculadora',
    payments: 'Pagamentos'
  };

  const featureName = featureNames[feature];
  const isBlocked = suspensionInfo.isBlocked;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className={`border-2 ${isBlocked ? 'border-red-600 bg-red-50 dark:bg-red-950/50' : 'border-orange-500 bg-orange-50 dark:bg-orange-950/50'}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {isBlocked ? (
              <Ban className="h-20 w-20 text-red-600 dark:text-red-400 mx-auto" />
            ) : (
              <Clock className="h-20 w-20 text-orange-600 dark:text-orange-400 mx-auto" />
            )}
            
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isBlocked ? 'text-red-900 dark:text-red-100' : 'text-orange-900 dark:text-orange-100'}`}>
                {isBlocked ? '🚫 Acesso Bloqueado' : '⏸️ Acesso Suspenso'}
              </h2>
              <p className={`text-lg ${isBlocked ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                Você não pode acessar "{featureName}" no momento
              </p>
            </div>

            {isBlocked ? (
              <div className="bg-red-200 dark:bg-red-900/80 text-red-950 dark:text-red-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">Sua conta está bloqueada permanentemente</p>
                {suspensionInfo.reason && (
                  <p className="text-sm">{suspensionInfo.reason}</p>
                )}
                <p className="text-sm mt-4">
                  Entre em contato com o suporte para solicitar revisão da sua conta.
                </p>
              </div>
            ) : (
              <div className="bg-orange-200 dark:bg-orange-900/80 text-orange-950 dark:text-orange-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">
                  Você está suspenso por mais {suspensionInfo.daysRemaining} dia{suspensionInfo.daysRemaining !== 1 ? 's' : ''}
                </p>
                {suspensionInfo.reason && (
                  <p className="text-sm">{suspensionInfo.reason}</p>
                )}
                <p className="text-sm mt-4">
                  Durante a suspensão, você pode:
                </p>
                <ul className="text-sm list-disc list-inside text-left">
                  <li>Concluir petições em andamento</li>
                  <li>Acessar o chat e suporte</li>
                  <li>Revisar suas configurações</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                ← Voltar
              </Button>
              <Button
                onClick={() => window.location.href = '/#/writer/chat'}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                💬 Falar com Suporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







