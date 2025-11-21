import React from 'react';
import { RedactorApprovalPanel } from '../../components/admin/RedactorApprovalPanel';

export const RedactorApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RedactorApprovalPanel />
    </div>
  );
};

export default RedactorApprovalPage;