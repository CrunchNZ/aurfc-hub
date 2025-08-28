import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  listenToAuthState, 
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
    console.log('AuthContext: useEffect triggered');
    
    // Check if Firebase auth is available
    if (!auth) {
      console.error('AuthContext: Firebase auth is not available');
      setError('Firebase authentication is not available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('AuthContext: Setting up auth state listener...');
      const unsubscribe = listenToAuthState(async (user) => {
        console.log('AuthContext: onAuthStateChange - user:', user);
        
        try {
          setCurrentUser(user);
          
          if (user) {
            console.log('AuthContext: User logged in, loading profile...');
            try {
              await loadUserProfile(user);
              console.log('AuthContext: User profile loaded:', userProfile);
            } catch (error) {
              console.error('AuthContext: Error loading user profile:', error);
              setError(error.message);
            }
          } else {
            console.log('AuthContext: User logged out.');
            setUserProfile(null);
          }
          
          setLoading(false);
          console.log('AuthContext: Loading set to false.');
        } catch (error) {
          console.error('AuthContext: Error in onAuthStateChange callback:', error);
          setError(error.message);
          setLoading(false);
        }
      });

      console.log('AuthContext: Auth state listener set up successfully');
      
      // Cleanup subscription
      return () => {
        console.log('AuthContext: Cleaning up subscription');
        try {
          unsubscribe();
        } catch (cleanupError) {
          console.error('AuthContext: Error during cleanup:', cleanupError);
        }
      };
    } catch (error) {
      console.error('AuthContext: Error setting up auth listener:', error);
      setError(error.message);
      setLoading(false);
    }
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
