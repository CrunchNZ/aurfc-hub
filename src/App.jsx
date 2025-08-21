import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Chat from './components/Chat';
import TeamManagement from './components/TeamManagement';
import Calendar from './components/Calendar';
import JuniorPortal from './components/JuniorPortal';
import ParentDashboard from './components/ParentDashboard';
import Store from './components/Store/Store';
import AdminStore from './components/Store/AdminStore';
import FirebaseTest from './components/FirebaseTest';
import ProtectedRoute, { 
  AuthenticatedRoute, 
  AdminRoute, 
  CoachRoute, 
  PlayerRoute, 
  ParentRoute, 
  JuniorRoute 
} from './components/ProtectedRoute';

// TODO: Import other components as we build them

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <AuthenticatedRoute>
                <Profile />
              </AuthenticatedRoute>
            } />
            
            <Route path="/chat/:roomId" element={
              <AuthenticatedRoute>
                <Chat />
              </AuthenticatedRoute>
            } />
            
            <Route path="/team-management" element={
              <CoachRoute>
                <TeamManagement />
              </CoachRoute>
            } />
            
            <Route path="/calendar" element={
              <AuthenticatedRoute>
                <Calendar />
              </AuthenticatedRoute>
            } />
            
            <Route path="/junior-portal" element={
              <JuniorRoute>
                <JuniorPortal />
              </JuniorRoute>
            } />
            
            <Route path="/parent-dashboard/:juniorId" element={
              <ParentRoute>
                <ParentDashboard />
              </ParentRoute>
            } />
            
            <Route path="/store" element={
              <AuthenticatedRoute>
                <Store />
              </AuthenticatedRoute>
            } />
            
            <Route path="/admin/store" element={
              <AdminRoute>
                <AdminStore />
              </AdminRoute>
            } />
            
            {/* Development/testing routes */}
            <Route path="/firebase-test" element={
              <AuthenticatedRoute>
                <FirebaseTest />
              </AuthenticatedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
