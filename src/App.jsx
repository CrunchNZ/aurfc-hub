import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Navigation from './components/Navigation';
import Profile from './components/Profile';
import Chat from './components/Chat';
import TeamManagement from './components/TeamManagement';
import TeamBuilder from './components/TeamBuilder';
import Calendar from './components/Calendar';
import JuniorPortal from './components/JuniorPortal';
import Store from './components/Store/Store';
import AdminStore from './components/Store/AdminStore';
import FirebaseTest from './components/FirebaseTest';
import ThemeToggle from './components/ThemeToggle';
import ParentDashboard from './components/ParentDashboard';
import PlayerSchedule from './components/PlayerSchedule';
import ProtectedRoute, {
  AuthenticatedRoute,
  AdminRoute,
  CoachRoute,
  PlayerRoute,
  ParentRoute,
  JuniorRoute
} from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Wrapper component that provides user context to Navigation
const AuthenticatedLayout = ({ children }) => {
  const { currentUser } = useAuth();
  return (
    <div>
      <Navigation user={currentUser} />
      {children}
    </div>
  );
};

// Full application with test page access
function App() {
  console.log('App component is rendering!');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-background text-text-primary transition-colors duration-300">
            {/* Rugby-themed background pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-accent-green"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003366' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            {/* Main content */}
            <div className="relative z-10">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Test route for development */}
                <Route path="/test" element={
                  <div style={{ 
                    padding: '20px', 
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#f0f0f0',
                    minHeight: '100vh'
                  }}>
                    <h1 style={{ color: '#003366' }}>🏉 AURFC Hub - Component Test Mode</h1>
                    <p>Testing all components before full deployment...</p>
                    
                    <div style={{ margin: '20px 0' }}>
                      <h3>Navigation Component Test:</h3>
                      <Navigation user={null} />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Login Component Test:</h3>
                      <Login />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>SignUp Component Test:</h3>
                      <SignUp />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Dashboard Component Test:</h3>
                      <RoleBasedDashboard />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Profile Component Test:</h3>
                      <Profile />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Chat Component Test:</h3>
                      <Chat />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>TeamManagement Component Test:</h3>
                      <TeamManagement />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Calendar Component Test:</h3>
                      <Calendar />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>JuniorPortal Component Test:</h3>
                      <JuniorPortal />
                    </div>

                    <div style={{ margin: '20px 0' }}>
                      <h3>Store Component Test:</h3>
                      <Store />
                    </div>
                  </div>
                } />

                {/* Protected routes with navigation */}
                <Route path="/dashboard" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <RoleBasedDashboard />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/profile" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <Profile />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/chat/:roomId" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <Chat />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/chat" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <Chat />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/members" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Club Members</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Senior Players</h3>
                            <p className="text-gray-600">View and manage senior team members</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Junior Players</h3>
                            <p className="text-gray-600">View and manage junior team members</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Coaches & Staff</h3>
                            <p className="text-gray-600">View and manage coaching staff</p>
                          </div>
                        </div>
                      </div>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/events" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Club Events</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Training Sessions</h3>
                            <p className="text-gray-600">View and manage training schedules</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Matches</h3>
                            <p className="text-gray-600">View and manage match schedules</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Social Events</h3>
                            <p className="text-gray-600">View and manage social activities</p>
                          </div>
                        </div>
                      </div>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/messages" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Inbox</h3>
                            <p className="text-gray-600">View and manage incoming messages</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Sent Messages</h3>
                            <p className="text-gray-600">View your sent messages</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Compose</h3>
                            <p className="text-gray-600">Send new messages to team members</p>
                          </div>
                        </div>
                      </div>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/team-management" element={
                  <CoachRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <TeamManagement />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </CoachRoute>
                } />

                <Route path="/team-builder" element={
                  <CoachRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <TeamBuilder />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </CoachRoute>
                } />

                <Route path="/calendar" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <Calendar />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/player-schedule" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <PlayerSchedule />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/junior-portal" element={
                  <JuniorRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <JuniorPortal />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </JuniorRoute>
                } />

                <Route path="/store" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <ErrorBoundary>
                        <Store />
                      </ErrorBoundary>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/reports" element={
                  <AuthenticatedRoute>
                    <AuthenticatedLayout>
                      <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Attendance Reports</h3>
                            <p className="text-gray-600">View team attendance statistics and trends</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
                            <p className="text-gray-600">Track player and team performance data</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Financial Reports</h3>
                            <p className="text-gray-600">Monitor club finances and revenue</p>
                          </div>
                        </div>
                      </div>
                    </AuthenticatedLayout>
                  </AuthenticatedRoute>
                } />

                <Route path="/parent-dashboard/:juniorId" element={
                  <ParentRoute>
                    <AuthenticatedLayout>
                      <ParentDashboard />
                    </AuthenticatedLayout>
                  </ParentRoute>
                } />

                <Route path="/admin/store" element={
                  <AdminRoute>
                    <div>
                      <Navigation user={null} />
                      <AdminStore />
                    </div>
                  </AdminRoute>
                } />

                {/* Development/testing routes */}
                <Route path="/firebase-test" element={
                  <AuthenticatedRoute>
                    <div>
                      <Navigation user={null} />
                      <FirebaseTest />
                    </div>
                  </AuthenticatedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>

            {/* Global theme toggle - positioned in bottom right */}
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-secondary-light dark:border-gray-600">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
