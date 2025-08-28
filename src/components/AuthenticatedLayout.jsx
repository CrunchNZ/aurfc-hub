import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';

const AuthenticatedLayout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div>
      <Navigation user={currentUser} />
      {children}
    </div>
  );
};

export default AuthenticatedLayout;

