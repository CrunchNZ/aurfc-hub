import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Target,
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  Plus,
  Settings,
  Activity,
  UserPlus,
  FileText
} from 'lucide-react';

const CoachDashboard = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for coach dashboard
  const [coachData, setCoachData] = useState({
    teamOverview: {
      teamName: 'Senior A',
      activePlayers: 28,
      totalPlayers: 32,
      weeklyAttendance: 85,
      upcomingEvents: 5,
      pendingRSVPs: 8
    },
    teamPerformance: {
      recentResults: ['W', 'W', 'L', 'W'],
      trainingCompletion: 92,
      playerDevelopment: 15,
      injuryStatus: 2
    },
    playerManagement: {
      attentionNeeded: 3,
      newRegistrations: 2,
      performanceReviews: 8,
      parentCommunications: 5
    },
    upcomingEvents: [
      {
        id: 1,
        title: 'Senior A Training',
        date: 'Tomorrow',
        time: '6:00 PM',
        location: 'University Oval',
        type: 'training',
        rsvpCount: 24,
        totalPlayers: 32
      },
      {
        id: 2,
        title: 'Match vs Victoria University',
        date: 'Saturday',
        time: '2:30 PM',
        location: 'Victoria University',
        type: 'match',
        rsvpCount: 28,
        totalPlayers: 32
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
  const navigateToTeam = () => navigate('/team-management');
  const navigateToSchedule = () => navigate('/calendar');
  const navigateToCommunications = () => navigate('/chat');
  const navigateToPerformance = () => navigate('/reports');
  const navigateToTraining = () => navigate('/calendar');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your coach dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Coach {user?.displayName || 'User'}! Here's your team overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {coachData.teamOverview.teamName} Coach
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active Coach
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Team Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Players</p>
                <p className="text-2xl font-bold text-primary">
                  {coachData.teamOverview.activePlayers}/{coachData.teamOverview.totalPlayers}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  {Math.round((coachData.teamOverview.activePlayers / coachData.teamOverview.totalPlayers) * 100)}%
                </span>
                <span className="ml-1">of roster active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Attendance</p>
                <p className="text-2xl font-bold text-blue-600">{coachData.teamOverview.weeklyAttendance}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-600 font-medium">Good</span>
                <span className="ml-1">attendance rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-green-600">{coachData.teamOverview.upcomingEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-600 font-medium">{coachData.teamOverview.pendingRSVPs}</span>
                <span className="ml-1">pending RSVPs</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Player Development</p>
                <p className="text-2xl font-bold text-purple-600">{coachData.teamPerformance.playerDevelopment}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-purple-600 font-medium">Players</span>
                <span className="ml-1">improved this month</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Immediate Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                Immediate Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={navigateToCommunications}
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Send Team Announcement</span>
                </button>
                
                <button
                  onClick={navigateToTraining}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-3"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Schedule Training</span>
                </button>
                
                <button
                  onClick={navigateToTeam}
                  className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-3"
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Review Attendance</span>
                </button>
                
                <button
                  onClick={navigateToTeam}
                  className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-3"
                >
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">Update Match Squad</span>
                </button>
              </div>
            </motion.div>

            {/* Team Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Team Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Match Results</h3>
                  <div className="flex space-x-2">
                    {coachData.teamPerformance.recentResults.map((result, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          result === 'W' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Last 4 matches</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Training Completion</h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {coachData.teamPerformance.trainingCompletion}%
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${coachData.teamPerformance.trainingCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">This month's sessions</p>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Events
                </h2>
                <button
                  onClick={navigateToSchedule}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Manage Schedule →
                </button>
              </div>
              
              <div className="space-y-4">
                {coachData.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        event.type === 'training' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {event.type === 'training' ? <Target className="h-4 w-4" /> :
                         <Trophy className="h-4 w-4" />}
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
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {event.rsvpCount}/{event.totalPlayers} RSVPs
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((event.rsvpCount / event.totalPlayers) * 100)}% response rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            
            {/* Player Management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Player Management
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Attention Needed</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{coachData.playerManagement.attentionNeeded}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">New Registrations</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{coachData.playerManagement.newRegistrations}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Performance Reviews</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{coachData.playerManagement.performanceReviews}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Parent Messages</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{coachData.playerManagement.parentCommunications}</span>
                </div>
              </div>
              
              <button
                onClick={navigateToTeam}
                className="w-full mt-4 bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Team</span>
              </button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={navigateToCommunications}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Absent Players</span>
                </button>
                
                <button
                  onClick={navigateToTraining}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Plan Next Session</span>
                </button>
                
                <button
                  onClick={navigateToPerformance}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Team Reports</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
