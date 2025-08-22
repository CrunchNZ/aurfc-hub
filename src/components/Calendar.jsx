import React, { useState, useEffect } from 'react';
import { 
  createEvent,
  getEventsForMonth,
  getUpcomingEvents,
  rsvpEvent,
  removeRsvp,
  EVENT_TYPES,
  RSVP_STATUS
} from '../services/scheduling';
import { 
  downloadICalFile, 
  openGoogleCalendar, 
  downloadAppleCalendarFile,
  exportEvents 
} from '../services/calendar-export';
import { 
  openOptimalDirections, 
  formatLocationForDirections,
  getTravelModeOptions 
} from '../services/directions';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserRole } from '../services/auth';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [userRole, setUserRole] = useState('player');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  
  // Form states
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    type: EVENT_TYPES.TRAINING,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    targetRoles: ['all']
  });

  const { currentUser: user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const role = await getCurrentUserRole();
          setUserRole(role || 'player');
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (user && userRole) {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Add timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }, 10000); // 10 second timeout
      
      try {
        // Get events for current month
        const unsubscribeMonthEvents = getEventsForMonth(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          (monthEvents) => {
            setEvents(monthEvents);
            setLoading(false);
            clearTimeout(loadingTimeout);
          },
          userRole
        );

        // Get upcoming events
        const unsubscribeUpcoming = getUpcomingEvents(
          (upcoming) => {
            setUpcomingEvents(upcoming);
          },
          userRole,
          5
        );

        return () => {
          clearTimeout(loadingTimeout);
          if (unsubscribeMonthEvents && typeof unsubscribeMonthEvents === 'function') {
            unsubscribeMonthEvents();
          }
          if (unsubscribeUpcoming && typeof unsubscribeUpcoming === 'function') {
            unsubscribeUpcoming();
          }
        };
      } catch (error) {
        console.error('Error setting up calendar listeners:', error);
        setError('Failed to load calendar: ' + error.message);
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    }
  }, [user, userRole, currentDate]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setError('');
      setLoading(true);
      
      // Validate required fields
      if (!newEventForm.title || !newEventForm.date || !newEventForm.startTime) {
        setError('Title, date, and start time are required');
        setLoading(false);
        return;
      }
      
      // Create event data
      const eventData = {
        title: newEventForm.title,
        description: newEventForm.description,
        type: newEventForm.type,
        date: new Date(newEventForm.date + 'T' + newEventForm.startTime),
        startTime: newEventForm.startTime,
        endTime: newEventForm.endTime || null,
        location: newEventForm.location || '',
        targetRoles: ['all']
      };
      
      console.log('Creating event with data:', eventData);
      
      const createdEvent = await createEvent(eventData, user);
      console.log('Event created successfully:', createdEvent);
      
      // Reset form
      setNewEventForm({
        title: '',
        description: '',
        type: EVENT_TYPES.TRAINING,
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        targetRoles: ['all']
      });
      
      setShowCreateEvent(false);
      setError('');
      
      // Refresh events
      if (userRole) {
        // Force refresh by updating current date
        setCurrentDate(new Date());
      }
      
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, status) => {
    if (!user) return;
    
    try {
      await rsvpEvent(eventId, user.uid, status);
    } catch (error) {
      setError('Failed to RSVP: ' + error.message);
    }
  };

  const handleRemoveRSVP = async (eventId) => {
    if (!user) return;
    
    try {
      await removeRsvp(eventId, user.uid);
    } catch (error) {
      setError('Failed to remove RSVP: ' + error.message);
    }
  };

  // Calendar export handlers
  const handleExportEvents = (format, period = 'all') => {
    const eventsToExport = period === 'all' ? events : 
                          period === 'upcoming' ? upcomingEvents : 
                          getEventsForDate(selectedDate);
    
    exportEvents(eventsToExport, period, format);
    setShowExportOptions(false);
  };

  const handleExportSingleEvent = (event, format) => {
    switch (format) {
      case 'ical':
        downloadICalFile([event], `${event.title.replace(/\s+/g, '-')}.ics`);
        break;
      case 'google':
        openGoogleCalendar(event);
        break;
      case 'apple':
        downloadAppleCalendarFile(event, `${event.title.replace(/\s+/g, '-')}.ics`);
        break;
      default:
        downloadICalFile([event], `${event.title.replace(/\s+/g, '-')}.ics`);
    }
  };

  // Directions handlers
  const handleGetDirections = (event) => {
    setSelectedEvent(event);
    setShowDirections(true);
  };

  const handleOpenDirections = () => {
    if (selectedEvent && selectedEvent.location) {
      const location = formatLocationForDirections(selectedEvent.location);
      openOptimalDirections(location, '', travelMode);
      setShowDirections(false);
      setSelectedEvent(null);
    }
  };

  // Helper functions
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      try {
        if (!event.date) return false;
        const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      } catch (error) {
        console.warn('Error processing event date:', error, event);
        return false;
      }
    });
  };

  const getUserRSVP = (event) => {
    if (!user || !event.rsvps) return null;
    return event.rsvps[user.uid] || null;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time) => {
    try {
      if (!time) return '';
      if (typeof time === 'string') {
        return time;
      }
      if (time.toDate) {
        time = time.toDate();
      }
      if (time instanceof Date) {
        return time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return String(time);
    } catch (error) {
      console.warn('Error formatting time:', error, time);
      return String(time || '');
    }
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      [EVENT_TYPES.TRAINING]: '🏃',
      [EVENT_TYPES.GAME]: '🏉',
      [EVENT_TYPES.EVENT]: '📅'
    };
    return icons[type] || '📅';
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Generate time options with 5-minute intervals
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-card shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Calendar</h1>
              <p className="text-text-secondary">Manage your schedule and events</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Export Options Button */}
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="bg-accent-gold text-text-primary px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-200 flex items-center gap-2"
              >
                📅 Export
              </button>
              
              {/* Create Event Button */}
              {userRole === 'admin' || userRole === 'coach' ? (
                <button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center gap-2"
                >
                  ➕ Create Event
                </button>
              ) : null}
            </div>
          </div>

          {/* Export Options Dropdown */}
          {showExportOptions && (
            <div className="mt-4 p-4 bg-secondary-light rounded-lg border border-secondary">
              <h3 className="font-semibold text-text-primary mb-3">Export Calendar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-text-secondary mb-2">Export Period</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportEvents('ical', 'week')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      📅 This Week
                    </button>
                    <button
                      onClick={() => handleExportEvents('ical', 'month')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      📅 This Month
                    </button>
                    <button
                      onClick={() => handleExportEvents('ical', 'all')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      📅 All Events
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-secondary mb-2">Export Format</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportEvents('ical', 'upcoming')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      📱 iCal File
                    </button>
                    <button
                      onClick={() => handleExportEvents('google', 'upcoming')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      🌐 Google Calendar
                    </button>
                    <button
                      onClick={() => handleExportEvents('apple', 'upcoming')}
                      className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-secondary-light transition-colors"
                    >
                      🍎 Apple Calendar
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-secondary mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportEvents('ical', 'upcoming')}
                      className="w-full px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                      📥 Download All Upcoming
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Event Form */}
          {showCreateEvent && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-secondary shadow-lg">
              <h3 className="font-semibold text-text-primary mb-4">Create New Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter event title"
                      value={newEventForm.title}
                      onChange={(e) => setNewEventForm({...newEventForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Event Type
                    </label>
                    <select
                      value={newEventForm.type}
                      onChange={(e) => setNewEventForm({...newEventForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                    >
                      {Object.values(EVENT_TYPES).map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newEventForm.date}
                      onChange={(e) => setNewEventForm({...newEventForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Start Time *
                    </label>
                    <select
                      value={newEventForm.startTime}
                      onChange={(e) => setNewEventForm({...newEventForm, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                      required
                    >
                      <option value="">Select start time</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      End Time (Optional)
                    </label>
                    <select
                      value={newEventForm.endTime}
                      onChange={(e) => setNewEventForm({...newEventForm, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                    >
                      <option value="">Select end time (optional)</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter event location"
                      value={newEventForm.location}
                      onChange={(e) => setNewEventForm({...newEventForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Event Description (Optional)
                  </label>
                  <textarea
                    placeholder="Enter event description"
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm({...newEventForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                    rows="3"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateEvent(false)}
                    className="bg-secondary text-text-primary px-6 py-2 rounded hover:bg-secondary-dark transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-card shadow-lg p-6">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-secondary-light rounded transition-colors duration-200"
                >
                  ←
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-sm text-accent-gold hover:text-yellow-600 transition-colors duration-200"
                  >
                    Today
                  </button>
                </div>
                
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-secondary-light rounded transition-colors duration-200"
                >
                  →
                </button>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-text-secondary py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24"></div>;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                  return (
                    <div
                      key={index}
                      className={`h-24 p-2 border border-secondary-light rounded cursor-pointer transition-all duration-200 hover:bg-secondary-light ${
                        !day ? 'bg-gray-50' : ''
                      } ${
                        isSelected ? 'bg-primary/10 border-primary' : ''
                      } ${
                        isToday ? 'bg-accent-gold/20 border-2 border-accent-gold' : ''
                      }`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className="font-semibold text-text-primary mb-2">
                            {day.getDate()}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {dayEvents.slice(0, 2).map(event => (
                                <div key={event.id} className="text-xs p-1 bg-primary/20 rounded">
                                  {getEventTypeIcon(event.type)}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-text-secondary bg-secondary-light px-2 py-1 rounded">
                                  +{dayEvents.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calendar Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-card shadow-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => {
                    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
                    const userRSVP = getUserRSVP(event);
                    
                    return (
                      <div key={event.id} className="bg-secondary-light/30 rounded-lg p-4 border-l-4 border-primary">
                        <div className="flex gap-3 mb-3">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-primary mb-1">{event.title}</h4>
                            <p className="text-sm text-text-secondary mb-1">{formatDate(eventDate)}</p>
                            {event.startTime && (
                              <p className="text-sm text-text-secondary mb-1">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </p>
                            )}
                            {event.location && (
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-text-secondary">📍 {event.location}</p>
                                <button
                                  onClick={() => handleGetDirections(event)}
                                  className="text-xs bg-accent-blue text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                >
                                  🗺️ Directions
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        {/* Export Options for Single Event */}
                        <div className="mb-3 flex gap-2">
                          <button
                            onClick={() => handleExportSingleEvent(event, 'ical')}
                            className="text-xs bg-accent-green text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                            title="Download iCal"
                          >
                            📱
                          </button>
                          <button
                            onClick={() => handleExportSingleEvent(event, 'google')}
                            className="text-xs bg-accent-blue text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                            title="Add to Google Calendar"
                          >
                            🌐
                          </button>
                          <button
                            onClick={() => handleExportSingleEvent(event, 'apple')}
                            className="text-xs bg-accent-gold text-text-primary px-2 py-1 rounded hover:bg-yellow-500 transition-colors"
                            title="Add to Apple Calendar"
                          >
                            🍎
                          </button>
                        </div>
                        
                        <div className="mb-3">
                          {userRSVP ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-text-secondary">
                                RSVP: {userRSVP.status.toUpperCase()}
                              </span>
                              <button 
                                onClick={() => handleRemoveRSVP(event.id)}
                                className="text-xs bg-accent-red text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleRSVP(event.id, RSVP_STATUS.YES)}
                                className="flex-1 bg-accent-green text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => handleRSVP(event.id, RSVP_STATUS.MAYBE)}
                                className="flex-1 bg-accent-gold text-text-primary px-3 py-2 rounded text-sm font-medium hover:bg-yellow-500 transition-colors duration-200"
                              >
                                Maybe
                              </button>
                              <button 
                                onClick={() => handleRSVP(event.id, RSVP_STATUS.NO)}
                                className="flex-1 bg-accent-red text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-xs text-text-secondary">
                          <span>RSVPs: {event.rsvpCount || 0}</span>
                          <span>Attended: {event.attendanceCount || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">No upcoming events.</p>
              )}
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white rounded-card shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">
                  Events on {formatDate(selectedDate)}
                </h3>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="bg-secondary-light/30 rounded-lg p-3">
                        <div className="flex gap-3">
                          <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                          <div>
                            <h4 className="font-semibold text-text-primary text-sm">{event.title}</h4>
                            {event.startTime && (
                              <p className="text-xs text-text-secondary">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </p>
                            )}
                            {event.location && (
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-text-secondary">📍 {event.location}</p>
                                <button
                                  onClick={() => handleGetDirections(event)}
                                  className="text-xs bg-accent-blue text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                >
                                  🗺️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-4">No events on this date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Directions Modal */}
      {showDirections && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Get Directions</h3>
            <div className="mb-4">
              <p className="text-text-secondary mb-2">Destination:</p>
              <p className="font-medium">{selectedEvent.location}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Travel Mode:
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {getTravelModeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleOpenDirections}
                className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
              >
                🗺️ Get Directions
              </button>
              <button
                onClick={() => setShowDirections(false)}
                className="flex-1 bg-secondary text-text-primary px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
