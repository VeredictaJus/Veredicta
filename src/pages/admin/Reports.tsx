/* @ts-nocheck */
import { useEffect, useMemo, useState, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

import {
  TrendingUp, Users, FileText, DollarSign, Calendar, Download,
  AlertTriangle, Eye, CheckCircle2, XCircle, BadgeCheck
} from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { DatabaseService } from '@/services/databaseService';

/* ======================= Tipagens ======================= */

type TimeRange = '30d' | '3m' | '6m' | '1y';

type ProfileRow = {
  id: string | number;
  created_at?: string | null;
  role?: string | null;      // 'client' | 'writer' | 'admin'
};

type PetitionRow = {
  id: string | number;
  created_at?: string | null;
  status?: string | null;
  price?: number | null;
  value?: number | null;     // fallback
  type?: string | null;
  tipo?: string | null;      // fallback
  client_id?: string | null;
  writer_name?: string | null;
  assigned_writer_id?: string | null;
};

type PaymentRow = {
  id: string | number;
  created_at?: string | null;
  payment_date?: string | null;
  amount?: number | null;
  platform_fee?: number | null;
};

type InvoiceStatus = 'submitted' | 'pending' | 'approved' | 'paid' | 'rejected';

type InvoiceRow = {
  id: string | number;
  submitted_by?: string | null;
  client_id?: string | null;
  period_year?: number | null;
  period_month?: number | null;
  amount?: number | null;
  status?: string | null;
  submitted_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  file_path?: string | null;
  notes?: string | null;
  // Campos calculados via JOIN
  writer_name?: string | null;
  writer_email?: string | null;
};

/* ======================= Helpers ======================= */

const monthLabel = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).replace('.', '');

function subFromNow(range: TimeRange) {
  const now = new Date();
  const d = new Date(now);
  if (range === '30d') d.setDate(d.getDate() - 30);
  if (range === '3m')  d.setMonth(d.getMonth() - 3);
  if (range === '6m')  d.setMonth(d.getMonth() - 6);
  if (range === '1y')  d.setFullYear(d.getFullYear() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function keyYM(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(+d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function buildMonthSeries(from: Date, until: Date) {
  const list: { key: string; label: string }[] = [];
  const cursor = new Date(from);
  cursor.setDate(1);
  const end = new Date(until);
  end.setDate(1);

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    const lab = monthLabel(cursor);
    const label = `${lab[0].toUpperCase()}${lab.slice(1)}`;
    list.push({ key, label });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return list;
}

function pctChange(curr: number, prev: number) {
  if (!prev) return null;
  const v = ((curr - prev) / prev) * 100;
  return Math.round(v * 10) / 10;
}

/* ======================= Componente ======================= */

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profiles, setProfiles]   = useState<ProfileRow[]>([]);
  const [petitions, setPetitions] = useState<PetitionRow[]>([]);
  const [payments, setPayments]   = useState<PaymentRow[]>([]);
  const [invoices, setInvoices]   = useState<InvoiceRow[]>([]);
  const [clientNamesMap, setClientNamesMap] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const until = new Date();
      const from  = subFromNow(timeRange);

      // Executar queries em paralelo para melhor performance
      // IMPORTANTE: Buscar de ambas as tabelas para ter dados reais completos
      const [result1a, result1b, result2, result3] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, created_at, role')
          .limit(2000),
        supabase
          .from('profiles_v2')
          .select('id, created_at, role')
          .limit(2000),
        supabase
          .from('petitions')
          .select('id, created_at, status, price, type, writer_name, assigned_writer_id, client_id')
          .gte('created_at', from.toISOString())
          .lte('created_at', until.toISOString())
          .limit(2000),
        supabase
          .from('app_2d8133c678_payments')
          .select('id, created_at, payment_date, amount')
          .gte('created_at', from.toISOString())
          .lte('created_at', until.toISOString())
          .limit(2000)
      ]);

      const { data: p1a, error: e1a } = result1a;
      const { data: p1b, error: e1b } = result1b;
      const { data: p2, error: e2 } = result2;
      const { data: p3, error: e3 } = result3;

      // Combinar perfis de ambas as tabelas (remover duplicatas por id)
      const allProfiles = [
        ...(p1a || []),
        ...(p1b || [])
      ];
      // Remover duplicatas baseado no id
      const uniqueProfiles = allProfiles.filter((profile, index, self) =>
        index === self.findIndex((p) => p.id === profile.id)
      );

      if (e1a && e1b) throw e1a || e1b;
      if (e2) throw e2;
      if (e3) throw e3;

      let inv: InvoiceRow[] = [];
      try {
        console.log('📊 Reports - Buscando notas fiscais...');
        console.log('📅 Período:', { from: from.toISOString(), until: until.toISOString() });
        
        const { data, error } = await supabase
          .from('app_2d8133c678_invoices')
          .select('id, submitted_by, submitted_at, status, period_month, period_year, file_path, created_at, updated_at')
          .gte('submitted_at', from.toISOString())
          .lte('submitted_at', until.toISOString())
          .order('submitted_at', { ascending: false })
          .limit(500);
        
        console.log('✅ Resultado da query de notas:', { data, error });
        
        if (error) throw error;
        
        // Buscar nomes dos redatores separadamente
        const invoicesData = data || [];
        const writerIds = [...new Set(invoicesData.map((i: any) => i.submitted_by).filter(Boolean))];
        
        console.log('📝 IDs de redatores únicos:', writerIds);
        
        let writerMap: Record<string, { full_name: string | null; email: string | null }> = {};
        
        if (writerIds.length > 0) {
          const { data: writersData, error: writersError } = await supabase
            .from('user_profiles')
            .select('firebase_uid, full_name, email')
            .in('firebase_uid', writerIds);
          
          if (!writersError && writersData) {
            writerMap = writersData.reduce((acc: any, w: any) => {
              acc[w.firebase_uid] = { full_name: w.full_name, email: w.email };
              return acc;
            }, {});
          }
          
          console.log('👥 Mapa de redatores:', writerMap);
        }
        
        // Mapear os dados para incluir writer_name e writer_email
        inv = invoicesData.map((item: any) => ({
          ...item,
          writer_name: writerMap[item.submitted_by]?.full_name || null,
          writer_email: writerMap[item.submitted_by]?.email || null
        })) as InvoiceRow[];
        
        console.log('📄 Total de notas encontradas:', inv.length);
        if (inv.length > 0) {
          console.log('📄 Primeira nota:', inv[0]);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar notas fiscais:', err);
        inv = [];
      }

      setProfiles(uniqueProfiles);
      setPetitions(p2 || []);
      setPayments(p3 || []);
      setInvoices(inv);

      // ✅ Buscar nomes dos clientes para Top Clientes
      const clientIds = [...new Set((p2 || []).map(p => p.client_id).filter(Boolean))];
      if (clientIds.length > 0) {
        try {
          const { data: clientProfiles, error: clientError } = await supabase
            .from('user_profiles')
            .select('firebase_uid, full_name, email')
            .in('firebase_uid', clientIds)
            .limit(500);

          if (!clientError && clientProfiles) {
            const namesMap: Record<string, string> = {};
            clientProfiles.forEach(client => {
              if (client.firebase_uid) {
                namesMap[client.firebase_uid] = client.full_name || client.email || client.firebase_uid;
              }
            });
            setClientNamesMap(namesMap);
          }
        } catch (clientErr) {
          console.warn('⚠️ Erro ao buscar nomes dos clientes:', clientErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [timeRange]);

  /* ---------- KPIs ---------- */
  const stats = useMemo(() => {
    const totalRevenue    = payments.reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalPetitions  = petitions.length;
    
    // Separar redatores e clientes
    const totalClients = profiles.filter(p => {
      const role = String(p.role || '').toLowerCase().trim();
      return role === 'client' || role === 'cliente';
    }).length;
    
    const totalWriters = profiles.filter(p => {
      const role = String(p.role || '').toLowerCase().trim();
      return role === 'writer' || role === 'redator';
    }).length;
    
    const totalUsers = profiles.length;

    // Taxa de conclusão: considerar APENAS 'completed' e 'approved' como concluídas
    // IMPORTANTE: 
    // - 'delivered' = entregue, mas ainda aguardando aprovação do cliente (NÃO é concluída)
    // - 'in_progress' = em desenvolvimento (NÃO é concluída)
    // - 'pending', 'review', 'revision', etc. = NÃO são concluídas
    const completedStatuses = ['completed', 'approved'];
    
    // Debug: verificar todos os status das petições
    if (import.meta.env.DEV && petitions.length > 0) {
      const statusCounts: Record<string, number> = {};
      petitions.forEach(p => {
        const status = String(p.status || 'null').toLowerCase().trim();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('[Reports] Status das petições:', statusCounts);
      console.log('[Reports] Total de petições:', petitions.length);
    }
    
    const completed = petitions.filter(p => {
      if (!p.status) return false;
      const status = String(p.status).toLowerCase().trim();
      const isCompleted = completedStatuses.includes(status);
      
      // Debug individual
      if (import.meta.env.DEV && petitions.length <= 5) {
        console.log(`[Reports] Petição ID: ${p.id}, Status original: "${p.status}", Status normalizado: "${status}", Concluída: ${isCompleted}`);
      }
      
      return isCompleted;
    }).length;
    
    const completionRate = totalPetitions > 0 
      ? Math.round((completed / totalPetitions) * 100 * 10) / 10 
      : 0;
    
    // Debug final
    if (import.meta.env.DEV) {
      console.log(`[Reports] Taxa de conclusão calculada: ${completed} concluídas de ${totalPetitions} total = ${completionRate}%`);
    }

    return { totalRevenue, totalPetitions, totalUsers, totalClients, totalWriters, completionRate };
  }, [profiles, petitions, payments]);

  /* ---------- Séries ---------- */
  const { revenueData, userGrowthData, volumeData, mom } = useMemo(() => {
    const until = new Date();
    const from  = subFromNow(timeRange);
    const months = buildMonthSeries(from, until);

    const mapReceita: Record<string, number> = {};
    const mapPet    : Record<string, number> = {};
    const mapCli    : Record<string, number> = {};
    const mapWri    : Record<string, number> = {};

    payments.forEach(pay => {
      const key = keyYM(pay.payment_date || pay.created_at);
      if (!key) return;
      mapReceita[key] = (mapReceita[key] || 0) + Number(pay.amount || 0);
    });

    petitions.forEach(p => {
      const key = keyYM(p.created_at);
      if (!key) return;
      mapPet[key] = (mapPet[key] || 0) + 1;
    });

    profiles.forEach(pr => {
      const key = keyYM(pr.created_at);
      if (!key) return;
      const t = String(pr.role || '').toLowerCase();
      if (t === 'client' || t === 'cliente') mapCli[key] = (mapCli[key] || 0) + 1;
      if (t === 'writer' || t === 'redator') mapWri[key] = (mapWri[key] || 0) + 1;
    });

    const revenueData = months.map(({ key, label }) => ({
      month: label,
      receita: Math.round(mapReceita[key] || 0),
      peticoes: Math.round(mapPet[key] || 0),
    }));

    const userGrowthData = months.map(({ key, label }) => ({
      month: label,
      clientes: mapCli[key] || 0,
      redatores: mapWri[key] || 0,
    }));

    const volumeData = months.map(({ key, label }) => ({
      month: label,
      peticoes: mapPet[key] || 0,
    }));

    const rLen = revenueData.length;
    const pLen = volumeData.length;
    const revenueMoM = rLen >= 2 ? pctChange(revenueData[rLen-1].receita, revenueData[rLen-2].receita) : null;
    const petMoM     = pLen >= 2 ? pctChange(volumeData[pLen-1].peticoes,  volumeData[pLen-2].peticoes)  : null;

    return { revenueData, userGrowthData, volumeData, mom: { revenueMoM, petMoM } };
  }, [profiles, petitions, payments, timeRange]);

  /* ---------- Pizza: tipos de petições ---------- */
  const petitionTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    petitions.forEach(p => {
      const t = (p.type || p.tipo || 'Outros') as string;
      counts[t] = (counts[t] || 0) + 1;
    });
    const total = petitions.length || 1;
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];

    const arr = Object.entries(counts).map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));

    return arr.length ? arr : [{ name: 'Sem dados', value: 100, color: '#94A3B8' }];
  }, [petitions]);

  /* ---------- Tops ---------- */
  const { topWriters, topClients } = useMemo(() => {
    const writersMap: Record<string, { name: string; peticoes: number; receita: number }> = {};
    const clientsMap: Record<string, { name: string; peticoes: number; gasto: number }> = {};

    petitions.forEach(p => {
      const price = Number(p.price ?? 0);
      // Top Writers - usar writer_name se existir
      if (p.writer_name) {
        const k = p.writer_name;
        writersMap[k] = writersMap[k] || { name: k, peticoes: 0, receita: 0 };
        writersMap[k].peticoes += 1;
        writersMap[k].receita  += price;
      }
      // Top Clients - usar client_id como chave e buscar nome do mapa
      if (p.client_id) {
        const k = p.client_id;
        const clientName = clientNamesMap[k] || k; // Usar nome do mapa ou fallback para ID
        clientsMap[k] = clientsMap[k] || { name: clientName, peticoes: 0, gasto: 0 };
        clientsMap[k].peticoes += 1;
        clientsMap[k].gasto    += price;
      }
    });

    const topWriters = Object.values(writersMap).sort((a,b) => b.peticoes - a.peticoes).slice(0, 3);
    const topClients = Object.values(clientsMap).sort((a,b) => b.gasto - a.gasto).slice(0, 3);
    return { topWriters, topClients };
  }, [petitions, clientNamesMap]);

  /* ---------- Ações de Notas Fiscais ---------- */

  async function openInvoice(inv: InvoiceRow) {
    const key = inv.file_path || '';
    if (!key) {
      toast.error('Nota não possui arquivo.');
      return;
    }
    const { data, error } = await supabase
      .storage
      .from('invoices')
      .createSignedUrl(key, 60 * 10);
    if (error || !data?.signedUrl) {
      toast.error('Não foi possível abrir o arquivo.');
      return;
    }
    window.open(data.signedUrl, '_blank');
  }

  async function updateInvoiceStatus(id: InvoiceRow['id'], status: InvoiceStatus) {
    // Buscar o invoice para pegar o submitted_by
    const invoice = invoices.find(i => i.id === id);
    
    const patch: any = { status };
    if (status === 'approved') patch.approved_at = new Date().toISOString();
    if (status === 'paid')     patch.paid_at     = new Date().toISOString();

    const { error } = await supabase
      .from('app_2d8133c678_invoices')
      .update(patch)
      .eq('id', id);

    if (error) {
      toast.error('Falha ao atualizar nota.');
      return;
    }

    setInvoices(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
    
    // Se foi rejeitada, criar notificação para o redator
    if (status === 'rejected' && invoice?.submitted_by) {
      const periodStr = invoice.period_month && invoice.period_year 
        ? `${months[invoice.period_month - 1]}/${invoice.period_year}`
        : 'N/A';
      
      await DatabaseService.createNotification({
        user_id: invoice.submitted_by,
        title: '❌ Nota Fiscal Rejeitada',
        message: `Sua nota fiscal de ${periodStr} foi rejeitada. Por favor, anexe uma nova nota fiscal corrigida. Em caso de dúvidas, entre em contato com o suporte.`,
        type: 'invoice_rejected',
        priority: 'high',
        is_read: false,
        related_entity_type: 'invoice',
        related_entity_id: String(id)
      });
    }
    
    toast.success(
      status === 'approved' ? 'Nota aprovada.' :
      status === 'paid'     ? 'Nota marcada como paga.' :
      status === 'rejected' ? 'Nota rejeitada. Redator notificado.' : 'Status atualizado.'
    );
  }

  const invoiceKpis = useMemo(() => {
    const norm = (s?: string | null) => String(s || '').toLowerCase() as InvoiceStatus | '';
    return {
      total:    invoices.length,
      pending:  invoices.filter(i => ['pending', 'submitted'].includes(norm(i.status))).length,
      approved: invoices.filter(i => norm(i.status) === 'approved').length,
      paid:     invoices.filter(i => norm(i.status) === 'paid').length,
      rejected: invoices.filter(i => norm(i.status) === 'rejected').length,
    };
  }, [invoices]);

  /* ---------- Exportação ---------- */
  const handleExport = useCallback(() => {
    try {
      const toastId = toast.loading('Exportando relatório...');
      
      // Preparar dados para exportação
      const csvRows = [];
      
      // Cabeçalho
      csvRows.push('Relatório Detalhado - Veredicta');
      csvRows.push(`Período: ${timeRange === '30d' ? 'Últimos 30 dias' : timeRange === '3m' ? 'Últimos 3 meses' : timeRange === '6m' ? 'Últimos 6 meses' : 'Último ano'}`);
      csvRows.push(`Data de Exportação: ${new Date().toLocaleString('pt-BR')}`);
      csvRows.push('');
      
      // KPIs
      csvRows.push('=== INDICADORES PRINCIPAIS ===');
      csvRows.push(`Receita Total,R$ ${stats.totalRevenue.toLocaleString()}`);
      csvRows.push(`Petições,${stats.totalPetitions}`);
      csvRows.push(`Usuários,${stats.totalUsers}`);
      csvRows.push(`Clientes,${stats.totalClients}`);
      csvRows.push(`Redatores,${stats.totalWriters}`);
      csvRows.push(`Taxa de Conclusão,${stats.completionRate}%`);
      if (mom.revenueMoM !== null) {
        csvRows.push(`Variação Receita vs Mês Anterior,${mom.revenueMoM > 0 ? '+' : ''}${mom.revenueMoM}%`);
      }
      if (mom.petMoM !== null) {
        csvRows.push(`Variação Petições vs Mês Anterior,${mom.petMoM > 0 ? '+' : ''}${mom.petMoM}%`);
      }
      csvRows.push('');
      
      // Evolução Mensal - Receita
      if (revenueData.length > 0) {
        csvRows.push('=== EVOLUÇÃO MENSAL - RECEITA ===');
        csvRows.push('Mês,Receita,Petições');
        revenueData.forEach(item => {
          csvRows.push(`${item.month},${item.receita},${item.peticoes}`);
        });
        csvRows.push('');
      }
      
      // Crescimento de Usuários
      if (userGrowthData.length > 0) {
        csvRows.push('=== CRESCIMENTO DE USUÁRIOS ===');
        csvRows.push('Mês,Clientes,Redatores');
        userGrowthData.forEach(item => {
          csvRows.push(`${item.month},${item.clientes},${item.redatores}`);
        });
        csvRows.push('');
      }
      
      // Volume de Petições
      if (volumeData.length > 0) {
        csvRows.push('=== VOLUME DE PETIÇÕES ===');
        csvRows.push('Mês,Quantidade');
        volumeData.forEach(item => {
          csvRows.push(`${item.month},${item.peticoes}`);
        });
        csvRows.push('');
      }
      
      // Tipos de Petições
      if (petitionTypeData.length > 0) {
        csvRows.push('=== DISTRIBUIÇÃO POR TIPO DE PETIÇÃO ===');
        csvRows.push('Tipo,Percentual');
        petitionTypeData.forEach(item => {
          csvRows.push(`${item.name},${item.value}%`);
        });
        csvRows.push('');
      }
      
      // Top Redatores
      if (topWriters.length > 0) {
        csvRows.push('=== TOP REDATORES ===');
        csvRows.push('Nome,Petições,Receita');
        topWriters.forEach(w => {
          csvRows.push(`"${w.name}",${w.peticoes},${Math.round(w.receita)}`);
        });
        csvRows.push('');
      }
      
      // Top Clientes
      if (topClients.length > 0) {
        csvRows.push('=== TOP CLIENTES ===');
        csvRows.push('Nome,Petições,Gasto Total');
        topClients.forEach(c => {
          csvRows.push(`"${c.name}",${c.peticoes},${Math.round(c.gasto)}`);
        });
        csvRows.push('');
      }
      
      // Notas Fiscais
      csvRows.push('=== NOTAS FISCAIS ===');
      csvRows.push(`Total,${invoiceKpis.total}`);
      csvRows.push(`Pendentes,${invoiceKpis.pending}`);
      csvRows.push(`Aprovadas,${invoiceKpis.approved}`);
      csvRows.push(`Pagas,${invoiceKpis.paid}`);
      csvRows.push(`Rejeitadas,${invoiceKpis.rejected}`);
      csvRows.push('');
      
      if (invoices.length > 0) {
        csvRows.push('=== DETALHES DAS NOTAS FISCAIS ===');
        csvRows.push('ID,Redator,Período,Valor,Status,Enviada em');
        invoices.forEach(inv => {
          const monthName = inv.period_month ? months[inv.period_month - 1] || inv.period_month : '—';
          const periodStr = inv.period_month && inv.period_year ? `${monthName}/${inv.period_year}` : '—';
          const writerName = inv.writer_name || inv.writer_email || '—';
          const submittedDate = inv.submitted_at ? new Date(inv.submitted_at).toLocaleDateString('pt-BR') : '—';
          csvRows.push(`${inv.id},"${writerName}","${periodStr}",${Number(inv.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })},${inv.status || 'submitted'},"${submittedDate}"`);
        });
      }
      
      // Criar arquivo e fazer download
      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.href = url;
      link.download = `veredicta_relatorio_${timeRange}_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!', { id: toastId });
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      toast.error('Erro ao exportar relatório. Tente novamente.');
    }
  }, [timeRange, stats, mom, revenueData, userGrowthData, volumeData, petitionTypeData, topWriters, topClients, invoiceKpis, invoices]);

  /* ---------- Estados ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center text-red-600 max-w-xl">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p className="mb-3">Erro ao carregar relatórios:</p>
          <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">{error}</pre>
          <Button className="mt-4" onClick={load}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6">
      {/* Filtro + export */}
      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="3m">Últimos 3 meses</SelectItem>
            <SelectItem value="6m">Últimos 6 meses</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString()}</p>
                <p className={`text-xs ${mom.revenueMoM == null ? 'text-muted-foreground' : (mom.revenueMoM >= 0 ? 'text-green-600' : 'text-red-600')}`}>
                  {mom.revenueMoM == null ? '—' : `${mom.revenueMoM > 0 ? '+' : ''}${mom.revenueMoM}% vs mês anterior`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Petições</p>
                <p className="text-2xl font-bold">{stats.totalPetitions}</p>
                <p className={`text-xs ${mom.petMoM == null ? 'text-muted-foreground' : (mom.petMoM >= 0 ? 'text-green-600' : 'text-red-600')}`}>
                  {mom.petMoM == null ? '—' : `${mom.petMoM > 0 ? '+' : ''}${mom.petMoM}% vs mês anterior`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalClients} clientes • {stats.totalWriters} redatores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">com base em status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita - Evolução Mensal</CardTitle>
            <CardDescription>Evolução mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`R$ ${Number(v || 0).toLocaleString()}`, '']} />
                <Bar dataKey="receita" name="Receita" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>Novos cadastros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clientes" stroke="#3B82F6" name="Clientes" />
                <Line type="monotone" dataKey="redatores" stroke="#10B981" name="Redatores" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Redatores</CardTitle>
            <CardDescription>Melhores no período</CardDescription>
          </CardHeader>
          <CardContent>
            {topWriters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <div className="space-y-3">
                {topWriters.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-sm text-muted-foreground">{w.peticoes} petições</p>
                    </div>
                    <p className="font-semibold text-green-600 dark:text-green-400">R$ {Math.round(w.receita).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
            <CardDescription>Maiores volumes</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <div className="space-y-3">
                {topClients.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.peticoes} petições</p>
                    </div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">R$ {Math.round(c.gasto).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notas fiscais */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Notas Fiscais</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Pendentes</div><div className="text-2xl font-bold">{invoiceKpis.pending}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Aprovadas</div><div className="text-2xl font-bold">{invoiceKpis.approved}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Pagas</div><div className="text-2xl font-bold">{invoiceKpis.paid}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Rejeitadas</div><div className="text-2xl font-bold">{invoiceKpis.rejected}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas fiscais</CardTitle>
            <CardDescription>Recebidas no período</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma nota fiscal no período selecionado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Redator</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enviada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => {
                      const st = String(inv.status || 'submitted').toLowerCase() as InvoiceStatus;
                      const monthName = inv.period_month ? months[inv.period_month - 1] || inv.period_month : '—';
                      const periodStr = inv.period_month && inv.period_year ? `${monthName}/${inv.period_year}` : '—';
                      return (
                        <TableRow key={String(inv.id)}>
                          <TableCell>{inv.writer_name || inv.writer_email || '—'}</TableCell>
                          <TableCell>{periodStr}</TableCell>
                          <TableCell>R$ {Number(inv.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="capitalize">{st}</TableCell>
                          <TableCell>
                            {inv.submitted_at ? new Date(inv.submitted_at).toLocaleDateString('pt-BR') : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openInvoice(inv)}>
                                <Eye className="h-4 w-4" />
                              </Button>

                              {(st === 'pending' || st === 'submitted') && (
                                <>
                                  <Button variant="outline" size="sm" onClick={() => updateInvoiceStatus(inv.id, 'approved')}>
                                    <BadgeCheck className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => updateInvoiceStatus(inv.id, 'rejected')}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {st === 'approved' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}