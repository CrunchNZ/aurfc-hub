import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createEvent, rsvpEvent, trackAttendance, getUpcomingEvents } from '../services/scheduling';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  addDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  X,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function Calendar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'training',
    targetAudience: ['all'],
    maxAttendees: '',
    isRecurring: false,
    recurringPattern: 'weekly'
  });

  const [attendanceData, setAttendanceData] = useState({
    present: [],
    absent: [],
    late: []
  });

  const eventTypes = [
    { value: 'training', label: 'Training', color: '#3b82f6' },
    { value: 'match', label: 'Match', color: '#ef4444' },
    { value: 'meeting', label: 'Team Meeting', color: '#8b5cf6' },
    { value: 'social', label: 'Social Event', color: '#10b981' },
    { value: 'tournament', label: 'Tournament', color: '#f59e0b' }
  ];

  const audiences = [
    { value: 'all', label: 'All Members' },
    { value: 'senior', label: 'Senior Players' },
    { value: 'junior', label: 'Junior Players' },
    { value: 'coaches', label: 'Coaches' },
    { value: 'parents', label: 'Parents' }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadEvents();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filterType, searchTerm]);

  const loadEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('date', 'asc')
      );
      
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const eventData = {
        ...newEvent,
        date: Timestamp.fromDate(new Date(`${newEvent.date}T${newEvent.time}`)),
        createdBy: user.uid,
        createdAt: new Date(),
        attendees: [],
        rsvps: {
          going: [],
          notGoing: [],
          maybe: []
        }
      };

      await addDoc(collection(db, 'events'), eventData);
      
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'training',
        targetAudience: ['all'],
        maxAttendees: '',
        isRecurring: false,
        recurringPattern: 'weekly'
      });
      
      await loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  const handleRSVP = async (eventId, response) => {
    if (!user) return;

    try {
      await rsvpEvent(eventId, user.uid, response);
      await loadEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Error updating RSVP. Please try again.');
    }
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedEvent) return;

    try {
      await trackAttendance(selectedEvent.id, attendanceData);
      setShowAttendanceModal(false);
      setSelectedEvent(null);
      setAttendanceData({
        present: [],
        absent: [],
        late: []
      });
      await loadEvents();
    } catch (error) {
      console.error('Error tracking attendance:', error);
      alert('Error tracking attendance. Please try again.');
    }
  };

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
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType ? eventType.color : '#6b7280';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="page-header">
        <h1>Event Calendar</h1>
        <p>Manage training sessions, matches, and team events</p>
      </div>

      {/* Controls */}
      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button onClick={() => navigateMonth(-1)} className="btn-icon">
            <ChevronLeft size={16} />
          </button>
          <h2>{currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => navigateMonth(1)} className="btn-icon">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowEventModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`calendar-cell ${!date ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {date && (
                  <>
                    <div className="calendar-date">{date.getDate()}</div>
                    <div className="calendar-events">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="calendar-event"
                          style={{ backgroundColor: getEventTypeColor(event.type) }}
                          onClick={() => setSelectedEvent(event)}
                          title={`${event.title} - ${formatTime(event.date)}`}
                        >
                          <span className="event-title">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="more-events">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List View */}
      <div className="events-list-section">
        <h3>Upcoming Events</h3>
        <div className="events-list">
          {filteredEvents.filter(event => event.date >= new Date()).slice(0, 10).map(event => (
            <div key={event.id} className="event-card">
              <div className="event-indicator" style={{ backgroundColor: getEventTypeColor(event.type) }} />
              <div className="event-content">
                <div className="event-header">
                  <h4>{event.title}</h4>
                  <span className="event-type">{eventTypes.find(t => t.value === event.type)?.label}</span>
                </div>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span className="event-datetime">
                    <Clock size={14} />
                    {event.date.toLocaleDateString()} at {formatTime(event.date)}
                  </span>
                  <span className="event-location">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                  <span className="event-attendees">
                    <Users size={14} />
                    {event.rsvps?.going?.length || 0} going
                  </span>
                </div>
                <div className="event-actions">
                  <button
                    onClick={() => handleRSVP(event.id, 'going')}
                    className={`btn btn-sm ${event.rsvps?.going?.includes(user?.uid) ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleRSVP(event.id, 'maybe')}
                    className={`btn btn-sm ${event.rsvps?.maybe?.includes(user?.uid) ? 'btn-warning' : 'btn-outline'}`}
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRSVP(event.id, 'notGoing')}
                    className={`btn btn-sm ${event.rsvps?.notGoing?.includes(user?.uid) ? 'btn-danger' : 'btn-outline'}`}
                  >
                    Can't Go
                  </button>
                  {user && event.createdBy === user.uid && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowAttendanceModal(true);
                      }}
                      className="btn btn-sm btn-outline"
                    >
                      <CheckCircle size={14} />
                      Track Attendance
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button onClick={() => setShowEventModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="form-group">
                  <label>Event Type *</label>
                  <select
                    required
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Event description..."
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Event location"
                  />
                </div>
                
                <div className="form-group">
                  <label>Max Attendees</label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                    placeholder="Leave blank for unlimited"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEventModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Track Attendance - {selectedEvent.title}</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-content">
              <p>Mark attendance for participants:</p>
              <div className="attendance-form">
                <div className="form-group">
                  <label>Present (comma-separated user IDs)</label>
                  <textarea
                    value={attendanceData.present.join(', ')}
                    onChange={(e) => setAttendanceData({
                      ...attendanceData,
                      present: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                    })}
                    placeholder="Enter user IDs of present attendees"
                  />
                </div>
                <div className="form-group">
                  <label>Absent (comma-separated user IDs)</label>
                  <textarea
                    value={attendanceData.absent.join(', ')}
                    onChange={(e) => setAttendanceData({
                      ...attendanceData,
                      absent: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                    })}
                    placeholder="Enter user IDs of absent attendees"
                  />
                </div>
                <div className="form-group">
                  <label>Late (comma-separated user IDs)</label>
                  <textarea
                    value={attendanceData.late.join(', ')}
                    onChange={(e) => setAttendanceData({
                      ...attendanceData,
                      late: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                    })}
                    placeholder="Enter user IDs of late attendees"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowAttendanceModal(false)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleAttendanceSubmit} className="btn btn-primary">
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;