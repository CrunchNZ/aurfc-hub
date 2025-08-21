import React, { useState, useEffect, useContext } from 'react';
import { 
  createEvent,
  getEventsForMonth,
  getUpcomingEvents,
  rsvpEvent,
  removeRsvp,
  EVENT_TYPES,
  RSVP_STATUS
} from '../services/scheduling';
import { AuthContext } from '../contexts/AuthContext';
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

  const { user } = useContext(AuthContext);

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
      
      // Get events for current month
      const unsubscribeMonthEvents = getEventsForMonth(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        (monthEvents) => {
          setEvents(monthEvents);
          setLoading(false);
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
        unsubscribeMonthEvents();
        unsubscribeUpcoming();
      };
    }
  }, [user, userRole, currentDate]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setError('');
      await createEvent({
        ...newEventForm,
        date: new Date(newEventForm.date + 'T' + newEventForm.startTime)
      }, user);
      
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
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    }
  };

  const handleRSVP = async (eventId, status) => {
    if (!user) return;
    
    try {
      setError('');
      await rsvpEvent(eventId, user.uid, status);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      setError('Failed to RSVP. Please try again.');
    }
  };

  const handleRemoveRSVP = async (eventId) => {
    if (!user) return;
    
    try {
      setError('');
      await removeRsvp(eventId, user.uid);
    } catch (error) {
      console.error('Error removing RSVP:', error);
      setError('Failed to remove RSVP. Please try again.');
    }
  };

  // Calendar utility functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case EVENT_TYPES.TRAINING:
        return '🏃';
      case EVENT_TYPES.MATCH:
        return '🏉';
      case EVENT_TYPES.MEETING:
        return '👥';
      case EVENT_TYPES.SOCIAL:
        return '🎉';
      case EVENT_TYPES.FUNDRAISING:
        return '💰';
      case EVENT_TYPES.TOURNAMENT:
        return '🏆';
      default:
        return '📅';
    }
  };

  const getUserRSVP = (event) => {
    if (!user || !event.rsvps) return null;
    return event.rsvps[user.uid];
  };

  const canCreateEvents = userRole === 'coach' || userRole === 'admin';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!user) {
    return (
      <div className="calendar-container">
        <div className="login-message">
          Please log in to view the calendar.
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="nav-btn"
          >
            ← Previous
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="nav-btn"
          >
            Next →
          </button>
        </div>
        
        {canCreateEvents && (
          <button 
            onClick={() => setShowCreateEvent(!showCreateEvent)}
            className="create-event-btn"
          >
            {showCreateEvent ? 'Cancel' : 'Create Event'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateEvent && (
        <div className="create-event-form">
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Event title"
                value={newEventForm.title}
                onChange={(e) => setNewEventForm({...newEventForm, title: e.target.value})}
                required
              />
              <select
                value={newEventForm.type}
                onChange={(e) => setNewEventForm({...newEventForm, type: e.target.value})}
              >
                <option value={EVENT_TYPES.TRAINING}>Training</option>
                <option value={EVENT_TYPES.MATCH}>Match</option>
                <option value={EVENT_TYPES.MEETING}>Meeting</option>
                <option value={EVENT_TYPES.SOCIAL}>Social</option>
                <option value={EVENT_TYPES.FUNDRAISING}>Fundraising</option>
                <option value={EVENT_TYPES.TOURNAMENT}>Tournament</option>
              </select>
            </div>
            
            <div className="form-row">
              <input
                type="date"
                value={newEventForm.date}
                onChange={(e) => setNewEventForm({...newEventForm, date: e.target.value})}
                required
              />
              <input
                type="time"
                placeholder="Start time"
                value={newEventForm.startTime}
                onChange={(e) => setNewEventForm({...newEventForm, startTime: e.target.value})}
                required
              />
            </div>
            
            <input
              type="text"
              placeholder="Location"
              value={newEventForm.location}
              onChange={(e) => setNewEventForm({...newEventForm, location: e.target.value})}
            />
            
            <textarea
              placeholder="Event description"
              value={newEventForm.description}
              onChange={(e) => setNewEventForm({...newEventForm, description: e.target.value})}
              rows="3"
            />
            
            <button type="submit">Create Event</button>
          </form>
        </div>
      )}

      <div className="calendar-content">
        <div className="calendar-grid">
          <div className="calendar-header-row">
            {dayNames.map(day => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
          </div>
          
          <div className="calendar-body">
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
              const isToday = day && day.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${!day ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className="day-number">{day.getDate()}</div>
                      {dayEvents.length > 0 && (
                        <div className="day-events">
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className={`event-dot ${event.type}`}>
                              {getEventTypeIcon(event.type)}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="more-events">+{dayEvents.length - 2}</div>
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

        <div className="calendar-sidebar">
          <div className="upcoming-events">
            <h3>Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              <div className="events-list">
                {upcomingEvents.map(event => {
                  const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
                  const userRSVP = getUserRSVP(event);
                  
                  return (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <span className="event-icon">{getEventTypeIcon(event.type)}</span>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <p>{formatDate(eventDate)}</p>
                          {event.startTime && (
                            <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                          )}
                          {event.location && <p>📍 {event.location}</p>}
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                      
                      <div className="event-actions">
                        {userRSVP ? (
                          <div className="rsvp-status">
                            <span>RSVP: {userRSVP.status.toUpperCase()}</span>
                            <button 
                              onClick={() => handleRemoveRSVP(event.id)}
                              className="remove-rsvp-btn"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="rsvp-buttons">
                            <button 
                              onClick={() => handleRSVP(event.id, RSVP_STATUS.YES)}
                              className="rsvp-btn yes"
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => handleRSVP(event.id, RSVP_STATUS.MAYBE)}
                              className="rsvp-btn maybe"
                            >
                              Maybe
                            </button>
                            <button 
                              onClick={() => handleRSVP(event.id, RSVP_STATUS.NO)}
                              className="rsvp-btn no"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="event-stats">
                        <span>RSVPs: {event.rsvpCount || 0}</span>
                        <span>Attended: {event.attendanceCount || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No upcoming events.</p>
            )}
          </div>

          {selectedDate && (
            <div className="selected-date-events">
              <h3>Events on {formatDate(selectedDate)}</h3>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="events-list">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <span className="event-icon">{getEventTypeIcon(event.type)}</span>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          {event.startTime && (
                            <p>{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                          )}
                          {event.location && <p>📍 {event.location}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No events on this date.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .calendar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }

        .calendar-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-btn {
          padding: 0.5rem 1rem;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .nav-btn:hover {
          background: #e0e0e0;
        }

        .current-month {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .create-event-btn {
          padding: 0.75rem 1.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .create-event-btn:hover {
          background: #1976d2;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .login-message {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        }

        .create-event-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .create-event-form h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .create-event-form input,
        .create-event-form select,
        .create-event-form textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          margin-bottom: 1rem;
        }

        .create-event-form button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }

        .create-event-form button:hover {
          background: #1976d2;
        }

        .calendar-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .calendar-grid {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .calendar-header-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f5f5f5;
        }

        .day-header {
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #666;
          border-bottom: 1px solid #ddd;
        }

        .calendar-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          min-height: 100px;
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
          border-right: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }

        .calendar-day:hover {
          background: #f8f9fa;
        }

        .calendar-day.empty {
          cursor: default;
        }

        .calendar-day.selected {
          background: #e3f2fd;
        }

        .calendar-day.today {
          background: #fff3e0;
          border: 2px solid #ff9800;
        }

        .day-number {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .day-events {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .event-dot {
          font-size: 0.75rem;
          padding: 0.125rem;
          border-radius: 2px;
        }

        .more-events {
          font-size: 0.75rem;
          color: #666;
        }

        .calendar-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .upcoming-events,
        .selected-date-events {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .upcoming-events h3,
        .selected-date-events h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid #2196f3;
        }

        .event-header {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .event-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .event-info h4 {
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .event-info p {
          margin: 0.125rem 0;
          font-size: 0.875rem;
          color: #666;
        }

        .event-description {
          font-size: 0.875rem;
          color: #666;
          margin: 0.5rem 0;
          line-height: 1.4;
        }

        .event-actions {
          margin: 0.75rem 0;
        }

        .rsvp-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .rsvp-btn {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .rsvp-btn.yes {
          background: #4caf50;
          color: white;
        }

        .rsvp-btn.maybe {
          background: #ff9800;
          color: white;
        }

        .rsvp-btn.no {
          background: #f44336;
          color: white;
        }

        .rsvp-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .remove-rsvp-btn {
          padding: 0.25rem 0.5rem;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .event-stats {
          font-size: 0.875rem;
          color: #666;
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 1rem;
          }

          .calendar-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .calendar-navigation {
            justify-content: center;
          }

          .calendar-content {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .calendar-day {
            min-height: 80px;
          }

          .rsvp-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Calendar;
