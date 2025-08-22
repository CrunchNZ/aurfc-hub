import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  MapPin,
  Trophy,
  CheckCircle,
  XCircle,
  Star,
  Users,
  ShoppingBag,
  User,
  Target,
  Activity
} from 'lucide-react';

const PlayerDashboard = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for player dashboard
  const [playerData, setPlayerData] = useState({
    upcomingEvents: [
      {
        id: 1,
        title: 'Senior A Training',
        date: 'Tomorrow',
        time: '6:00 PM',
        location: 'University Oval',
        type: 'training',
        rsvpStatus: 'pending'
      },
      {
        id: 2,
        title: 'Match vs Victoria University',
        date: 'Saturday',
        time: '2:30 PM',
        location: 'Victoria University',
        type: 'match',
        rsvpStatus: 'confirmed'
      },
      {
        id: 3,
        title: 'Team Meeting',
        date: 'Next Week',
        time: '7:00 PM',
        location: 'Clubhouse',
        type: 'meeting',
        rsvpStatus: 'pending'
      }
    ],
    personalStats: {
      attendanceRate: 85,
      trainingSessions: 12,
      totalSessions: 15,
      matchAppearances: 8,
      totalMatches: 10,
      currentForm: 4
    },
    recentCommunications: [
      {
        id: 1,
        from: 'Coach',
        message: 'Great work at training today!',
        time: '2 hours ago',
        type: 'praise'
      },
      {
        id: 2,
        from: 'Team',
        message: 'Match kit collection tomorrow',
        time: '4 hours ago',
        type: 'announcement'
      },
      {
        id: 3,
        from: 'Club',
        message: 'New training gear available in store',
        time: '6 hours ago',
        type: 'info'
      }
    ]
  });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Navigation functions
  const navigateToSchedule = () => navigate('/player-schedule');
  const navigateToMessages = () => navigate('/chat');
  const navigateToStats = () => navigate('/profile');
  const navigateToStore = () => navigate('/store');
  const navigateToTeam = () => navigate('/team-management');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your player dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Error</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Player Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.displayName || 'Player'}! Here's your overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Senior A Team
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active Player
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Events (Next 7 days)
                </h2>
                <button
                  onClick={navigateToSchedule}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View Full Schedule →
                </button>
              </div>
              
              <div className="space-y-4">
                {playerData.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        event.type === 'training' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'match' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {event.type === 'training' ? <Target className="h-4 w-4" /> :
                         event.type === 'match' ? <Trophy className="h-4 w-4" /> :
                         <Users className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.date} at {event.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.rsvpStatus === 'confirmed' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Confirmed
                        </span>
                      ) : event.rsvpStatus === 'pending' ? (
                        <button className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-primary-dark transition-colors">
                          RSVP
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          Not Responded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Personal Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Personal Stats
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{playerData.personalStats.attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                  <div className="text-xs text-gray-500">Last 30 days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {playerData.personalStats.trainingSessions}/{playerData.personalStats.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Training Sessions</div>
                  <div className="text-xs text-gray-500">This month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {playerData.personalStats.matchAppearances}/{playerData.personalStats.totalMatches}
                  </div>
                  <div className="text-sm text-gray-600">Match Appearances</div>
                  <div className="text-xs text-gray-500">This season</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Array(playerData.personalStats.currentForm).fill('⭐').join('')}
                  </div>
                  <div className="text-sm text-gray-600">Current Form</div>
                  <div className="text-xs text-gray-500">Coach rating</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={navigateToSchedule}
                  className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Full Schedule</span>
                </button>
                
                <button
                  onClick={navigateToMessages}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Check Team Messages</span>
                </button>
                
                <button
                  onClick={navigateToStats}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Update Availability</span>
                </button>
                
                <button
                  onClick={navigateToStore}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Visit Store</span>
                </button>
              </div>
            </motion.div>

            {/* Recent Communications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Recent Communications
                </h2>
                <button
                  onClick={navigateToMessages}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-3">
                {playerData.recentCommunications.map((comm) => (
                  <div key={comm.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        comm.type === 'praise' ? 'bg-green-100 text-green-600' :
                        comm.type === 'announcement' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {comm.type === 'praise' ? <CheckCircle className="h-3 w-3" /> :
                         comm.type === 'announcement' ? <MessageSquare className="h-3 w-3" /> :
                         <User className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{comm.from}</p>
                        <p className="text-sm text-gray-600 truncate">{comm.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{comm.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
