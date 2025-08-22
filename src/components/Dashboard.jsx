import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  MapPin,
  Trophy,
  AlertCircle,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    attendanceRate: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const navigate = useNavigate();

  // Navigation functions for dashboard cards
  const navigateToMembers = () => navigate('/team-management');
  const navigateToEvents = () => navigate('/calendar');
  const navigateToMessages = () => navigate('/chat');
  const navigateToReports = () => navigate('/reports');

  // Navigation functions for quick actions
  const navigateToScheduleEvent = () => navigate('/calendar');
  const navigateToManageTeams = () => navigate('/team-management');
  const navigateToSendMessage = () => navigate('/chat');
  const navigateToViewStats = () => navigate('/reports');

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        // Load data regardless of auth state for testing
        loadDashboardData();
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Dashboard useEffect error:', err);
      setRenderError(err.message);
    }
  }, []);

  // Catch any rendering errors
  if (renderError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Render Error</h2>
            <p className="text-red-600 mb-4">There was an error rendering the dashboard: {renderError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simplified data loading - avoid complex Firestore queries for now
      console.log('Loading dashboard data...');
      
      // Set default stats without Firestore queries
      setStats({
        totalMembers: 687,
        upcomingEvents: 3,
        unreadMessages: 12,
        attendanceRate: 85
      });

      // Set default recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'training',
          message: 'Senior A Team training completed',
          time: '2 hours ago',
          icon: CheckCircle,
          color: 'text-accent-green',
          bgColor: 'bg-accent-green/10'
        },
        {
          id: 2,
          type: 'registration',
          message: '3 new junior registrations received',
          time: '4 hours ago',
          icon: Users,
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        },
        {
          id: 3,
          type: 'match',
          message: 'Match vs Victoria University scheduled',
          time: '6 hours ago',
          icon: Calendar,
          color: 'text-accent-gold',
          bgColor: 'bg-accent-gold/10'
        }
      ]);

      // Set empty events for now to prevent crashes
      setUpcomingEvents([]);
      
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      setError(err.message);
      
      // Set fallback data if loading fails
      setStats({
        totalMembers: 687,
        upcomingEvents: 0,
        unreadMessages: 12,
        attendanceRate: 85
      });
      
      setRecentActivities([
        {
          id: 1,
          type: 'training',
          message: 'Senior A Team training completed',
          time: '2 hours ago',
          icon: CheckCircle,
          color: 'text-accent-green',
          bgColor: 'bg-accent-green/10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (date) => {
    return new Intl.DateTimeFormat('en-NZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'match': return 'bg-accent-red text-white';
      case 'training': return 'bg-primary text-white';
      case 'meeting': return 'bg-accent-gold text-text-primary';
      case 'social': return 'bg-accent-green text-white';
      default: return 'bg-secondary text-text-primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Error fallback - prevent black page
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Error</h2>
            <p className="text-red-600 mb-4">There was an issue loading the dashboard data: {error}</p>
            <button 
              onClick={loadDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
          
          {/* Fallback dashboard content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">AURFC Hub Dashboard</h1>
            <p className="text-gray-600 mb-4">Welcome to the Auckland University Rugby Football Club Hub.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={navigateToMembers}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Members
              </button>
              <button 
                onClick={navigateToEvents}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-primary mb-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
          >
            <span className="text-2xl">🏉</span>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Team Member'}!
          </h1>
          <p className="text-white/80 text-lg">Here's what's happening at AURFC today</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={navigateToMembers}
          className="card hover-lift cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-primary">{stats.totalMembers}</h3>
              <p className="text-text-secondary">Total Members</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="text-primary" size={32} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={navigateToEvents}
          className="card hover-lift cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-accent-gold">{stats.upcomingEvents}</h3>
              <p className="text-text-secondary">Upcoming Events</p>
            </div>
            <div className="p-3 bg-accent-gold/10 rounded-full">
              <Calendar className="text-accent-gold" size={32} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={navigateToMessages}
          className="card hover-lift cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-primary-light">{stats.unreadMessages}</h3>
              <p className="text-text-secondary">Unread Messages</p>
            </div>
            <div className="p-3 bg-primary-light/10 rounded-full">
              <MessageSquare className="text-primary-light" size={32} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={navigateToReports}
          className="card hover-lift cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-accent-green">{stats.attendanceRate}%</h3>
              <p className="text-text-secondary">Attendance Rate</p>
            </div>
            <div className="p-3 bg-accent-green/10 rounded-full">
              <TrendingUp className="text-accent-green" size={32} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="text-primary" size={24} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Upcoming Events</h2>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-secondary-light/50 rounded-lg hover:bg-secondary-light transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-text-primary">{event.title}</h4>
                        <span className={`badge ${getEventTypeColor(event.type)} px-3 py-1 rounded-full text-xs font-medium`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatEventDate(event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-2">
                            <MapPin size={16} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {event.attendees && (
                        <div className="text-sm text-text-secondary">
                          {event.attendees.length} attending
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-text-secondary"
                >
                  <Calendar size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No upcoming events scheduled</p>
                  <p className="text-sm">Check back later for updates</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <TrendingUp className="text-accent-green" size={24} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Recent Activities</h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`flex items-start gap-3 p-3 rounded-lg ${activity.bgColor}`}
                  >
                    <Icon size={20} className={activity.color} />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">{activity.message}</p>
                      <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-gold/10 rounded-lg">
            <Trophy className="text-accent-gold" size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToScheduleEvent}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            Schedule Event
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToManageTeams}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Users size={18} />
            Manage Teams
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToSendMessage}
            className="btn-accent flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            Send Message
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/store')}
            className="bg-secondary-light text-text-primary hover:bg-secondary px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Visit Store
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;