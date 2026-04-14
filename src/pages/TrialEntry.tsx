import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { toast } from 'sonner';
import { Loader2, QrCode } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';

export default function TrialEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Preencha nome, email e telefone.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/create-trial-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          origin: 'qr_code',
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg border-amber-200/45 bg-gradient-to-br from-amber-50/45 to-orange-50/25 shadow-[0_8px_24px_-18px_rgba(245,158,11,0.22)] dark:border-border/60 dark:bg-card/80 dark:bg-none dark:shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-orange-600" />
            Acesso rápido de teste
          </CardTitle>
          <CardDescription>
            Informe apenas seus dados principais e entre direto na plataforma para enviar sua primeira petição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="voce@escritorio.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Entrando...</span>
                </>
              ) : (
                'Começar teste'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

