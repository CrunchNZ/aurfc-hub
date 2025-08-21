import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected route component with role-based access control
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireAuth = true, 
  requireProfileComplete = false,
  redirectTo = '/login'
}) => {
  const { currentUser, userProfile, loading, isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    // Redirect to login page, saving the intended destination
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if profile completion is required and user profile is incomplete
  if (requireProfileComplete && userProfile && !userProfile.profileComplete) {
    // Redirect to profile completion page
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.length === 1 
      ? hasRole(requiredRoles[0])
      : hasAnyRole(requiredRoles);

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed, render the protected content
  return children;
};

// Convenience components for common role requirements
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const CoachRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin', 'coach']} {...props}>
    {children}
  </ProtectedRoute>
);

export const PlayerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin', 'coach', 'player']} {...props}>
    {children}
  </ProtectedRoute>
);

export const ParentRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin', 'parent']} {...props}>
    {children}
  </ProtectedRoute>
);

export const JuniorRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin', 'junior']} {...props}>
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={true} {...props}>
    {children}
  </ProtectedRoute>
);

export const PublicRoute = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={false} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
