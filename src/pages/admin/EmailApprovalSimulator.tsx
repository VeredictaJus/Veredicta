import React from 'react';
import { EmailApprovalSimulator } from '../../components/admin/EmailApprovalSimulator';

export const EmailApprovalSimulatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EmailApprovalSimulator />
    </div>
  );
};

export default EmailApprovalSimulatorPage;