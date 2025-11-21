import React from 'react';
import { RedactorFlowDemo } from '../../components/demo/RedactorFlowDemo';

export const RedactorFlowDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <RedactorFlowDemo />
    </div>
  );
};

export default RedactorFlowDemoPage;