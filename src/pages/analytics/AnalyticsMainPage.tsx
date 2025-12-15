import React from 'react';
import { AnalyticsDashboard } from '../../components/analytics/AnalyticsDashboard';

export const AnalyticsMainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AnalyticsMainPage;