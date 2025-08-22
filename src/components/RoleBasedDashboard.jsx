import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserRole } from '../services/auth';
import PlayerDashboard from './PlayerDashboard';
import CoachDashboard from './CoachDashboard';
import AdminDashboard from './AdminDashboard';
import ParentDashboard from './ParentDashboard';

const RoleBasedDashboard = () => {
  const { currentUser: user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log('Fetching user role for:', user.uid);
          const role = await getCurrentUserRole();
          console.log('User role fetched:', role);
          setUserRole(role);
        } catch (err) {
          console.error('Error fetching user role:', err);
          setError(`Failed to determine user role: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Determining your role...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Role Detection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Authentication Required</h2>
          <p className="text-yellow-600 mb-4">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'player':
      return <PlayerDashboard />;
    case 'coach':
    case 'manager':
      return <CoachDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      // Default to player dashboard for unknown roles
      console.warn(`Unknown user role: ${userRole}, defaulting to player dashboard`);
      return <PlayerDashboard />;
  }
};

export default RoleBasedDashboard;
