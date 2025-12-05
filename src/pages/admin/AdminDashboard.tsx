/* @ts-nocheck */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Users, FileText, DollarSign, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, PieChart, Pie, Cell, ComposedChart,
} from 'recharts';
import { supabase } from '@/lib/supabaseClient'
import { AlertBanner } from '@/components/analytics/AlertBanner';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { toast } from 'sonner';
import { WriterService, Writer } from '@/services/writerService';
import { DatabaseService } from '@/services/databaseService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };
  const [stats, setStats] = useState({
    totalClients: 0, totalWriters: 0, totalPetitions: 0, monthlyRevenue: 0,
    pendingPetitions: 0, completedPetitions: 0, averageCompletionTime: 0,
    clientSatisfaction: 0, completionRate: 0,
  });
  const [pendingPetitions, setPendingPetitions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [petitionTypeData, setPetitionTypeData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [deltas, setDeltas] = useState({ clients: 0, writers: 0, petitions: 0, revenue: 0 });
  // Estados para diálogo de atribuição
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState<string | null>(null);
  const [availableWriters, setAvailableWriters] = useState<Writer[]>([]);
  const [selectedWriterId, setSelectedWriterId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const addAlert = useCallback((a) => setAlerts(prev => [a, ...prev]), []);
  const dismissAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);

  const getColorForType = useCallback((_: string, i: number = 0) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];
    return colors[i % colors.length];
  }, []);

  const handleAssignPetition = async (petitionId: string) => {
    try {
      setSelectedPetitionId(petitionId);
      setSelectedWriterId('');
      
      // Buscar redatores disponíveis
      const writers = await WriterService.getActiveWriters();
      setAvailableWriters(writers);
      
      if (writers.length === 0) {
        toast.error('Nenhum redator disponível no momento');
        return;
      }
      
      setShowAssignDialog(true);
    } catch (error: any) {
      console.error('Erro ao abrir diálogo de atribuição:', error);
      toast.error(`Erro ao carregar redatores: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedPetitionId || !selectedWriterId) {
      toast.error('Selecione um redator para atribuir a petição');
      return;
    }

    setAssigning(true);
    try {
      // Buscar informações do redator selecionado
      const selectedWriter = availableWriters.find(w => w.firebase_uid === selectedWriterId);
      if (!selectedWriter) {
        throw new Error('Redator não encontrado');
      }

      // Atribuir petição usando o DatabaseService (que já faz tudo necessário)
      const success = await DatabaseService.acceptPetition(selectedPetitionId, selectedWriterId);

      if (success) {
        toast.success(`Petição atribuída a ${selectedWriter.full_name || selectedWriter.email}`);
        setShowAssignDialog(false);
        setSelectedPetitionId(null);
        setSelectedWriterId('');
        
        // Recarregar dados após um pequeno delay
        setTimeout(() => {
          loadDashboardData();
        }, 500);
      } else {
        throw new Error('Falha ao atribuir petição');
      }
    } catch (error: any) {
      console.error('Erro ao atribuir petição:', error);
      toast.error(`Erro ao atribuir petição: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setAssigning(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar o cliente Supabase diretamente (como no Reports.tsx)
      const { supabase } = await import('@/lib/supabaseClient');
      
      if (import.meta.env.DEV) {
      console.log('📊 Dashboard - Iniciando carregamento de dados...');
      }

      // Buscar de AMBAS as tabelas em paralelo (otimização)
      const [result1a, result1b] = await Promise.all([
        supabase
        .from('user_profiles')
          .select('id, firebase_uid, email, full_name, role, created_at, updated_at')
          .limit(2000),
        supabase
          .from('profiles_v2')
          .select('id, firebase_uid, email, full_name, role, created_at, updated_at')
          .limit(2000)
      ]);

      const { data: profilesUserProfiles, error: e1a } = result1a;
      const { data: profilesV2, error: e1b } = result1b;
      
      // Combinar resultados de ambas as tabelas, removendo duplicatas
      // Priorizar user_profiles sobre profiles_v2 em caso de duplicata
      const profilesMap = new Map();
      
      // Primeiro adicionar profiles_v2 (legado)
      (profilesV2 || []).forEach(p => {
        const key = p.firebase_uid || p.email || p.id;
        if (key) profilesMap.set(key, p);
      });
      
      // Depois adicionar user_profiles (sobrescreve duplicatas)
      (profilesUserProfiles || []).forEach(p => {
        const key = p.firebase_uid || p.email || p.id;
        if (key) profilesMap.set(key, p);
      });
      
      const profiles = Array.from(profilesMap.values());
      
      if ((e1a && e1b) && profiles.length === 0) {
        console.error('❌ Erro ao carregar profiles:', e1a || e1b);
        throw e1a || e1b;
      }
      
      if (import.meta.env.DEV) {
        console.log(`📊 Dashboard - Profiles carregados: ${profilesUserProfiles?.length || 0} de user_profiles + ${profilesV2?.length || 0} de profiles_v2 = ${profiles.length} únicos`);
      }

      // 🚀 OTIMIZAÇÃO: Filtrar apenas últimos 3 meses para reduzir dados carregados
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      threeMonthsAgo.setHours(0, 0, 0, 0);

      // Buscar petitions, payments e invoices aprovadas em paralelo (otimização com filtro de data)
      const [result2, result3, result4] = await Promise.all([
        supabase
        .from('petitions')
          .select('id, status, assigned_writer_id, client_id, title, priority, deadline, type, price, created_at, updated_at')
          .gte('created_at', threeMonthsAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('app_2d8133c678_payments')
          .select('id, writer_id, client_id, amount, status, payment_date, created_at, updated_at')
          .gte('created_at', threeMonthsAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('app_2d8133c678_invoices')
          .select('id, amount, status, submitted_at, period_month, period_year')
          .eq('status', 'approved')
          .limit(1000)
      ]);

      const { data: petitions, error: e2 } = result2;
      const { data: payments, error: e3 } = result3;
      const { data: approvedInvoices, error: e4 } = result4;
      
      if (e2) {
        console.error('❌ Erro ao carregar petitions:', e2);
        throw e2;
      }
      
      if (e3) {
        console.error('❌ Erro ao carregar payments:', e3);
        throw e3;
      }

      // Garantir que temos arrays válidos
      const profilesArray = profiles || [];
      const petitionsArray = petitions || [];
      const paymentsArray = payments || [];
      const monthWindow = (date) => ({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      });

      const isInWindow = (iso, win) => {
        if (!iso) return false;
        const t = new Date(iso).getTime();
        return t >= win.start.getTime() && t < win.end.getTime();
      };

      const winNow = monthWindow(now);
      const winPrev = monthWindow(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100));

      const clientsNow = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente') && isInWindow(p.created_at, winNow);
      }).length;
      const clientsPrev = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente') && isInWindow(p.created_at, winPrev);
      }).length;
      const writersNow = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'writer' || userType === 'redator') && isInWindow(p.created_at, winNow);
      }).length;
      const writersPrev = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'writer' || userType === 'redator') && isInWindow(p.created_at, winPrev);
      }).length;
      const petitionsNow = petitionsArray.filter(p => isInWindow(p.created_at, winNow)).length;
      const petitionsPrev = petitionsArray.filter(p => isInWindow(p.created_at, winPrev)).length;
      const revenueNow = paymentsArray.filter(p => isInWindow(p.payment_date || p.created_at, winNow)).reduce((s, p) => s + Number(p.amount || 0), 0);
      const revenuePrev = paymentsArray.filter(p => isInWindow(p.payment_date || p.created_at, winPrev)).reduce((s, p) => s + Number(p.amount || 0), 0);

      const deltasData = {
        clients: pctChange(clientsNow, clientsPrev),
        writers: pctChange(writersNow, writersPrev),
        petitions: pctChange(petitionsNow, petitionsPrev),
        revenue: pctChange(revenueNow, revenuePrev),
      };

      setDeltas(deltasData);

      // Calcular métricas - usar role (excluindo admin)
      const clients = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        // Excluir admin da contagem
        if (userType === 'admin') return false;
        return userType === 'client' || userType === 'cliente';
      });
      const writers = profilesArray.filter(p => {
        const userType = (p.role || '').toLowerCase();
        // Excluir admin da contagem
        if (userType === 'admin') return false;
        return userType === 'writer' || userType === 'redator';
      });
      
      const totalClients = clients.length;
      const totalWriters = writers.length;
      const totalPetitions = petitionsArray.length;
      // Petições pendentes: status 'pending' ou 'available' E sem redator atribuído
      const pendingCount = petitionsArray.filter(p => {
        const status = (p.status || '').toLowerCase();
        const hasNoWriter = !p.assigned_writer_id;
        return (status === 'pending' || status === 'available') && hasNoWriter;
      }).length;
      const completedCount = petitionsArray.filter(p => (p.status || '').toLowerCase() === 'completed').length;
      
      // 🚀 CALCULAR RECEITA MENSAL: Total recebido no mês - Total a pagar aos redatores (notas fiscais aprovadas)
      // winNow já foi declarado acima (linha 222), não precisa redeclarar
      // Total recebido no mês (pagamentos de clientes no mês atual)
      const totalReceivedThisMonth = paymentsArray
        .filter(p => {
          // Filtrar apenas pagamentos do mês atual
          const paymentDate = p.payment_date || p.created_at;
          return isInWindow(paymentDate, winNow);
        })
        .reduce((sum, p) => {
          const amount = Number(p.amount || 0);
          return sum + amount;
        }, 0);
      
      // Total a pagar aos redatores no mês (soma dos valores das notas fiscais aprovadas do mês)
      // Filtrar notas fiscais aprovadas do mês atual (usar period_month e period_year)
      const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11, então +1
      const currentYear = now.getFullYear();
      
      const totalToPayWriters = (approvedInvoices || [])
        .filter(inv => {
          // Filtrar notas do mês atual usando period_month e period_year
          return inv.period_month === currentMonth && inv.period_year === currentYear;
        })
        .reduce((sum, inv) => {
          const amount = Number(inv.amount || 0);
          return sum + amount;
        }, 0);
      
      // Receita mensal = Recebido no mês - Total a pagar aos redatores (notas aprovadas do mês)
      const monthlyRevenue = totalReceivedThisMonth - totalToPayWriters;
      
      const completionRate = totalPetitions ? (completedCount / totalPetitions) * 100 : 0;

      // 🚀 CALCULAR TEMPO MÉDIO DE ENTREGA (baseado em dados reais)
      // Incluir petições entregues: 'completed', 'approved' e 'delivered'
      const deliveredStatuses = ['completed', 'approved', 'delivered'];
      const deliveredPetitionsWithTimes = petitionsArray.filter(p => {
        const status = (p.status || '').toLowerCase();
        return deliveredStatuses.includes(status) && p.created_at;
      });

      let averageCompletionTime = 0;
      if (deliveredPetitionsWithTimes.length > 0) {
        const deliveredPetitionIds = deliveredPetitionsWithTimes.map(p => p.id);
        
        // Buscar data de entrega do primeiro arquivo de cada petição completada
        let deliveryDates = new Map<string, Date>();
        
        if (deliveredPetitionIds.length > 0) {
          const { data: deliveredFiles, error: filesError } = await supabase
            .from('petition_files')
            .select('petition_id, created_at')
            .in('petition_id', deliveredPetitionIds)
            .order('created_at', { ascending: true });

          if (filesError && import.meta.env.DEV) {
            console.warn('⚠️ Erro ao buscar arquivos entregues:', filesError);
          }

          // Criar mapa de petição -> data de entrega (primeiro arquivo)
          if (deliveredFiles && deliveredFiles.length > 0) {
            deliveredFiles.forEach(file => {
              if (file.petition_id && file.created_at && !deliveryDates.has(file.petition_id)) {
                deliveryDates.set(file.petition_id, new Date(file.created_at));
              }
            });
          }
        }

        // Calcular tempo médio usando data de entrega real ou fallback para updated_at
        const validTimes: number[] = [];
        
        deliveredPetitionsWithTimes.forEach(p => {
          try {
            const start = new Date(p.created_at);
            if (isNaN(start.getTime())) return; // Data inválida
            
            // Usar data de entrega do arquivo se disponível, senão usar updated_at como fallback
            const deliveryDate = deliveryDates.get(p.id);
            const end = deliveryDate || (p.updated_at ? new Date(p.updated_at) : null);
            
            if (!end || isNaN(end.getTime())) return; // Data inválida
            
            const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            
            // Validar que o tempo é positivo e razoável (não mais que 1 ano)
            if (daysDiff >= 0 && daysDiff <= 365) {
              validTimes.push(daysDiff);
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.warn('⚠️ Erro ao calcular tempo para petição:', p.id, e);
            }
          }
        });

        if (validTimes.length > 0) {
          const totalDays = validTimes.reduce((acc, days) => acc + days, 0);
          averageCompletionTime = Math.round((totalDays / validTimes.length) * 10) / 10;
        } else if (import.meta.env.DEV) {
          console.warn('⚠️ Nenhum tempo válido calculado para petições completadas');
        }
      }

      // 🚀 CALCULAR SATISFAÇÃO (baseado em avaliações reais)
      const { data: ratings, error: ratingsError } = await supabase
        .from('app_2d8133c678_writer_ratings')
        .select('rating')
        .limit(5000); // Limitar para evitar carregar todas as avaliações

      let clientSatisfaction = 0;
      if (ratingsError) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Erro ao buscar avaliações:', ratingsError);
        }
      } else if (ratings && ratings.length > 0) {
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
        clientSatisfaction = Math.round((sumRatings / totalRatings) * 10) / 10;
      }

      const statsData = {
        totalClients, totalWriters, totalPetitions, monthlyRevenue,
        pendingPetitions: pendingCount, completedPetitions: completedCount,
        averageCompletionTime,
        clientSatisfaction,
        completionRate: Math.round(completionRate * 10) / 10,
      };
      
      setStats(statsData);

      setPendingPetitions(
        petitionsArray
          .filter(p => {
            const status = (p.status || '').toLowerCase();
            const hasNoWriter = !p.assigned_writer_id;
            // Incluir petições com status 'pending' ou 'available' que não têm redator atribuído
            return (status === 'pending' || status === 'available') && hasNoWriter;
          })
          .slice(0, 5)
          .map((p, i) => ({
            id: String(p.id),
            title: p.title,
            client_name: null,
            status: p.status,
            priority: p.priority ?? (i < 2 ? 'URGENT' : 'HIGH'),
            deadline: p.deadline,
            value: Number(p.price || 0),
            created_at: p.created_at,
          }))
      );

      // 🚀 OTIMIZAÇÃO: Consolidar loops de processamento de dados
      // Ao invés de 5 loops separados, fazer 2 loops consolidados
      const monthLabelsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthMap: Record<string, { petitions: number; revenue: number; label: string; date: Date }> = {};
      const allMonths = new Set<string>();
      const typeCounts: Record<string, number> = {};
      
      // LOOP 1: Processar petitions + coletar meses + contar tipos (tudo de uma vez)
      petitionsArray.forEach(p => {
        // Contar tipos
        const t = p.type || 'Outros';
        typeCounts[t] = (typeCounts[t] || 0) + 1;

        // Coletar meses das petições
        if (p.created_at) {
          try {
        const date = new Date(p.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        allMonths.add(key);
          } catch (e) {
            // Ignorar erros de data
          }
        }
      });

      // LOOP 2: Processar payments + coletar meses (tudo de uma vez)
      paymentsArray.forEach(p => {
        const dateStr = p.payment_date || p.created_at;
        if (dateStr) {
          try {
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        allMonths.add(key);
          } catch (e) {
            // Ignorar erros de data
          }
        }
      });

      // Inicializar meses com dados + últimos 7 meses
      const monthsToShow = new Set(allMonths);
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsToShow.add(key);
      }

      // Inicializar todos os meses com 0
      Array.from(monthsToShow).forEach(key => {
        const [year, month] = key.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        const monthIndex = date.getMonth();
        monthMap[key] = { 
          petitions: 0, 
          revenue: 0,
          label: monthLabelsShort[monthIndex] || key,
          date: date
        };
      });

      // LOOP 3: Agrupar petições por mês (consolidado com loop anterior poderia ser feito, mas separamos para clareza)
      petitionsArray.forEach(p => {
        if (!p.created_at) return;
        try {
          const date = new Date(p.created_at);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap[key]) {
            monthMap[key].petitions += 1;
          }
        } catch (e) {
          // Ignorar erros
        }
      });

      // LOOP 4: Agrupar receita por mês
      paymentsArray.forEach(p => {
        const dateStr = p.payment_date || p.created_at;
        if (!dateStr) return;
        try {
          const date = new Date(dateStr);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap[key]) {
            monthMap[key].revenue += Number(p.amount || 0);
          }
        } catch (e) {
          // Ignorar erros
        }
      });

      // Converter para array no formato esperado, ordenado por data
      const monthlyDataArray = Object.keys(monthMap)
        .sort((a, b) => {
          const dateA = monthMap[a].date.getTime();
          const dateB = monthMap[b].date.getTime();
          return dateA - dateB;
        })
        .slice(-7) // Últimos 7 meses
        .map((key) => ({
          name: monthMap[key].label,
          petitions: monthMap[key].petitions,
          revenue: Math.round(monthMap[key].revenue),
        }));

      setMonthlyData(monthlyDataArray.length > 0 ? monthlyDataArray : 
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
          return { 
            name: monthLabelsShort[date.getMonth()] || 'N/A', 
            petitions: 0, 
            revenue: 0 
          };
        }));

      // Processar tipos de petições
      const total = petitionsArray.length || 1;
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];
      setPetitionTypeData(
        Object.entries(typeCounts).map(([name, count], idx) => ({
          name,
          value: Math.round((Number(count) / total) * 100),
          color: colors[idx % colors.length],
        }))
      );
    } catch (err) {
      console.error('Erro no Dashboard:', err);
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadDashboardData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n}%`;


  return (
    <div className="space-y-6">
      {/* TOPO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão geral da plataforma Veredicta</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center justify-center h-40">
          <div className="text-center text-red-600 max-w-xl">
            <h2 className="font-semibold mb-2">Falha ao carregar o painel</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Tentar novamente</Button>
          </div>
        </div>
      )}

      {!error && (
        <>
          {/* alertas em tempo real */}
          <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!loading && (
          <>
            {/* Clientes */}
            <Card className="bg-container-primary border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
                  <div className="rounded-full bg-muted p-2"><Users className="h-4 w-4 text-muted-foreground" /></div>
                </div>
              </CardHeader>
              <CardContent className="bg-container-inner rounded-b-lg pt-0">
                <div className="text-3xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground mt-1">{fmtPct(deltas.clients)} desde o mês passado</p>
              </CardContent>
            </Card>

        {/* Redatores */}
        <Card className="bg-container-secondary border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Redatores Ativos</CardTitle>
              <div className="rounded-full bg-muted p-2"><Users className="h-4 w-4 text-muted-foreground" /></div>
            </div>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg pt-0">
            <div className="text-3xl font-bold">{stats.totalWriters}</div>
            <p className="text-xs text-muted-foreground mt-1">{fmtPct(deltas.writers)} desde o mês passado</p>
          </CardContent>
        </Card>

        {/* Petições */}
        <Card className="bg-container-primary border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Petições Ativas</CardTitle>
              <div className="rounded-full bg-muted p-2"><FileText className="h-4 w-4 text-muted-foreground" /></div>
            </div>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg pt-0">
            <div className="text-3xl font-bold">{stats.totalPetitions}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingPetitions} pendentes</p>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card className="bg-container-secondary border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
              <div className="rounded-full bg-muted p-2"><DollarSign className="h-4 w-4 text-muted-foreground" /></div>
            </div>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg pt-0">
            <div className="text-3xl font-bold">R$ {Number(stats.monthlyRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{fmtPct(deltas.revenue)} desde o mês passado</p>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* gráficos - renderização condicional para melhor performance */}
      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-container-secondary border-border">
          <CardHeader>
            <CardTitle>Volume de Petições e Receita</CardTitle>
            <CardDescription>Evolução mensal da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg">
              {monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="petitions" name="Petições" fill="#3B82F6" />
                <Line type="monotone" dataKey="revenue" name="Receita" stroke="#10B981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="bg-container-primary border-border">
          <CardHeader>
            <CardTitle>Tipos de Petições</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg">
              {petitionTypeData && petitionTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={petitionTypeData}
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={2}
                  label={(entry: any) => {
                    if (!entry || typeof entry !== 'object') return '';
                    return `${entry.name || ''} : ${entry.value || 0}%`;
                  }}
                >
                  {petitionTypeData.map((d, i) => (
                    <Cell key={`cell-${i}`} fill={d.color || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* petições pendentes */}
      <Card className="shadow-sm border mt-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Petições Pendentes de Atribuição</CardTitle>
            </div>
            <span className="text-xs rounded-full px-2 py-1 bg-muted text-muted-foreground">
              {stats.pendingPetitions} pendentes
            </span>
          </div>
          <CardDescription>Petições aguardando designação de redator</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingPetitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
              <p className="text-muted-foreground">Todas as petições foram atribuídas!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingPetitions.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">#{p.id} — {p.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{p.client_id || 'N/A'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 's/ prazo'}
                    </Badge>
                    <Button size="sm" onClick={() => handleAssignPetition(p.id)}>Atribuir</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* indicadores finais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div className="w-full">
                <div className="text-lg font-semibold">Tempo Médio</div>
                <div className="text-sm text-muted-foreground mb-3">Conclusão de petições</div>
                <div className="text-3xl font-extrabold">{Number(stats.averageCompletionTime || 0)} dias</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-50 p-2"><Users className="h-5 w-5 text-purple-600" /></div>
              <div className="w-full">
                <div className="text-lg font-semibold">Satisfação</div>
                <div className="text-sm text-muted-foreground mb-3">Avaliação dos clientes</div>
                <div className="text-3xl font-extrabold">{(stats.clientSatisfaction || 0).toFixed(1)}/5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* Diálogo para atribuir petição */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Petição</DialogTitle>
            <DialogDescription>
              Selecione um redator para atribuir esta petição
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedWriterId} onValueChange={setSelectedWriterId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um redator" />
              </SelectTrigger>
              <SelectContent>
                {availableWriters.map((writer) => {
                  const writerName = truncateLongName(writer.full_name) || writer.email;
                  return (
                    <SelectItem key={writer.firebase_uid} value={writer.firebase_uid} title={writer.full_name || writer.email}>
                      {writerName} {writer.email && `(${writer.email})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={assigning}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmAssign} disabled={!selectedWriterId || assigning}>
              {assigning ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}