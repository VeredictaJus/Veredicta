// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import AuthBackground from '@/components/ui/AuthBackground';

// ✅ Usar logo público (evita falhas de asset path/case em produção)
const logoImage = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useNewAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    const requestId = Math.random().toString(36).slice(2);
    console.log(`[ForgotPassword][${requestId}] iniciando fluxo para ${email}`);

    try {
      await forgotPassword(email);
      console.log(`[ForgotPassword][${requestId}] fluxo concluído com sucesso para ${email}`);
      setIsEmailSent(true);
    } catch (e: any) {
      console.error(`[ForgotPassword][${requestId}] erro ao enviar email:`, e);
      setError(e?.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log(`[ForgotPassword][${requestId}] terminado (sucesso=${!error}).`);
    }
  };

  if (isEmailSent) {
    return (
      <div className="auth-page relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
        <AuthBackground />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
  <Link to="/" className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity">
    <div className="w-20 h-20 rounded-full bg-white ring-1 ring-black/10 shadow-md flex items-center justify-center">
      <img
        src={logoImage}
        alt="Veredicta"
        className="h-12 w-auto object-contain"
      />
    </div>
    <span className="mt-3 text-2xl font-medium text-white tracking-wide">
      Vered
      <span className="relative inline-block">
        <span style={{ textDecoration: 'none', fontFeatureSettings: '"cv01" 1' }}>i</span>
        <span className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></span>
      </span>
      cta
    </span>
  </Link>
</div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-gray-900">Email Enviado!</CardTitle>
              <CardDescription className="text-center mx-auto max-w-sm leading-relaxed text-gray-600">
    Enviamos as instruções para redefinir sua senha
  </CardDescription>
</CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="px-0 text-center flex flex-col items-center space-y-3 py-6 bg-white border-gray-200">
  {/* override do posicionamento padrão do Alert */}
  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 shadow-sm border border-orange-200">
    <Mail className="h-9 w-9 text-orange-600" />
  </div>
  <AlertDescription className="text-base max-w-md mx-auto text-gray-900 text-center px-4">
    Verifique sua caixa de entrada no email <strong>{email}</strong> e siga as instruções para redefinir sua senha.
  </AlertDescription>
</Alert>

              <div className="text-sm text-gray-600 space-y-2 text-center">
                <ul className="list-disc list-inside space-y-1">
                  <li>Verifique também a pasta de spam/lixo eletrônico</li>
                  <li>O link expira em 24 horas</li>
                  <li>Se não receber o email, tente novamente</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  Enviar novamente
                </Button>
                <Button onClick={() => navigate('/auth/login')} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Voltar ao Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
  <div className="auth-page relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
    <AuthBackground />

    {/* topo – logo com círculo branco */}
    <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <Link to="/" className="flex flex-col items-center justify-center mb-6 hover:opacity-80 transition-opacity">
        <div className="w-20 h-20 rounded-full bg-white ring-1 ring-black/10 shadow-md flex items-center justify-center">
          <img
            src={logoImage}
            alt="Veredicta"
            className="h-12 w-auto object-contain"
          />
        </div>
        <span className="mt-3 text-2xl font-medium text-white tracking-wide">
          Vered
          <span className="relative inline-block">
            <span style={{ textDecoration: 'none', fontFeatureSettings: '"cv01" 1' }}>i</span>
            <span className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></span>
          </span>
          cta
        </span>
      </Link>

      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/auth/login')}
        className="mx-auto flex items-center text-white rounded-xl px-4 py-2 bg-slate-950/40 backdrop-blur-sm border border-white/10 hover:bg-white/10 drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao login
      </Button>
    </div>

    {/* Card do formulário */}
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(219,234,254,0.78))] shadow-[0_8px_32px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
        <CardHeader className="text-center">
          <CardTitle className="text-white">Esqueci minha senha</CardTitle>
          <CardDescription className="mx-auto max-w-sm leading-relaxed text-sky-300/80">
            Digite seu email para receber instruções de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="seu@email.com"
                className={`glass-input ${error ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sky-300/80">
              Lembrou da senha?{' '}
              <Link
                to="/auth/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
}