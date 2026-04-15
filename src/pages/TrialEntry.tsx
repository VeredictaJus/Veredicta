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
  const [sendingSmsOtp, setSendingSmsOtp] = useState(false);
  const [verifyingSmsOtp, setVerifyingSmsOtp] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [smsOtpCode, setSmsOtpCode] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsOtpVerified, setSmsOtpVerified] = useState(false);
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [smsOtpToken, setSmsOtpToken] = useState('');
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
    return true;
  };

  const resetOtpState = () => {
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setSmsOtpSent(false);
    setSmsOtpVerified(false);
    setEmailOtpCode('');
    setSmsOtpCode('');
    setEmailOtpToken('');
    setSmsOtpToken('');
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
        throw new Error(payload?.error || 'Não foi possível enviar o código.');
      }

      setEmailOtpSent(true);
      setEmailOtpVerified(false);
      setSmsOtpSent(false);
      setSmsOtpVerified(false);
      setEmailOtpToken('');
      setSmsOtpToken('');
      setEmailOtpCode('');
      setSmsOtpCode('');
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

  const handleSendSmsOtp = async () => {
    if (!validateBaseFields()) return;
    if (!emailOtpVerified || !emailOtpToken) {
      toast.error('Valide primeiro o código enviado por e-mail.');
      return;
    }

    setSendingSmsOtp(true);
    try {
      const response = await fetch('/api/trial/send-sms-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          email_otp_token: emailOtpToken,
          website: form.website,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Não foi possível enviar o código SMS.');
      }

      setSmsOtpSent(true);
      setSmsOtpVerified(false);
      setSmsOtpToken('');
      setSmsOtpCode('');
      toast.success('Código SMS enviado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar código SMS.');
    } finally {
      setSendingSmsOtp(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    if (!smsOtpSent) {
      toast.error('Envie o código SMS primeiro.');
      return;
    }
    if (!/^\d{4,8}$/.test(smsOtpCode.trim())) {
      toast.error('Digite o código SMS recebido.');
      return;
    }

    setVerifyingSmsOtp(true);
    try {
      const response = await fetch('/api/trial/verify-sms-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone.trim(),
          code: smsOtpCode.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.verification_token) {
        throw new Error(payload?.error || 'Código SMS inválido.');
      }

      setSmsOtpToken(String(payload.verification_token));
      setSmsOtpVerified(true);
      toast.success('Telefone validado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao validar código SMS.');
      setSmsOtpVerified(false);
      setSmsOtpToken('');
    } finally {
      setVerifyingSmsOtp(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateBaseFields()) return;
    if (!emailOtpVerified || !emailOtpToken) {
      toast.error('Valide o código enviado por e-mail para continuar.');
      return;
    }
    if (!smsOtpVerified || !smsOtpToken) {
      toast.error('Valide o código enviado por SMS para continuar.');
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
          phone: form.phone.trim(),
          origin: originParam,
          website: form.website,
          email_otp_token: emailOtpToken,
          sms_otp_token: smsOtpToken,
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
    <div className="auth-page relative min-h-screen flex items-center justify-center px-4">
      <AuthBackground />
      <div className="relative z-10 w-full max-w-lg">
        <Card className="w-full border-white/25 bg-slate-950/78 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
          <CardHeader className="space-y-3">
            <div className="flex justify-center pb-1">
              <Link to="/" className="flex flex-col items-center justify-center hover:opacity-85 transition-opacity">
                <div className="w-20 h-20 rounded-full border border-white/30 bg-white/12 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center">
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
            <CardTitle className="flex items-center gap-2 text-white">
              <QrCode className="h-5 w-5 text-orange-600" />
              Seu acesso à Veredicta está liberado
            </CardTitle>
            <CardDescription className="text-justify text-slate-200">
              Acesso liberado para envio da sua primeira demanda.
            </CardDescription>
            <div className="rounded-md border border-orange-300/40 bg-orange-500/16 px-3 py-2">
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
                  setForm((prev) => ({ ...prev, phone: event.target.value }));
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

            {emailOtpVerified && (
              <div className="space-y-3 rounded-md border border-white/20 bg-slate-900/45 p-3">
                <Button className="w-full" type="button" onClick={handleSendSmsOtp} disabled={sendingSmsOtp}>
                  {sendingSmsOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Enviando SMS...</span>
                    </>
                  ) : (
                    'Enviar código por SMS'
                  )}
                </Button>

                {smsOtpSent && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sms_otp_code" className="text-slate-100">Código SMS</Label>
                      <Input
                        id="sms_otp_code"
                        value={smsOtpCode}
                        onChange={(event) => setSmsOtpCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="Digite o código recebido por SMS"
                        className="border-white/20 bg-slate-900/65 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button
                      className="w-full"
                      type="button"
                      variant="outline"
                      onClick={handleVerifySmsOtp}
                      disabled={verifyingSmsOtp}
                    >
                      {verifyingSmsOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Validando SMS...</span>
                        </>
                      ) : (
                        'Validar código SMS'
                      )}
                    </Button>
                    {smsOtpVerified ? (
                      <p className="text-xs text-green-600">Telefone validado. Você já pode iniciar o teste.</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Valide o código SMS para concluir.</p>
                    )}
                  </>
                )}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={loading || !emailOtpVerified || !smsOtpVerified}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Acessar plataforma'
              )}
            </Button>
              <p className="text-center text-xs text-slate-300">Acesso imediato. Sem compromisso.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

