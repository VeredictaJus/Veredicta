export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface TrafficData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    page: string;
    visits: number;
    percentage: number;
  }>;
  sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

export interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userGrowth: ChartDataPoint[];
  userActivity: ChartDataPoint[];
}

export interface ContentMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  avgEngagement: number;
  topArticles: Array<{
    title: string;
    views: number;
    engagement: number;
    publishDate: string;
  }>;
  viewsOverTime: ChartDataPoint[];
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: ChartDataPoint[];
  subscriptionMetrics: {
    activeSubscriptions: number;
    newSubscriptions: number;
    churnRate: number;
    mrr: number;
  };
}

export interface SystemPerformance {
  uptime: number;
  responseTime: number;
  errorRate: number;
  apiCalls: number;
  performanceOverTime: ChartDataPoint[];
  errorLogs: Array<{
    timestamp: string;
    error: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
}

export interface AnalyticsDashboard {
  overview: {
    metrics: AnalyticsMetric[];
    alerts: Array<{
      id: string;
      type: 'warning' | 'error' | 'info' | 'success';
      message: string;
      timestamp: string;
    }>;
  };
  traffic: TrafficData;
  users: UserEngagement;
  content: ContentMetrics;
  revenue: RevenueMetrics;
  performance: SystemPerformance;
  lastUpdated: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: DateRange;
  metrics: string[];
  includeCharts: boolean;
  emailReport?: {
    recipients: string[];
    schedule?: 'daily' | 'weekly' | 'monthly';
  };
}