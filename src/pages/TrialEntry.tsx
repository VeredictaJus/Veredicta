import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { toast } from 'sonner';
import { Loader2, QrCode } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import AuthBackground from '@/components/ui/AuthBackground';

const logoImage = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function TrialEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    website: '',
  });
  const siteKey = useMemo(
    () => String(import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim(),
    []
  );
  const requiresCaptcha = Boolean(siteKey);

  useEffect(() => {
    if (!requiresCaptcha || !turnstileRef.current) return;

    let cancelled = false;
    const existingScript = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;

    const renderWidget = () => {
      if (cancelled || !window.turnstile || !turnstileRef.current) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => setCaptchaToken(token || ''),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', renderWidget);
      return () => existingScript.removeEventListener('load', renderWidget);
    }

    return () => {
      cancelled = true;
    };
  }, [requiresCaptcha, siteKey]);

  const validateBaseFields = () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Preencha nome, email e telefone.');
      return false;
    }

    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('Digite um telefone válido com DDD.');
      return false;
    }

    return true;
  };

  const resetOtpState = () => {
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setEmailOtpCode('');
    setEmailOtpToken('');
  };

  const handleSendEmailOtp = async () => {
    if (!validateBaseFields()) return;
    if (requiresCaptcha && !captchaToken) {
      toast.error('Confirme o captcha para continuar.');
      return;
    }

    setSendingEmailOtp(true);
    try {
      const response = await fetch('/api/trial/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          website: form.website,
          captcha_token: captchaToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = [payload?.error, payload?.details].filter(Boolean).join(' - ');
        throw new Error(errorMessage || 'Não foi possível enviar o código.');
      }

      setEmailOtpSent(true);
      setEmailOtpVerified(false);
      setEmailOtpToken('');
      setEmailOtpCode('');
      toast.success('Código enviado para seu e-mail.');

      if (requiresCaptcha && window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        setCaptchaToken('');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar código.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpSent) {
      toast.error('Envie o código primeiro.');
      return;
    }
    if (!/^\d{6}$/.test(emailOtpCode.trim())) {
      toast.error('Digite o código de 6 dígitos.');
      return;
    }

    setVerifyingEmailOtp(true);
    try {
      const response = await fetch('/api/trial/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          code: emailOtpCode.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.verification_token) {
        throw new Error(payload?.error || 'Código inválido.');
      }

      setEmailOtpToken(String(payload.verification_token));
      setEmailOtpVerified(true);
      toast.success('E-mail validado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao validar código.');
      setEmailOtpVerified(false);
      setEmailOtpToken('');
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateBaseFields()) return;
    if (!emailOtpVerified || !emailOtpToken) {
      toast.error('Valide o código enviado por e-mail para continuar.');
      return;
    }

    const originParam =
      String(searchParams.get('origem') || searchParams.get('utm_source') || 'qr_code')
        .trim()
        .toLowerCase() || 'qr_code';

    setLoading(true);
    try {
      const response = await fetch('/api/users/create-trial-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ''),
          origin: originParam,
          website: form.website,
          email_otp_token: emailOtpToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.custom_token) {
        throw new Error(payload?.error || 'Não foi possível iniciar seu teste agora.');
      }

      await signInWithCustomToken(auth, String(payload.custom_token));
      toast.success('Acesso de teste iniciado com sucesso.');
      navigate('/client', { replace: true });
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao iniciar acesso de teste.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page relative min-h-screen overflow-y-auto px-4 py-6 md:py-10">
      <AuthBackground />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="text-white">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-orange-300/85">
              Acesso exclusivo
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Você foi convidado a conhecer a Veredicta
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Plataforma de petições jurídicas sob demanda para escritórios que precisam produzir mais, sem
              sobrecarregar a equipe.
            </p>
            <p className="mt-6 text-sm font-medium text-orange-200 sm:text-base">
              Envie sua demanda {'\u2192'} Acompanhe {'\u2192'} Receba a petição pronta
            </p>
          </section>

          <div className="w-full max-w-lg lg:justify-self-end">
            <Card className="w-full border-white/25 bg-slate-950/78 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
              <CardHeader className="space-y-3 text-center items-center">
                <div className="flex justify-center pb-1">
                  <Link to="/" className="flex flex-col items-center justify-center hover:opacity-85 transition-opacity">
                    <img
                      src={logoImage}
                      alt="Veredicta"
                      className="h-14 w-auto object-contain"
                    />
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
                <CardTitle className="flex items-center justify-center gap-2 text-white text-center">
                  <QrCode className="h-5 w-5 text-orange-600" />
                  Você recebeu acesso à Veredicta.
                </CardTitle>
                <CardDescription className="max-w-md text-center text-slate-200">
                  Envie uma demanda e receba sua petição pronta
                </CardDescription>
                <div className="w-full max-w-md rounded-md border border-orange-300/40 bg-orange-500/16 px-3 py-2">
                  <p className="text-sm font-semibold text-orange-300">
                    Primeira petição por nossa conta
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 text-slate-100" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-100">Nome</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, full_name: event.target.value }));
                }}
                placeholder="Seu nome completo"
                className="border-white/20 bg-slate-900/65 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-100">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, email: event.target.value }));
                  resetOtpState();
                }}
                placeholder="voce@escritorio.com"
                className="border-white/20 bg-slate-900/65 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-100">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, phone: formatPhoneInput(event.target.value) }));
                  resetOtpState();
                }}
                placeholder="(00) 00000-0000"
                className="border-white/20 bg-slate-900/65 text-white placeholder:text-slate-400"
              />
            </div>
            <input
              type="text"
              value={form.website}
              onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
            {requiresCaptcha && <div ref={turnstileRef} className="min-h-[65px]" />}
            <Button className="w-full" type="button" onClick={handleSendEmailOtp} disabled={sendingEmailOtp}>
              {sendingEmailOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Enviando código...</span>
                </>
              ) : (
                'Enviar código por e-mail'
              )}
            </Button>

            {emailOtpSent && (
              <div className="space-y-3 rounded-md border border-white/20 bg-slate-900/45 p-3">
                <div className="space-y-2">
                  <Label htmlFor="otp_code" className="text-slate-100">Código de verificação</Label>
                  <Input
                    id="otp_code"
                    value={emailOtpCode}
                    onChange={(event) => setEmailOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Digite os 6 dígitos"
                    className="border-white/20 bg-slate-900/65 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button
                  className="w-full"
                  type="button"
                  variant="outline"
                  onClick={handleVerifyEmailOtp}
                  disabled={verifyingEmailOtp}
                >
                  {verifyingEmailOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Validando código...</span>
                    </>
                  ) : (
                    'Validar código'
                  )}
                </Button>
                {emailOtpVerified ? (
                  <p className="text-xs text-green-600">E-mail validado. Você já pode iniciar o teste.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Valide o código para liberar o acesso.</p>
                )}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={loading || !emailOtpVerified}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Acessar plataforma'
              )}
            </Button>
                  <p className="text-center text-xs text-slate-300">Você já pode enviar sua primeira demanda</p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

