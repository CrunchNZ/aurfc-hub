import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Target,
  Trophy,
  Users2,
  MessageSquare,
  AlertCircle,
  Info
} from 'lucide-react';

const PlayerSchedule = () => {
  const { currentUser: user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month'
  const [loading, setLoading] = useState(false);

  // Mock data for player schedule
  const [scheduleData, setScheduleData] = useState({
    upcomingEvents: [
      {
        id: 1,
        title: 'Senior A Training',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '18:00',
        duration: 90,
        location: 'University Oval',
        type: 'training',
        description: 'Regular team training session focusing on skills and fitness',
        required: true,
        rsvpStatus: 'pending', // 'confirmed', 'declined', 'pending'
        rsvpDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        team: 'Senior A',
        coach: 'Coach Johnson',
        maxPlayers: 32,
        confirmedPlayers: 24,
        notes: 'Bring water bottle and training gear. Focus on tackling technique today.'
      },
      {
        id: 2,
        title: 'Match vs Victoria University',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        time: '14:30',
        duration: 120,
        location: 'Victoria University',
        type: 'match',
        description: 'Inter-university competition match',
        required: true,
        rsvpStatus: 'confirmed',
        rsvpDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        team: 'Senior A',
        coach: 'Coach Johnson',
        maxPlayers: 22,
        confirmedPlayers: 20,
        notes: 'Full match kit required. Meet at clubhouse 1 hour before departure.'
      },
      {
        id: 3,
        title: 'Team Meeting & Strategy Session',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '19:00',
        duration: 60,
        location: 'Clubhouse',
        type: 'meeting',
        description: 'Team strategy discussion and upcoming match preparation',
        required: false,
        rsvpStatus: 'pending',
        rsvpDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        team: 'Senior A',
        coach: 'Coach Johnson',
        maxPlayers: 32,
        confirmedPlayers: 18,
        notes: 'Casual dress. Pizza provided. Important for team bonding.'
      },
      {
        id: 4,
        title: 'Recovery Session',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '10:00',
        duration: 45,
        location: 'University Gym',
        type: 'recovery',
        description: 'Light recovery and stretching session',
        required: false,
        rsvpStatus: 'declined',
        rsvpDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        team: 'Senior A',
        coach: 'Coach Johnson',
        maxPlayers: 20,
        confirmedPlayers: 8,
        notes: 'Optional session. Good for injury prevention and flexibility.'
      },
      {
        id: 5,
        title: 'Skills Workshop',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '16:00',
        duration: 75,
        location: 'University Oval',
        type: 'skills',
        description: 'Specialized skills training with guest coach',
        required: false,
        rsvpStatus: 'pending',
        rsvpDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        team: 'Senior A',
        coach: 'Guest Coach Smith',
        maxPlayers: 25,
        confirmedPlayers: 15,
        notes: 'Special session with former professional player. Limited spots available.'
      }
    ],
    availabilitySettings: {
      defaultResponse: 'auto', // 'auto', 'manual'
      autoConfirmTraining: true,
      autoConfirmMatches: true,
      autoConfirmMeetings: false,
      reminderTime: '24h', // '2h', '24h', '48h'
      notifications: true
    }
  });

  // Get current week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return scheduleData.upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Handle RSVP response
  const handleRSVP = async (eventId, status) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setScheduleData(prev => ({
      ...prev,
      upcomingEvents: prev.upcomingEvents.map(event => 
        event.id === eventId 
          ? { ...event, rsvpStatus: status }
          : event
      )
    }));
    
    setLoading(false);
  };

  // Get status badge styling
  const getStatusBadge = (status, required) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'declined':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return required 
          ? `${baseClasses} bg-orange-100 text-orange-800`
          : `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  // Get event type styling
  const getEventTypeStyle = (type) => {
    const styles = {
      training: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Target },
      match: { bg: 'bg-green-100', text: 'text-green-600', icon: Trophy },
      meeting: { bg: 'bg-purple-100', text: 'text-purple-600', icon: Users2 },
      recovery: { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: HelpCircle },
      skills: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: Target }
    };
    
    return styles[type] || styles.training;
  };

  // Format time
  const formatTime = (time) => {
    return time.replace(':', 'h');
  };

  // Check if RSVP is overdue
  const isRSVPOverdue = (event) => {
    return new Date() > new Date(event.rsvpDeadline) && event.rsvpStatus === 'pending';
  };

  // Get upcoming events count
  const getUpcomingCount = () => {
    return scheduleData.upcomingEvents.filter(event => 
      new Date(event.date) > new Date()
    ).length;
  };

  // Get pending RSVPs count
  const getPendingRSVPCount = () => {
    return scheduleData.upcomingEvents.filter(event => 
      event.rsvpStatus === 'pending' && new Date(event.date) > new Date()
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
              <p className="text-gray-600 mt-1">Manage your availability and RSVPs for upcoming events</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {getUpcomingCount()} Upcoming Events
              </div>
              {getPendingRSVPCount() > 0 && (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getPendingRSVPCount()} Pending RSVPs
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Month View
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            <div className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            {/* Week Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {getWeekDates().map((date, index) => (
                <div key={index} className="p-4 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString()
                      ? 'text-primary'
                      : 'text-gray-600'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Week Content */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {getWeekDates().map((date, index) => (
                <div key={index} className="border-r last:border-r-0 p-2 min-h-[400px]">
                  {getEventsForDate(date).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-2 p-3 rounded-lg border bg-white shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-1 rounded-full ${getEventTypeStyle(event.type).bg}`}>
                          {React.createElement(getEventTypeStyle(event.type).icon, { 
                            className: `h-3 w-3 ${getEventTypeStyle(event.type).text}` 
                          })}
                        </div>
                        {isRSVPOverdue(event) && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {event.title}
                      </h4>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.time)} ({event.duration}min)
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </div>

                      {/* RSVP Status */}
                      <div className="mt-3">
                        <div className={`text-xs ${getStatusBadge(event.rsvpStatus, event.required).split(' ').slice(1).join(' ')}`}>
                          {event.rsvpStatus === 'confirmed' ? 'Attending' :
                           event.rsvpStatus === 'declined' ? 'Not Attending' :
                           event.required ? 'Response Required' : 'Optional'}
                        </div>
                      </div>

                      {/* RSVP Actions */}
                      {event.rsvpStatus === 'pending' && (
                        <div className="mt-2 flex space-x-1">
                          <button
                            onClick={() => handleRSVP(event.id, 'confirmed')}
                            disabled={loading}
                            className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            ✓ Yes
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'declined')}
                            disabled={loading}
                            className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            ✗ No
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="text-center text-gray-600">
              <p>Month view coming soon...</p>
              <p className="text-sm">Switch to Week view for detailed scheduling</p>
            </div>
          </motion.div>
        )}

        {/* Upcoming Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-lg shadow-sm border"
        >
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your RSVPs and availability</p>
          </div>
          
          <div className="divide-y">
            {scheduleData.upcomingEvents
              .filter(event => new Date(event.date) > new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((event) => (
                <div key={event.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-full ${getEventTypeStyle(event.type).bg}`}>
                          {React.createElement(getEventTypeStyle(event.type).icon, { 
                            className: `h-5 w-5 ${getEventTypeStyle(event.type).text}` 
                          })}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {event.date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(event.time)} ({event.duration}min)
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.confirmedPlayers}/{event.maxPlayers} confirmed
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Coach: {event.coach}
                        </span>
                        {event.required && (
                          <span className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Required Event
                          </span>
                        )}
                      </div>
                      
                      {event.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{event.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      {/* RSVP Status */}
                      <div className="text-right">
                        <div className={`inline-block ${getStatusBadge(event.rsvpStatus, event.required)}`}>
                          {event.rsvpStatus === 'confirmed' ? 'Attending' :
                           event.rsvpStatus === 'declined' ? 'Not Attending' :
                           event.required ? 'Response Required' :
                           'Optional'}
                        </div>
                        
                        {event.rsvpStatus === 'pending' && (
                          <div className="mt-2 text-xs text-gray-500">
                            Respond by: {event.rsvpDeadline.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* RSVP Actions */}
                      {event.rsvpStatus === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRSVP(event.id, 'confirmed')}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Attending</span>
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'declined')}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Not Attending</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Change RSVP */}
                      {event.rsvpStatus !== 'pending' && (
                        <button
                          onClick={() => handleRSVP(event.id, 'pending')}
                          disabled={loading}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Change Response
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Availability Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Default Responses</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleData.availabilitySettings.autoConfirmTraining}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-confirm training sessions</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleData.availabilitySettings.autoConfirmMatches}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-confirm matches</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleData.availabilitySettings.autoConfirmMeetings}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-confirm team meetings</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleData.availabilitySettings.notifications}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Time
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="2h">2 hours before</option>
                    <option value="24h" selected>24 hours before</option>
                    <option value="48h">48 hours before</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerSchedule;
