import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../components/users/UserProfile';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to writer settings profile tab when component mounts
  useEffect(() => {
    navigate('/writer/settings?tab=profile', { replace: true });
  }, [navigate]);

  // Return minimal JSX as fallback (won't be visible due to redirect)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserProfile />
      </div>
    </div>
  );
};

export default UserProfilePage;