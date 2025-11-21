/* @ts-nocheck */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const addAlert = useCallback((a) => setAlerts(prev => [a, ...prev]), []);
  const dismissAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const getColorForType = (_: string, i = 0) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];
    return colors[i % colors.length];
  };

  const handleAssignPetition = (petitionId: string, method: 'manual' | 'auto') => {
    console.log('Assigning petition:', petitionId, 'Method:', method);
    // TODO: Implement petition assignment logic
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar o cliente Supabase diretamente (como no Reports.tsx)
      const { supabase } = await import('@/lib/supabaseClient');
      
      console.log('📊 Dashboard - Iniciando carregamento de dados...');

      // Buscar de AMBAS as tabelas (como faz a página de Users)
      // user_profiles (tabela principal com Firebase Auth)
      const { data: profilesUserProfiles, error: e1a } = await supabase
        .from('user_profiles')
        .select('*');
      
      // profiles_v2 (tabela legada)
      const { data: profilesV2, error: e1b } = await supabase
        .from('profiles_v2')
        .select('*');
      
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
      
      console.log(`📊 Dashboard - Profiles carregados: ${profilesUserProfiles?.length || 0} de user_profiles + ${profilesV2?.length || 0} de profiles_v2 = ${profiles.length} únicos (duplicatas removidas)`);

      const { data: petitions, error: e2 } = await supabase
        .from('petitions')
        .select('*');
      
      if (e2) {
        console.error('❌ Erro ao carregar petitions:', e2);
        throw e2;
      }
      console.log('📊 Dashboard - Petitions carregados:', petitions?.length || 0);

      const { data: payments, error: e3 } = await supabase
        .from('app_2d8133c678_payments')
        .select('*');
      
      if (e3) {
        console.error('❌ Erro ao carregar payments:', e3);
        throw e3;
      }
      console.log('📊 Dashboard - Payments carregados:', payments?.length || 0);

      // Garantir que temos arrays válidos
      const profilesArray = profiles || [];
      const petitionsArray = petitions || [];
      const paymentsArray = payments || [];

      // Logs detalhados para debug
      console.log('📊 Dashboard - Detalhes dos dados carregados:');
      console.log('  - Total de profiles:', profilesArray.length);
      console.log('  - Profiles com user_type:', profilesArray.filter(p => p.user_type).length);
      console.log('  - Profiles com role:', profilesArray.filter(p => p.role).length);
      console.log('  - Profiles sem user_type nem role:', profilesArray.filter(p => !p.user_type && !p.role).length);
      if (profilesArray.length > 0) {
        console.log('  - Exemplo de profile:', profilesArray[0]);
        const userTypes = profilesArray.map(p => p.user_type || p.role).filter(Boolean);
        console.log('  - Tipos encontrados (user_type ou role):', [...new Set(userTypes)]);
      }
      console.log('  - Total de petitions:', petitionsArray.length);
      console.log('  - Total de payments:', paymentsArray.length);
      if (paymentsArray.length > 0) {
        console.log('  - Exemplo de payment:', paymentsArray[0]);
        const totalAmount = paymentsArray.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        console.log('  - Soma total de amounts:', totalAmount);
      }

      const now = new Date();
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
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente') && isInWindow(p.created_at, winNow);
      }).length;
      const clientsPrev = profilesArray.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente') && isInWindow(p.created_at, winPrev);
      }).length;
      const writersNow = profilesArray.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'writer' || userType === 'redator') && isInWindow(p.created_at, winNow);
      }).length;
      const writersPrev = profilesArray.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
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

      // Calcular métricas - verificar tanto user_type quanto role (excluindo admin)
      const clients = profilesArray.filter(p => {
        // Tentar user_type primeiro, depois role como fallback
        const userType = (p.user_type || p.role || '').toLowerCase();
        // Excluir admin da contagem
        if (userType === 'admin') return false;
        return userType === 'client' || userType === 'cliente';
      });
      const writers = profilesArray.filter(p => {
        // Tentar user_type primeiro, depois role como fallback
        const userType = (p.user_type || p.role || '').toLowerCase();
        // Excluir admin da contagem
        if (userType === 'admin') return false;
        return userType === 'writer' || userType === 'redator';
      });
      
      const totalClients = clients.length;
      const totalWriters = writers.length;
      const totalPetitions = petitionsArray.length;
      const pendingCount = petitionsArray.filter(p => (p.status || '').toLowerCase() === 'pending').length;
      const completedCount = petitionsArray.filter(p => (p.status || '').toLowerCase() === 'completed').length;
      const monthlyRevenue = paymentsArray.reduce((sum, p) => {
        const amount = Number(p.amount || p.value || 0);
        return sum + amount;
      }, 0);
      const completionRate = totalPetitions ? (completedCount / totalPetitions) * 100 : 0;

      console.log('📊 Dashboard - Métricas calculadas:');
      console.log('  - Clientes encontrados:', totalClients);
      console.log('  - Redatores encontrados:', totalWriters);
      console.log('  - Receita mensal calculada:', monthlyRevenue);
      console.log('  - Petições totais:', totalPetitions);
      console.log('  - Breakdown por tabela:');
      console.log(`    - user_profiles: ${profilesUserProfiles?.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente');
      }).length || 0} clientes, ${profilesUserProfiles?.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'writer' || userType === 'redator');
      }).length || 0} redatores`);
      console.log(`    - profiles_v2: ${profilesV2?.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'client' || userType === 'cliente');
      }).length || 0} clientes, ${profilesV2?.filter(p => {
        const userType = (p.user_type || p.role || '').toLowerCase();
        return userType !== 'admin' && (userType === 'writer' || userType === 'redator');
      }).length || 0} redatores`);

      const statsData = {
        totalClients, totalWriters, totalPetitions, monthlyRevenue,
        pendingPetitions: pendingCount, completedPetitions: completedCount,
        averageCompletionTime: totalPetitions ? Math.round((completedCount / totalPetitions) * 3 * 10) / 10 : 0,
        clientSatisfaction: totalPetitions ? Math.round((4.2 + (completionRate / 100) * 0.8) * 10) / 10 : 0,
        completionRate: Math.round(completionRate * 10) / 10,
      };
      
      console.log('📊 Dashboard - Stats calculados:', statsData);
      console.log('📊 Dashboard - Deltas calculados:', deltasData);
      
      setStats(statsData);

      setPendingPetitions(
        petitionsArray
          .filter(p => (p.status || '').toLowerCase() === 'pending')
          .slice(0, 5)
          .map((p, i) => ({
            id: String(p.id),
            title: p.title,
            client_name: p.client_name,
            status: p.status,
            priority: p.priority ?? (i < 2 ? 'URGENT' : 'HIGH'),
            deadline: p.deadline,
            value: Number(p.price || 0),
            created_at: p.created_at,
          }))
      );

      // Agrupar dados reais por mês (últimos 7 meses)
      const monthLabelsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthMap: Record<string, { petitions: number; revenue: number; label: string; date: Date }> = {};
      
      // Primeiro, coletar todos os meses que têm dados
      const allMonths = new Set<string>();
      
      petitionsArray.forEach(p => {
        if (!p.created_at) return;
        const date = new Date(p.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        allMonths.add(key);
      });

      paymentsArray.forEach(p => {
        const dateStr = p.payment_date || p.created_at;
        if (!dateStr) return;
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        allMonths.add(key);
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

      // Agrupar petições por mês
      petitionsArray.forEach(p => {
        if (!p.created_at) return;
        try {
          const date = new Date(p.created_at);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap[key]) {
            monthMap[key].petitions += 1;
          }
        } catch (e) {
          console.warn('Erro ao processar data de petição:', p.created_at, e);
        }
      });

      // Agrupar receita por mês
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
          console.warn('Erro ao processar data de pagamento:', dateStr, e);
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

      console.log('📊 Dashboard - Dados mensais processados:', monthlyDataArray);

      setMonthlyData(monthlyDataArray.length > 0 ? monthlyDataArray : 
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
          return { 
            name: monthLabelsShort[date.getMonth()] || 'N/A', 
            petitions: 0, 
            revenue: 0 
          };
        }));

      const typeCounts = {};
      petitionsArray.forEach(p => {
        const t = p.type || 'Outros';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      const total = petitionsArray.length || 1;
      setPetitionTypeData(
        Object.entries(typeCounts).map(([name, count], idx) => ({
          name,
          value: Math.round((Number(count) / total) * 100),
          color: getColorForType(name, idx),
        }))
      );
    } catch (err) {
      console.error('Erro no Dashboard:', err);
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);
  const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n}%`;

  const handleExportData = useCallback(async () => {
    try {
      const toastId = toast.loading('Exportando dados...');
      
      // Preparar dados para exportação
      const exportData = {
        resumo: {
          clientesAtivos: stats.totalClients,
          redatoresAtivos: stats.totalWriters,
          peticoesAtivas: stats.totalPetitions,
          receitaMensal: stats.monthlyRevenue,
          peticoesPendentes: stats.pendingPetitions,
          peticoesConcluidas: stats.completedPetitions,
          taxaConclusao: `${stats.completionRate}%`,
          tempoMedioConclusao: `${stats.averageCompletionTime} dias`,
          satisfacaoCliente: `${stats.clientSatisfaction}/5.0`,
        },
        variacoes: {
          clientes: `${deltas.clients >= 0 ? '+' : ''}${deltas.clients}%`,
          redatores: `${deltas.writers >= 0 ? '+' : ''}${deltas.writers}%`,
          peticoes: `${deltas.petitions >= 0 ? '+' : ''}${deltas.petitions}%`,
          receita: `${deltas.revenue >= 0 ? '+' : ''}${deltas.revenue}%`,
        },
        dadosMensais: monthlyData,
        tiposPeticoes: petitionTypeData,
        peticoesPendentes: pendingPetitions,
        dataExportacao: new Date().toISOString(),
      };

      // Converter para CSV
      const csvRows = [];
      
      // Cabeçalho
      csvRows.push('Relatório de Dados - Dashboard Veredicta');
      csvRows.push(`Data de Exportação: ${new Date().toLocaleString('pt-BR')}`);
      csvRows.push('');
      
      // Resumo
      csvRows.push('=== RESUMO ===');
      Object.entries(exportData.resumo).forEach(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        csvRows.push(`${label},${value}`);
      });
      csvRows.push('');
      
      // Variações
      csvRows.push('=== VARIAÇÕES (vs mês anterior) ===');
      Object.entries(exportData.variacoes).forEach(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        csvRows.push(`${label},${value}`);
      });
      csvRows.push('');
      
      // Dados Mensais
      if (exportData.dadosMensais.length > 0) {
        csvRows.push('=== EVOLUÇÃO MENSAL ===');
        csvRows.push('Mês,Petições,Receita');
        exportData.dadosMensais.forEach(item => {
          csvRows.push(`${item.name},${item.petitions},${item.revenue}`);
        });
        csvRows.push('');
      }
      
      // Tipos de Petições
      if (exportData.tiposPeticoes.length > 0) {
        csvRows.push('=== DISTRIBUIÇÃO POR TIPO ===');
        csvRows.push('Tipo,Percentual');
        exportData.tiposPeticoes.forEach(item => {
          csvRows.push(`${item.name},${item.value}%`);
        });
        csvRows.push('');
      }
      
      // Petições Pendentes
      if (exportData.peticoesPendentes.length > 0) {
        csvRows.push('=== PETIÇÕES PENDENTES ===');
        csvRows.push('ID,Título,Cliente,Status,Prazo,Valor');
        exportData.peticoesPendentes.forEach(p => {
          csvRows.push(`${p.id},"${p.title || ''}","${p.client_name || ''}",${p.status || ''},"${p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 'N/A'}",${p.value || 0}`);
        });
      }

      // Criar arquivo e fazer download
      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.href = url;
      link.download = `veredicta_dashboard_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!', { id: toastId });
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
      toast.error('Erro ao exportar dados. Tente novamente.');
    }
  }, [stats, deltas, monthlyData, petitionTypeData, pendingPetitions]);

  const handleViewDetailedReport = () => {
    navigate('/admin/relatorios');
  };

  return (
    <div className="space-y-6">
      {/* TOPO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão geral da plataforma Veredicta</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportData}
            disabled={loading}
          >
            Exportar Dados
          </Button>
          <Button 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleViewDetailedReport}
          >
            Relatório Detalhado
          </Button>
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
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent mr-3" />
              <span className="text-muted-foreground">Carregando dados do painel...</span>
            </div>
          </div>
        ) : (
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

      {/* gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-container-secondary border-border">
          <CardHeader>
            <CardTitle>Volume de Petições e Receita</CardTitle>
            <CardDescription>Evolução mensal da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="petitions" name="Petições" fill="#3B82F6" />
                <Line type="monotone" dataKey="revenue" name="Receita" stroke="#10B981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-container-primary border-border">
          <CardHeader>
            <CardTitle>Tipos de Petições</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="bg-container-inner rounded-b-lg">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(petitionTypeData?.length ? petitionTypeData : [{ name: 'Sem dados', value: 100, color: '#94A3B8' }])}
                  dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}
                  label={(e) => `${e.name} : ${e.value}`}
                >
                  {(petitionTypeData?.length ? petitionTypeData : [{ name: 'Sem dados', value: 100, color: '#94A3B8' }]).map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                    <div className="text-sm text-muted-foreground truncate">{p.client_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 's/ prazo'}
                    </Badge>
                    <Button size="sm" onClick={() => handleAssignPetition(p.id, 'manual')}>Atribuir</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* indicadores finais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-50 p-2"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div className="w-full">
                <div className="text-lg font-semibold">Taxa de Conclusão</div>
                <div className="text-sm text-muted-foreground mb-3">Petições finalizadas com sucesso</div>
                <div className="text-3xl font-extrabold">{Math.round(stats.completionRate || 0)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
}