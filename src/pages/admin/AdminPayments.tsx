/* @ts-nocheck */
import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

import {
  DollarSign, TrendingUp, Search, Clock, CheckCircle2, AlertTriangle, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient'

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

type PaymentRow = {
  id: string | number;
  amount?: number | null;
  status?: PaymentStatus | string | null;
  payment_date?: string | null;
  created_at?: string | null;
  method?: string | null;
  payment_method?: string | null;
  transaction_id?: string | null;
  petition_id?: string | number | null;
  client_name?: string | null;
  writer_name?: string | null;
  petition_title?: string | null;
};

type PaymentUI = {
  id: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  created_at: string | null;
  method: string | null;
  transaction_id: string | null;
  client_name?: string | null;
  writer_name?: string | null;
  petition_title?: string | null;
  _raw: PaymentRow;
};

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: any }> = {
  pending:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800',    icon: TrendingUp },
  completed:  { label: 'Concluído',   color: 'bg-green-100 text-green-800',  icon: CheckCircle2 },
  failed:     { label: 'Falhou',      color: 'bg-red-100 text-red-800',      icon: AlertTriangle },
};

function mapRow(r: PaymentRow): PaymentUI {
  const st = String(r.status ?? '').toLowerCase() as PaymentStatus;
  const status: PaymentStatus =
    st === 'processing' ? 'processing' :
    st === 'completed'  ? 'completed'  :
    st === 'failed'     ? 'failed'     : 'pending';

  const amount = Number(r.amount ?? 0);

  const method =
    (typeof r.method === 'string' && r.method) ? r.method :
    (typeof r.payment_method === 'string' && r.payment_method) ? r.payment_method : null;

  return {
    id: String(r.id ?? ''),
    amount,
    status,
    payment_date: r.payment_date ?? null,
    created_at: r.created_at ?? null,
    method,
    transaction_id: r.transaction_id ?? null,
    client_name: r.client_name ?? null,
    writer_name: r.writer_name ?? null,
    petition_title: r.petition_title ?? null,
    _raw: r,
  };
}

export default function AdminPayments() {
  const [rows, setRows] = useState<PaymentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [approvedInvoicesTotal, setApprovedInvoicesTotal] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const [selected, setSelected] = useState<PaymentUI | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar pagamentos e notas fiscais aprovadas em paralelo
      const [paymentsResult, invoicesResult] = await Promise.all([
        supabase
          .from('app_2d8133c678_payments')
          .select('id, amount, status, payment_date, created_at, payment_method, reference, petition_id, client_id, writer_id')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('app_2d8133c678_invoices')
          .select('id, amount, status')
          .eq('status', 'approved')
          .limit(1000)
      ]);

      if (paymentsResult.error) throw paymentsResult.error;

      setRows((paymentsResult.data ?? []).map(mapRow));

      // Calcular soma dos valores das notas fiscais aprovadas
      if (invoicesResult.data) {
        const total = invoicesResult.data.reduce((sum, inv) => {
          const amount = Number(inv.amount || 0);
          return sum + amount;
        }, 0);
        setApprovedInvoicesTotal(total);
      } else {
        setApprovedInvoicesTotal(0);
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesSearch =
        !term ||
        (p.transaction_id?.toLowerCase().includes(term)) ||
        (p.petition_title?.toLowerCase().includes(term)) ||
        (p.client_name?.toLowerCase().includes(term)) ||
        (p.writer_name?.toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const completed = rows.filter(r => r.status === 'completed');
    // Pendentes = soma dos valores das notas fiscais aprovadas
    return {
      totalRevenue: completed.reduce((s, r) => s + (r.amount || 0), 0),
      pendingAmount: approvedInvoicesTotal, // Soma das notas fiscais aprovadas
      doneCount: completed.length,
      failedCount: rows.filter(r => r.status === 'failed').length,
    };
  }, [rows, approvedInvoicesTotal]);

  const updateStatus = async (paymentId: string, next: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_payments')
        .update({ status: next })
        .eq('id', paymentId);

      if (error) throw error;

      setRows(prev => prev.map(p => p.id === paymentId ? { ...p, status: next } : p));
      toast.success(`Status atualizado para ${statusConfig[next].label}`);
    } catch (e: any) {
      toast.error(`Erro ao atualizar: ${e.message || e}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* topo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Controle financeiro da plataforma</p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center text-red-600 max-w-xl">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p className="mb-3">Erro ao carregar pagamentos:</p>
            <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">
              {error}
            </pre>
            <Button onClick={load} className="mt-4">Tentar Novamente</Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="pt-6"><div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div></CardContent></Card>

        <Card><CardContent className="pt-6"><div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">
              R$ {stats.pendingAmount.toLocaleString()}
            </p>
          </div>
        </div></CardContent></Card>

        <Card><CardContent className="pt-6"><div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Concluídos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.doneCount}</p>
          </div>
        </div></CardContent></Card>

        <Card><CardContent className="pt-6"><div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Falhas</p>
            <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
          </div>
        </div></CardContent></Card>
      </div>

      {/* Filtros + Tabela */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por transação, cliente, redator ou petição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transação / Petição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Redator</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mr-3" />
                      <span className="text-muted-foreground">Carregando pagamentos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
              filtered.map((p) => {
                const Icon = statusConfig[p.status].icon;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">
                        {p.petition_title || '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {p.transaction_id || '—'}
                      </div>
                    </TableCell>
                    <TableCell>{p.client_name || '—'}</TableCell>
                    <TableCell>{p.writer_name || '—'}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        R$ {Number(p.amount || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[p.status].color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {statusConfig[p.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString('pt-BR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Detalhes */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelected(p)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Pagamento</DialogTitle>
                              <DialogDescription>Informações reais do registro</DialogDescription>
                            </DialogHeader>

                            {selected && selected.id === p.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm font-medium">Transação</div>
                                    <div className="text-sm text-muted-foreground">{selected.transaction_id || '—'}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">Valor</div>
                                    <div className="text-sm text-green-600 font-semibold">R$ {Number(selected.amount || 0).toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">Status</div>
                                    <div className="text-sm text-muted-foreground">{statusConfig[selected.status].label}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">Método</div>
                                    <div className="text-sm text-muted-foreground">{selected.method || '—'}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">Pago em</div>
                                    <div className="text-sm text-muted-foreground">
                                      {selected.payment_date ? new Date(selected.payment_date).toLocaleString('pt-BR') : '—'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">Criado em</div>
                                    <div className="text-sm text-muted-foreground">
                                      {selected.created_at ? new Date(selected.created_at).toLocaleString('pt-BR') : '—'}
                                    </div>
                                  </div>
                                </div>

                                {/* Trocar status */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {(['pending','processing','completed','failed'] as PaymentStatus[]).map(s => (
                                    <Button
                                      key={s}
                                      variant={selected.status === s ? 'default' : 'outline'}
                                      onClick={() => updateStatus(selected.id, s)}
                                    >
                                      {statusConfig[s].label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}