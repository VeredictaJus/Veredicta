/* @ts-nocheck */
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Wallet,
  Filter
} from 'lucide-react';
import { DatabaseService, Payment as DatabasePayment } from '../../services/databaseService';
import { useNewAuth } from '../../contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import InvoiceUpload from '@/components/Writer/InvoiceUpload';

// -------------------- Tipos --------------------
interface Payment extends DatabasePayment {
  petition_title?: string;
  client_name?: string;
}

interface PaymentStats {
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  monthlyAverage: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercentage: number;
}

interface ChartData {
  month: string;
  earnings: number;
  petitions: number;
}


// -------------------- Componente --------------------
const Payments: React.FC = () => {
  const { user } = useNewAuth();
  const [searchParams] = useSearchParams();
  const invoiceSectionRef = useRef<HTMLDivElement>(null);
  
  console.log('🟢 Payments.tsx - Componente montado');
  console.log('👤 User completo:', user);
  console.log('🔑 User UID:', user?.uid);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
    monthlyAverage: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    growthPercentage: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  useEffect(() => {
    console.log('🔄 useEffect executado - user?.uid:', user?.uid);
    if (user?.uid) {
      console.log('✅ user?.uid existe, chamando fetchPayments');
      fetchPayments();
    } else {
      console.warn('⚠️ user?.uid está undefined ou null');
      setLoading(false); // Sair do loading se não tiver user
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter, periodFilter]);

  // ========= Processar query params da URL (notificações) =========
  useEffect(() => {
    if (loading) return;

    const tab = searchParams.get('tab');
    
    // Se há tab=invoices, scrollar até a seção de notas fiscais
    if (tab === 'invoices' && invoiceSectionRef.current) {
      setTimeout(() => {
        invoiceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300); // Pequeno delay para garantir que o componente está renderizado
      
      // Limpar query params após processar
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      window.history.replaceState({}, '', `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`);
    }
  }, [loading, searchParams]);

  // --------- Pagamentos ---------
  const fetchPayments = async () => {
    if (!user?.uid) {
      console.error('❌ Payments.tsx - user?.uid é undefined');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Buscando pagamentos mensais para writer:', user.uid);
      
      // 🚀 BUSCAR PAGAMENTOS MENSAIS (consolidados)
      const monthlyPaymentsData = await DatabaseService.getWriterMonthlyPayments(user.uid);
      console.log('✅ Pagamentos mensais recebidos:', monthlyPaymentsData.length, 'registros');

      // 🚀 TAMBÉM BUSCAR SALDO ATUAL DE writer_balance (para mostrar ganhos pendentes)
      console.log('🔍 Buscando saldo para writer_id:', user.uid);
      console.log('🔍 Tipo de user.uid:', typeof user.uid);
      
      // 🧪 TESTE 1: Buscar TODOS os registros (sem filtro)
      const allBalancesResponse = await supabase
        .from('writer_balance')
        .select('*');
      
      console.log('🧪 TESTE - Todos os saldos (sem filtro):', allBalancesResponse.data);
      console.log('   - Total de registros encontrados:', allBalancesResponse.data?.length || 0);
      
      // 🧪 TESTE 2: Buscar com filtro
      const balanceResponse = await supabase
        .from('writer_balance')
        .select('total_earned, available_balance, penalties_total')
        .eq('writer_id', user.uid)
        .maybeSingle();
      
      console.log('🔍 Resposta COMPLETA do Supabase:', balanceResponse);
      console.log('   - data:', balanceResponse.data);
      console.log('   - error:', balanceResponse.error);
      console.log('   - status:', balanceResponse.status);
      console.log('   - statusText:', balanceResponse.statusText);
      
      const { data: balanceData, error: balanceError } = balanceResponse;
      
      if (balanceError) {
        console.error('❌ Erro ao buscar saldo:', balanceError);
        console.error('   - message:', balanceError.message);
        console.error('   - details:', balanceError.details);
        console.error('   - hint:', balanceError.hint);
        console.error('   - code:', balanceError.code);
      }
      
      console.log('💰 Saldo do writer:', balanceData);
      console.log('   - total_earned:', balanceData?.total_earned);
      console.log('   - available_balance:', balanceData?.available_balance);

      // 🚀 BUSCAR PETIÇÕES APROVADAS PARA CALCULAR "ESTE MÊS"
      const { data: approvedPetitions } = await supabase
        .from('petitions')
        .select('id, price, updated_at')
        .eq('assigned_writer_id', user.uid)
        .eq('status', 'approved');
      
      console.log('📋 Petições aprovadas:', approvedPetitions?.length || 0);

      // Converter MonthlyPayment para Payment compatível com a UI
      const formattedPayments = monthlyPaymentsData.map(payment => ({
        id: payment.id,
        petition_id: null,
        writer_id: payment.writer_id,
        client_id: 'consolidado',
        amount: payment.total_amount,
        status: payment.status as "pending" | "paid" | "cancelled" | "processing", // Forçar tipo compatível
        payment_date: payment.paid_date || payment.scheduled_date,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        petition_title: `Consolidado ${payment.reference_month.toString().padStart(2, '0')}/${payment.reference_year} (${payment.petitions_count} ${payment.petitions_count === 1 ? 'petição' : 'petições'})`,
        client_name: 'Pagamento Mensal',
        payment_method: 'Transferência Bancária',
        reference: `${payment.reference_month}/${payment.reference_year}`
      })) as Payment[];

      setPayments(formattedPayments);
      calculateStats(formattedPayments, balanceData, approvedPetitions);
      generateChartData(formattedPayments, approvedPetitions);
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      console.error('❌ Detalhes do erro:', error?.message || error);
      // Mesmo com erro, sair do loading para mostrar a página vazia
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    paymentsData: Payment[], 
    balanceData?: { total_earned: number; available_balance: number; penalties_total: number } | null,
    approvedPetitions?: Array<{ id: string; price: number | null; updated_at: string }> | null
  ) => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const completedPayments = paymentsData.filter(p => p.status === 'paid');
    const pendingPayments = paymentsData.filter(p => p.status === 'pending' || p.status === 'processing');

    // 💰 USAR SALDO DE writer_balance se disponível (mais preciso e em tempo real)
    const totalEarnings = balanceData?.total_earned || completedPayments.reduce((acc, p) => acc + p.amount, 0);
    const availableBalance = balanceData?.available_balance || 0;
    
    // 💰 CALCULAR "ESTE MÊS" A PARTIR DAS PETIÇÕES APROVADAS DESTE MÊS
    const thisMonthApprovedPetitions = approvedPetitions?.filter(p => {
      const approvedDate = new Date(p.updated_at);
      return approvedDate >= thisMonthStart;
    }) || [];
    
    const thisMonthEarnings = thisMonthApprovedPetitions.reduce((acc, p) => {
      return acc + (p.price || 60.00);
    }, 0);

    const lastMonthEarnings = completedPayments
      .filter(p => {
        if (!p.payment_date) return false;
        const paymentDate = new Date(p.payment_date);
        return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd;
      })
      .reduce((acc, p) => acc + p.amount, 0);

    // 💰 CALCULAR MÉDIA MENSAL baseado no total_earned dividido por meses ativos
    // Se houver petições aprovadas, calcular quantos meses diferentes elas representam
    const monthsWithEarnings = approvedPetitions && approvedPetitions.length > 0
      ? new Set(approvedPetitions.map(p => {
          const date = new Date(p.updated_at);
          return `${date.getFullYear()}-${date.getMonth()}`;
        })).size
      : (completedPayments.length > 0 ? getMonthsWithEarnings(completedPayments) : 1);
    
    const monthlyAverage = monthsWithEarnings > 0 ? totalEarnings / monthsWithEarnings : totalEarnings;

    const growthPercentage = lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0 ? 100 : 0;

    console.log('📊 Stats calculadas:', {
      totalEarnings,
      availableBalance,
      thisMonthEarnings,
      monthlyAverage,
      fromBalance: !!balanceData,
      fromPetitions: !!approvedPetitions
    });

    setStats({
      totalEarnings,
      pendingPayments: availableBalance, // Saldo disponível = pendente de saque
      completedPayments: completedPayments.length,
      monthlyAverage,
      thisMonthEarnings,
      lastMonthEarnings,
      growthPercentage
    });
  };

  const getMonthsWithEarnings = (completedPayments: Payment[]) => {
    if (completedPayments.length === 0) return 0;
    const paymentDates = completedPayments
      .filter(p => p.payment_date)
      .map(p => new Date(p.payment_date!));
    if (paymentDates.length === 0) return 1;
    const firstPaymentDate = new Date(Math.min(...paymentDates.map(d => d.getTime())));
    const monthsDiff = Math.ceil((new Date().getTime() - firstPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, monthsDiff);
  };

  const generateChartData = (
    paymentsData: Payment[], 
    approvedPetitions?: Array<{ id: string; price: number | null; updated_at: string }> | null
  ) => {
    const completedPayments = paymentsData.filter(p => p.status === 'paid' && p.payment_date);
    const monthlyData: { [key: string]: { earnings: number; petitions: number } } = {};

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'yyyy-MM');
      monthlyData[monthKey] = { earnings: 0, petitions: 0 };
    }

    // Adicionar dados de pagamentos consolidados (se houver)
    completedPayments.forEach(payment => {
      const monthKey = format(new Date(payment.payment_date!), 'yyyy-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].earnings += payment.amount;
        monthlyData[monthKey].petitions += 1;
      }
    });

    // 🚀 ADICIONAR DADOS DE PETIÇÕES APROVADAS (para gráfico em tempo real)
    if (approvedPetitions && approvedPetitions.length > 0) {
      approvedPetitions.forEach(petition => {
        const monthKey = format(new Date(petition.updated_at), 'yyyy-MM');
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].earnings += (petition.price || 60.00);
          monthlyData[monthKey].petitions += 1;
        }
      });
    }

    const chartData = Object.entries(monthlyData).map(([monthKey, data]) => ({
      month: format(new Date(monthKey + '-01'), 'MMM', { locale: ptBR }),
      earnings: data.earnings,
      petitions: data.petitions
    }));

    console.log('📈 Chart data gerado:', chartData);

    setChartData(chartData);
  };

  const applyFilters = () => {
    let filtered = [...payments];
    if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);

    if (periodFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (periodFilter) {
        case 'thisMonth':   startDate = startOfMonth(now); break;
        case 'lastMonth':   startDate = startOfMonth(subMonths(now, 1)); break;
        case 'last3Months': startDate = subMonths(now, 3); break;
        case 'thisYear':    startDate = startOfYear(now); break;
        default:            startDate = new Date(0);
      }
      filtered = filtered.filter(p => new Date(p.created_at) >= startDate);
    }

    setFilteredPayments(filtered);
  };

  // --------- UI helpers (pagamentos) ---------
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':       return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />;
      case 'pending':    return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />;
      case 'processing': return <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-500" />;
      default:           return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':       return 'Pago';
      case 'pending':    return 'Pendente';
      case 'processing': return 'Processando';
      case 'cancelled':  return 'Cancelado';
      default:           return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':       return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:           return 'bg-muted text-muted-foreground';
    }
  };


  // -------------------- Loading --------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg shadow border border-border">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------- Render --------------------
  return (
     <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pagamentos</h1>
        <p className="text-muted-foreground">Acompanhe seus ganhos e histórico de pagamentos em tempo real</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Ganho</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                R$ {stats.thisMonthEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs ${stats.growthPercentage >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage.toFixed(1)}% vs mês anterior
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Média Mensal</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                R$ {stats.monthlyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-500" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-medium text-foreground mb-4">Evolução dos Ganhos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Ganhos']}
              />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg shadow border border-border">
          <h3 className="text-lg font-medium text-foreground mb-4">Petições por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [value, 'Petições']} />
              <Bar dataKey="petitions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card p-6 rounded-lg shadow border border-border mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md bg-background border-border text-foreground shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Período</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full rounded-md bg-background border-border text-foreground shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              <option value="thisMonth">Este mês</option>
              <option value="lastMonth">Mês passado</option>
              <option value="last3Months">Últimos 3 meses</option>
              <option value="thisYear">Este ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="bg-card rounded-lg shadow border border-border mb-10">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">
            Histórico de Pagamentos ({filteredPayments.length})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {filteredPayments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado com os filtros aplicados</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(payment.status)}
                      <h4 className="text-lg font-medium text-foreground">{payment.petition_title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div><span className="font-medium">Cliente:</span> {payment.client_name}</div>
                      <div><span className="font-medium">Valor:</span> R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div><span className="font-medium">Método:</span> {payment.payment_method || 'Não especificado'}</div>
                      <div><span className="font-medium">Criado em:</span> {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
                      {payment.payment_date && (
                        <div><span className="font-medium">Pago em:</span> {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</div>
                      )}
                      {payment.reference && (
                        <div><span className="font-medium">Referência:</span> {payment.reference}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>Detalhes</span>
                    </button>
                    {payment.status === 'paid' && (
                      <button className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Comprovante</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Envio de Nota Fiscal */}
      <div ref={invoiceSectionRef} className="bg-card p-6 rounded-lg shadow border border-border mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Envio de Nota Fiscal</h2>
        <InvoiceUpload />
      </div>
    </div>
  );
};

export default Payments;
