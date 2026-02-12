import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNewAuth } from '@/contexts/NewAuthContext';

const BULLETS = [
  'Padrão técnico de redação',
  'Estrutura operacional da plataforma',
  'Modelo de entrega e revisão',
  'Fluxo produtivo aplicado ao seu escritório',
];

export default function AtivacaoPecaPiloto() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loginWithGoogleClient } = useNewAuth();
  const [loading, setLoading] = useState(false);

  const activationLinkToken = useMemo(() => String(token || '').trim(), [token]);

  const handleActivate = async () => {
    if (!activationLinkToken) {
      toast.error('Link inválido. Verifique o protocolo de ativação.');
      return;
    }

    // Se já estiver logado, entra direto no dashboard (resgate ocorre lá)
    if (user?.uid) {
      if (user.role !== 'client') {
        toast.error('A ativação está disponível apenas para clientes.');
        return;
      }
      navigate(`/client?activate_token=${encodeURIComponent(activationLinkToken)}`, { replace: true });
      return;
    }

    // Login Google via POPUP (mais confiável que redirect)
    setLoading(true);
    try {
      const authUser = await loginWithGoogleClient();
      if (authUser.role !== 'client') {
        toast.error('A ativação está disponível apenas para clientes.');
        return;
      }
      navigate(`/client?activate_token=${encodeURIComponent(activationLinkToken)}`, { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Erro ao iniciar login com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <Card className="border-border bg-container-primary">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              Ativação da Peça Piloto Veredicta
            </CardTitle>
            <p className="text-muted-foreground text-base sm:text-lg">
              Você pode iniciar a validação do fluxo produtivo do seu escritório por meio de uma peça piloto estruturada.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-container-inner p-5">
              <ul className="space-y-3">
                {BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5" />
                    <span className="text-sm sm:text-base">{b}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                O processo de ativação leva menos de 1 minuto.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={handleActivate}
                disabled={loading}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-6 text-base"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </span>
                ) : (
                  'Entrar com Google e Ativar Peça Piloto'
                )}
              </Button>

              <div className="w-full rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p>
                    <strong className="text-foreground">Acesso exclusivo</strong> para advogados regularmente inscritos na OAB.
                    Seus dados são utilizados apenas para validação profissional e não são compartilhados com terceiros.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-muted-foreground">
              <span>CNPJ 61.992.118/0001-38</span>
              <span className="flex gap-3">
                <a className="hover:text-foreground underline underline-offset-4" href="/#/privacidade">
                  Política de Privacidade
                </a>
                <a className="hover:text-foreground underline underline-offset-4" href="/#/termos">
                  Termos de Uso
                </a>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

