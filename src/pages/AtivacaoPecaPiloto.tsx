import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, Lock, Loader2 } from 'lucide-react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  getRedirectResult,
  setPersistence,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { useNewAuth } from '@/contexts/NewAuthContext';

const BULLETS = [
  'Padrão técnico de redação',
  'Estrutura operacional da plataforma',
  'Modelo de entrega e revisão',
  'Fluxo produtivo aplicado ao seu escritório',
];

const SESSION_TOKEN_KEY = 'veredicta.pilot_activation_token';

export default function AtivacaoPecaPiloto() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useNewAuth();
  const [loading, setLoading] = useState(false);
  const redirectHandledRef = useRef(false);

  const activationLinkToken = useMemo(() => String(token || '').trim(), [token]);

  // Fallback: quando o retorno do Google não traz getRedirectResult (ou auth.currentUser ainda não está pronto),
  // redirecionar assim que o contexto carregar o usuário.
  useEffect(() => {
    if (redirectHandledRef.current) return;
    if (!user?.uid) return;

    let pToken = activationLinkToken;
    if (!pToken) {
      try {
        pToken = String(sessionStorage.getItem(SESSION_TOKEN_KEY) || '').trim();
      } catch {
        pToken = '';
      }
    }
    if (!pToken) return;

    if (user.role !== 'client') {
      toast.error('A ativação está disponível apenas para clientes.');
      try {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
      } catch {}
      signOut(auth).catch(() => {});
      return;
    }

    redirectHandledRef.current = true;
    navigate(`/client?activate_token=${encodeURIComponent(pToken)}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.role, activationLinkToken]);

  useEffect(() => {
    // Finaliza (ou reporta erro) do fluxo de redirect do Google.
    // A sessão real é restaurada via onAuthStateChanged no NewAuthContext.
    (async () => {
      try {
        const result = await getRedirectResult(auth);

        // Se voltou do Google com sucesso, entrar direto no dashboard
        const fbUser = result?.user || auth.currentUser;
        if (fbUser?.uid && !redirectHandledRef.current) {
          redirectHandledRef.current = true;
          let pToken = '';
          try {
            pToken = String(sessionStorage.getItem(SESSION_TOKEN_KEY) || '').trim();
          } catch {}
          if (!pToken) pToken = activationLinkToken;

          if (pToken) {
            navigate(`/client?activate_token=${encodeURIComponent(pToken)}`, { replace: true });
          } else {
            navigate('/client', { replace: true });
          }
        }
      } catch (err: any) {
        console.error('Google redirect error:', err);
        toast.error(err?.message || 'Não foi possível concluir o login com Google.');
        try {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
        } catch {}
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Login Google na MESMA aba (redirect)
    setLoading(true);
    try {
      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, activationLinkToken);
      } catch {}

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // Garantir persistência após voltar do Google
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        await setPersistence(auth, browserSessionPersistence);
      }

      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Erro ao iniciar login com Google.');
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

