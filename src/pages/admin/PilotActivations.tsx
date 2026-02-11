import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Link2, Loader2, Plus, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useNewAuth } from '@/contexts/NewAuthContext';

type TokenRow = {
  token: string;
  created_at: string;
  created_by?: string | null;
  redeemed_at?: string | null;
  redeemed_by?: string | null;
  revoked_at?: string | null;
};

function buildShareUrl(token: string) {
  // App usa HashRouter → links externos precisam de /#/
  return `${window.location.origin}/#/ativacao-peca-piloto/${encodeURIComponent(token)}`;
}

export default function PilotActivations() {
  const { user } = useNewAuth();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.token.toLowerCase().includes(q));
  }, [rows, search]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_list_pilot_activation_tokens', {
        p_admin_uid: user.uid,
        p_limit: 200,
      });
      if (error) throw error;
      setRows((data as TokenRow[]) || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Não foi possível carregar as ativações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleCreate = async () => {
    if (!user?.uid) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('admin_create_pilot_activation_token', {
        p_admin_uid: user.uid,
      });
      if (error) throw error;
      const token = (data as any)?.token as string | undefined;
      if (!token) throw new Error('Token não retornado.');
      await navigator.clipboard.writeText(buildShareUrl(token));
      toast.success('Link gerado e copiado.');
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Não foi possível gerar o link.');
    } finally {
      setCreating(false);
    }
  };

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(token));
      toast.success('Link copiado.');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-container-primary border-border">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ativações — Peça Piloto</CardTitle>
            <CardDescription>
              Gere links institucionais para ativação via WhatsApp. Tokens não expiram (uso único).
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              <span className="ml-2">Atualizar</span>
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-2">Gerar novo link</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar protocolo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/40 text-xs font-medium text-muted-foreground px-4 py-2">
              <div className="col-span-4">Protocolo</div>
              <div className="col-span-3">Criado em</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum protocolo encontrado.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((r) => {
                  const status = r.revoked_at
                    ? 'Revogado'
                    : r.redeemed_at
                      ? 'Resgatado'
                      : 'Disponível';
                  return (
                    <div key={r.token} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                      <div className="col-span-4 font-mono text-foreground">{r.token}</div>
                      <div className="col-span-3 text-muted-foreground">
                        {r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '-'}
                      </div>
                      <div className="col-span-3 text-muted-foreground">{status}</div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => copy(r.token)}>
                          <Copy className="h-4 w-4" />
                          <span className="ml-2 hidden sm:inline">Copiar</span>
                        </Button>
                        <a
                          className="inline-flex"
                          href={buildShareUrl(r.token)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Link2 className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">Abrir</span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Dica: ao gerar, o link já é copiado no seu clipboard (formato com <span className="font-mono">/#/</span>).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

