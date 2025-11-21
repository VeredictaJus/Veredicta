import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter,
  Calendar,
  TrendingUp,
  FileText,
  Timer
} from 'lucide-react';
import { DatabaseService } from '../../services/databaseService';
import { useNewAuth } from '../../contexts/NewAuthContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Petition {
  id: string;
  title: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  client_name: string;
  created_at: string;
  completed_at?: string;
  deadline: string;
  price: number;
  type: string;
  estimated_hours?: number;
}

interface HistoryStats {
  totalPetitions: number;
  completedPetitions: number;
  cancelledPetitions: number;
  inProgressPetitions: number;
  successRate: number;
  averageCompletionTime: number;
  totalEarnings: number;
}

const History: React.FC = () => {
  const { user } = useNewAuth();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    totalPetitions: 0,
    completedPetitions: 0,
    cancelledPetitions: 0,
    inProgressPetitions: 0,
    successRate: 0,
    averageCompletionTime: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchPetitionsHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [petitions, statusFilter, dateFilter, typeFilter]);

  const fetchPetitionsHistory = async () => {
    try {
      setLoading(true);
      
      const petitionsData = await DatabaseService.getWriterPetitions(user?.id!);
      
      const formattedPetitions = petitionsData.map(petition => ({
        ...petition,
        client_name: petition.client_name || 'Cliente não informado',
        payment_amount: petition.price || 0,
        petition_type: petition.type || 'Não especificado'
      }));

      setPetitions(formattedPetitions);
      calculateStats(formattedPetitions);
    } catch (error) {
      console.error('Error fetching petitions history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (petitionsData: Petition[]) => {
    const totalPetitions = petitionsData.length;
    const completedPetitions = petitionsData.filter(p => p.status === 'completed').length;
    const cancelledPetitions = petitionsData.filter(p => p.status === 'cancelled').length;
    const inProgressPetitions = petitionsData.filter(p => p.status === 'in_progress').length;
    const successRate = totalPetitions > 0 ? (completedPetitions / totalPetitions) * 100 : 0;
    
    const completedWithTimes = petitionsData.filter(p => 
      p.status === 'completed' && p.created_at && p.completed_at
    );
    
    const averageCompletionTime = completedWithTimes.length > 0 
      ? completedWithTimes.reduce((acc, p) => {
          const start = new Date(p.created_at);
          const end = new Date(p.completed_at!);
          return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedWithTimes.length
      : 0;

    const totalEarnings = petitionsData
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + (p.price || 0), 0);

    setStats({
      totalPetitions,
      completedPetitions,
      cancelledPetitions,
      inProgressPetitions,
      successRate,
      averageCompletionTime,
      totalEarnings
    });
  };

  const applyFilters = () => {
    let filtered = [...petitions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'thisMonth':
          startDate = startOfMonth(now);
          break;
        case 'lastMonth':
          startDate = startOfMonth(subMonths(now, 1));
          break;
        case 'last3Months':
          startDate = subMonths(now, 3);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(p => new Date(p.created_at) >= startDate);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    setFilteredPetitions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      case 'in_progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const petitionTypes = [...new Set(petitions.map(p => p.type))].filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Petições</h1>
        <p className="text-gray-600">Acompanhe o histórico completo das suas petições e estatísticas de desempenho</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Petições</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPetitions}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-orange-600">{stats.averageCompletionTime.toFixed(1)} dias</p>
            </div>
            <Timer className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ganho</p>
              <p className="text-2xl font-bold text-purple-600">R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              <option value="completed">Concluídas</option>
              <option value="in_progress">Em Andamento</option>
              <option value="pending">Pendentes</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              <option value="thisMonth">Este mês</option>
              <option value="lastMonth">Mês passado</option>
              <option value="last3Months">Últimos 3 meses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              {petitionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Petitions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Petições ({filteredPetitions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPetitions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma petição encontrada com os filtros aplicados</p>
            </div>
          ) : (
            filteredPetitions.map((petition) => (
              <div key={petition.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(petition.status)}
                      <h4 className="text-lg font-medium text-gray-900">{petition.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(petition.status)}`}>
                        {getStatusText(petition.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Cliente:</span> {petition.client_name}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {petition.type || 'Não especificado'}
                      </div>
                      <div>
                        <span className="font-medium">Criado em:</span> {format(new Date(petition.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      {petition.completed_at && (
                        <div>
                          <span className="font-medium">Concluído em:</span> {format(new Date(petition.completed_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Prazo:</span> {format(new Date(petition.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span> R$ {petition.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;