import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Chat from './components/Chat';
import TeamManagement from './components/TeamManagement';
import Calendar from './components/Calendar';
import JuniorPortal from './components/JuniorPortal';
import ParentDashboard from './components/ParentDashboard';

// Import styles
import './styles/global.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation user={user} />
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <SignUp />} 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/messaging" 
            element={user ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat/:roomId" 
            element={user ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/team-management" 
            element={user ? <TeamManagement /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/calendar" 
            element={user ? <Calendar /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/junior-portal" 
            element={user ? <JuniorPortal /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/parent-dashboard/:juniorId" 
            element={user ? <ParentDashboard /> : <Navigate to="/login" />} 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
