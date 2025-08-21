import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChange, 
  getCurrentUserProfile,
  logout as authLogout
} from '../services/auth';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile data
  const loadUserProfile = async (user) => {
    try {
      if (user) {
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err.message);
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authLogout();
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return userProfile?.role === requiredRole;
  };

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.includes(userProfile?.role);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Check if user profile is complete
  const isProfileComplete = () => {
    return userProfile?.profileComplete === true;
  };

  // Value object to provide to consumers
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    logout,
    refreshProfile,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
