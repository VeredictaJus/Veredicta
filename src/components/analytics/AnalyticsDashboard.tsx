import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsDashboard as DashboardData, DateRange, Alert } from '../../types/analytics';
import { AnalyticsService } from '../../services/analyticsService';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { DateRangePicker } from './DateRangePicker';
import { ExportButton } from './ExportButton';
import { AlertBanner } from './AlertBanner';
import { RefreshCw, TrendingUp, Eye, DollarSign } from 'lucide-react';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(
    AnalyticsService.getDateRangePresets()[2].range // Last 7 days
  );
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getDashboardData(dateRange);
      setDashboardData(data);
      setAlerts(data.overview.alerts);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
  }, []);

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  useRealtimeAnalytics(addAlert);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportButton dateRange={dateRange} data={dashboardData} />
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertBanner 
          alerts={alerts} 
          onDismiss={handleDismissAlert}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData?.overview.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} isLoading={loading} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Crescimento de Usuários"
          data={dashboardData?.users.userGrowth || []}
          type="area"
          color="#3B82F6"
          isLoading={loading}
        />
        <ChartContainer
          title="Receita ao Longo do Tempo"
          data={dashboardData?.revenue.revenueGrowth || []}
          type="line"
          color="#10B981"
          isLoading={loading}
        />
        <ChartContainer
          title="Visualizações de Conteúdo"
          data={dashboardData?.content.viewsOverTime || []}
          type="bar"
          color="#F59E0B"
          isLoading={loading}
        />
        <ChartContainer
          title="Performance do Sistema"
          data={dashboardData?.performance.performanceOverTime || []}
          type="line"
          color="#8B5CF6"
          isLoading={loading}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Fontes de Tráfego
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData?.traffic.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{source.source}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {source.visitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({source.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Artigos Mais Vistos
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData?.content.topArticles.map((article, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.views.toLocaleString()} visualizações</span>
                    <span>Engajamento: {article.engagement.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Métricas Financeiras
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MRR</span>
                <span className="text-sm font-medium text-gray-900">
                  {AnalyticsService.formatCurrency(dashboardData?.revenue.subscriptionMetrics.mrr || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assinaturas Ativas</span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData?.revenue.subscriptionMetrics.activeSubscriptions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData?.revenue.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Churn Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData?.revenue.subscriptionMetrics.churnRate.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
