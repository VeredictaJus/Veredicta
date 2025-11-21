import React from 'react';
import { UserInviteForm } from '../../components/users/UserInviteForm';
import { useNavigate } from 'react-router-dom';

export const UserInvitePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/users');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserInviteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default UserInvitePage;