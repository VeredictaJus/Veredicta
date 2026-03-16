import { useState, useEffect, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import FloatingLegalBackground from '@/components/ui/FloatingLegalBackground';

// ✅ Usar logo público (evita falhas de asset path/case em produção)
const logoImage = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';

/* --- Mini componente local para o logo dentro do círculo branco --- */
const BrandLogo: FC = () => (
  <div className="flex items-center justify-center space-x-3 mb-6">
    <div className="w-12 h-12 rounded-full bg-white ring-1 ring-black/10 shadow flex items-center justify-center">
      <img src={logoImage} alt="Veredicta" className="w-7 h-7 object-contain" />
    </div>
    <span className="text-2xl font-medium text-white tracking-wide px-3 py-1 rounded-xl bg-slate-950/50 backdrop-blur-sm border border-white/10 drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
      Vered
      <span className="relative inline-block">
        <span style={{ textDecoration: 'none', fontFeatureSettings: '"cv01" 1' }}>i</span>
        <span className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></span>
      </span>
      cta
    </span>
  </div>
);

const AUTH_ANIMATED_OVERLAYS = (
  <>
    <div aria-hidden className="fixed inset-0 z-[1] bg-slate-950/10" />
    <div
      aria-hidden
      className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)]"
    />
    <div
      aria-hidden
      className="fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_55%)]"
    />
  </>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);

  // helper para abrir o login imediatamente
  const goToLogin = () => {
    window.location.replace('/#/auth/login');
  };

  // ✅ Verificar se o código de reset é válido
  useEffect(() => {
    const verifyCode = async () => {
      // Firebase pode adicionar o código em diferentes lugares:
      // 1. Query string: ?mode=resetPassword&oobCode=...
      // 2. Hash: #mode=resetPassword&oobCode=...
      // 3. Hash com query: /reset-password#?oobCode=...
      
      let code: string | null = null;
      
      // Tentar 1: Query string da URL principal
      code = searchParams.get('oobCode');
      
      // Tentar 2: Query string dentro do hash
      if (!code) {
        const hash = window.location.hash;
        const hashMatch = hash.match(/[?#]oobCode=([^&]+)/);
        if (hashMatch) {
          code = hashMatch[1];
        }
      }
      
      // Tentar 3: Parâmetros completos do hash
      if (!code) {
        const hash = window.location.hash;
        const hashQueryString = hash.split('?')[1] || hash.split('#')[1] || '';
        if (hashQueryString) {
          const hashParams = new URLSearchParams(hashQueryString);
          code = hashParams.get('oobCode') || hashParams.get('code');
        }
      }
      
      // Tentar 4: URL completa (caso o Firebase redirecione)
      if (!code) {
        const fullUrl = window.location.href;
        const urlMatch = fullUrl.match(/oobCode=([^&]+)/);
        if (urlMatch) {
          code = urlMatch[1];
        }
      }
      
      console.log('🔍 Tentando encontrar código de reset:', {
        searchParams: Object.fromEntries(searchParams),
        hash: window.location.hash,
        href: window.location.href,
        foundCode: code ? 'sim' : 'não'
      });
      
      if (!code) {
        console.log('❌ Nenhum código de reset encontrado na URL');
        setIsValidCode(false);
        return;
      }

      setActionCode(code);

      try {
        // Verificar se o código é válido
        await verifyPasswordResetCode(auth, code);
        console.log('✅ Código de reset válido');
        setIsValidCode(true);
      } catch (error: any) {
        console.error('❌ Código de reset inválido:', error);
        setIsValidCode(false);
      }
    };

    verifyCode();
  }, [searchParams]);

  const validatePassword = (password: string): boolean => password.length >= 8;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!password) newErrors.password = 'Nova senha é obrigatória';
    else if (!validatePassword(password)) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';

    if (!confirmPassword) newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!actionCode) {
      setErrors({ general: 'Código de reset não encontrado. Por favor, solicite um novo link.' });
      return;
    }

    setIsLoading(true);
    try {
      // Confirmar o reset de senha usando o código
      await confirmPasswordReset(auth, actionCode, password);
      
      // ✅ Sucesso
      setIsSuccess(true);

      // Auto-redirect após 2s
      setTimeout(() => {
        window.location.replace('/#/auth/login');
      }, 2000);
    } catch (error: any) {
      console.error('❌ Erro ao redefinir senha:', error);
      let msg = 'Erro ao redefinir senha. Tente novamente.';
      
      switch (error.code) {
        case 'auth/expired-action-code':
          msg = 'O link de redefinição expirou. Por favor, solicite um novo link.';
          break;
        case 'auth/invalid-action-code':
          msg = 'O link de redefinição é inválido ou já foi usado. Por favor, solicite um novo link.';
          break;
        case 'auth/weak-password':
          msg = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
          break;
        default:
          msg = error.message || 'Erro ao redefinir senha. Tente novamente.';
      }
      
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  /* ⏳ Carregando */
  if (isValidCode === null) {
    return (
      <div className="auth-page relative min-h-screen flex items-center justify-center bg-slate-950">
        <FloatingLegalBackground />
        {AUTH_ANIMATED_OVERLAYS}
        <p className="text-slate-200 relative z-10">Carregando...</p>
      </div>
    );
  }

  /* ❌ Link inválido */
  if (isValidCode === false) {
    return (
      <div className="auth-page relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
        <FloatingLegalBackground />
        {AUTH_ANIMATED_OVERLAYS}

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <BrandLogo />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-gray-900">Link Inválido</CardTitle>
              <CardDescription className="text-gray-600 !whitespace-normal !max-w-none">
                O link de redefinição de senha é inválido ou expirou
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-gray-200 text-center flex flex-col items-center">
                <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
                <AlertDescription className="text-gray-900 text-center">
                  Este link pode ter expirado ou já foi usado. Solicite um novo link de redefinição.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-3">
                <Button onClick={() => navigate('/auth/forgot-password')} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Solicitar novo link
                </Button>
                <Button variant="outline" onClick={goToLogin} className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  Voltar ao Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ✅ Sucesso */
  if (isSuccess) {
    return (
      <div className="auth-page relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
        <FloatingLegalBackground />
        {AUTH_ANIMATED_OVERLAYS}

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <BrandLogo />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-gray-900">Senha Redefinida!</CardTitle>
              <CardDescription className="text-gray-600 !whitespace-normal !max-w-none">Sua senha foi alterada com sucesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-gray-200 text-center flex flex-col items-center">
                <CheckCircle className="h-4 w-4 mx-auto mb-2" />
                <AlertDescription className="text-gray-900 text-center">Agora você pode fazer login com sua nova senha.</AlertDescription>
              </Alert>

              <Button onClick={goToLogin} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Fazer Login
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Você será redirecionado automaticamente em alguns segundos...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* 🔐 Formulário de redefinição */
  return (
    <div className="auth-page relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
      <FloatingLegalBackground />
      {AUTH_ANIMATED_OVERLAYS}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <BrandLogo />

        <Button
          variant="ghost"
          onClick={goToLogin}
          className="mx-auto flex items-center text-white rounded-xl px-4 py-2 bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:bg-white/10 drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
          <CardHeader className="text-center items-center">
            <CardTitle className="leading-tight text-gray-900">Redefinir Senha</CardTitle>
            <CardDescription className="text-center mx-auto max-w-sm leading-relaxed text-gray-600 !whitespace-normal !max-w-none">
              Digite sua nova senha
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert className="bg-white border-gray-200 text-center flex flex-col items-center">
                  <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
                  <AlertDescription className="text-gray-900 text-center">{errors.general}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="password" className="text-gray-900">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`glass-input ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-900">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className={`glass-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-sky-300/80">
                Lembrou da senha?{' '}
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-orange-600 hover:text-orange-700 font-medium underline-offset-2 hover:underline"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}