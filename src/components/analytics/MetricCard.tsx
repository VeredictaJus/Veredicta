import React from 'react';
import { AnalyticsMetric } from '../../types/analytics';
import { AnalyticsService } from '../../services/analyticsService';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Eye,
  FileText,
  ShoppingCart,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';

interface MetricCardProps {
  metric: AnalyticsMetric;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, isLoading = false }) => {
  const getIcon = (iconName: string) => {
    const icons = {
      'users': Users,
      'dollar-sign': DollarSign,
      'activity': Activity,
      'trending-up': TrendingUp,
      'eye': Eye,
      'file-text': FileText,
      'shopping-cart': ShoppingCart,
      'target': Target,
      'zap': Zap,
      'bar-chart': BarChart3
    };
    
    const IconComponent = icons[iconName as keyof typeof icons] || Activity;
    return <IconComponent className="h-6 w-6" />;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      gray: 'bg-gray-500 text-gray-600 bg-gray-50'
    };
    
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const colorClasses = getColorClasses(metric.color).split(' ');
  const iconBgColor = colorClasses[0];
  const textColor = colorClasses[1];
  const cardBgColor = colorClasses[2];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
        <div className={`p-2 ${iconBgColor} rounded-lg bg-opacity-10`}>
          <div className={textColor}>
            {getIcon(metric.icon)}
          </div>
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {metric.unit === 'R$' 
              ? AnalyticsService.formatCurrency(metric.value)
              : `${AnalyticsService.formatNumber(metric.value)}${metric.unit === '%' ? '%' : ''}`
            }
          </p>
          
          <div className="flex items-center mt-1">
            {metric.changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : metric.changeType === 'decrease' ? (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            
            <span className={`text-sm font-medium ${
              metric.changeType === 'increase' 
                ? 'text-green-600' 
                : metric.changeType === 'decrease' 
                ? 'text-red-600' 
                : 'text-gray-600'
            }`}>
              {AnalyticsService.formatPercent(metric.change)}
            </span>
            
            <span className="text-sm text-gray-500 ml-1">
              vs período anterior
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};