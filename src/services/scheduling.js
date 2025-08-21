import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { notifyNewEvent } from './announcements';

// Scheduling Service for AURFC Hub
// Handles events, calendar, RSVP, and attendance tracking

// Event types
export const EVENT_TYPES = {
  TRAINING: 'training',
  MATCH: 'match',
  MEETING: 'meeting',
  SOCIAL: 'social',
  FUNDRAISING: 'fundraising',
  TOURNAMENT: 'tournament'
};

// Event status
export const EVENT_STATUS = {
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  POSTPONED: 'postponed'
};

// RSVP status
export const RSVP_STATUS = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe'
};

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

// Create a new event
export const createEvent = async (eventData, creatorUser) => {
  try {
    const event = {
      ...eventData,
      createdBy: creatorUser.uid,
      createdByName: creatorUser.displayName || 'Unknown',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: EVENT_STATUS.SCHEDULED,
      rsvps: {},
      attendance: {},
      attendanceCount: 0,
      rsvpCount: 0,
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'events'), event);
    
    // Send notification about new event
    if (event.sendNotification !== false) {
      await notifyNewEvent({
        id: docRef.id,
        title: event.title,
        date: event.date,
        type: event.type
      }, event.targetRoles || ['all']);
    }
    
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get event by ID
export const getEvent = async (eventId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Get events with filtering options
export const getEvents = (callback, filters = {}) => {
  try {
    let q = query(collection(db, 'events'));
    
    // Apply filters
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.teamId) {
      q = query(q, where('teamId', '==', filters.teamId));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, where('date', '>=', filters.startDate), where('date', '<=', filters.endDate));
    } else if (filters.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }
    
    // Order by date
    q = query(q, orderBy('date', 'asc'));
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(events);
    });
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// Get events for a specific user role
export const getEventsForRole = (userRole, callback, filters = {}) => {
  try {
    let q = query(collection(db, 'events'));
    
    // Apply base filters
    q = query(q, where('isActive', '==', true));
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    q = query(q, orderBy('date', 'asc'));
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => {
          // Include if no specific target roles or if user's role is included
          return !event.targetRoles || 
                 event.targetRoles.length === 0 ||
                 event.targetRoles.includes('all') ||
                 event.targetRoles.includes(userRole);
        });
      
      callback(events);
    });
  } catch (error) {
    console.error('Error getting events for role:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (eventId, updates) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { id: eventId, ...updates };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Cancel event
export const cancelEvent = async (eventId, reason) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      status: EVENT_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling event:', error);
    throw error;
  }
};

// ============================================================================
// RSVP MANAGEMENT
// ============================================================================

// RSVP to an event
export const rsvpEvent = async (eventId, userId, status, notes = '') => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const event = eventDoc.data();
      const currentRsvps = event.rsvps || {};
      
      // Update RSVP
      currentRsvps[userId] = {
        status,
        notes,
        timestamp: serverTimestamp()
      };
      
      // Count RSVPs
      const rsvpCount = Object.keys(currentRsvps).length;
      
      await updateDoc(eventRef, {
        rsvps: currentRsvps,
        rsvpCount,
        updatedAt: serverTimestamp()
      });
      
      return currentRsvps[userId];
    } else {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};

// Remove RSVP from an event
export const removeRsvp = async (eventId, userId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const event = eventDoc.data();
      const currentRsvps = event.rsvps || {};
      
      delete currentRsvps[userId];
      
      const rsvpCount = Object.keys(currentRsvps).length;
      
      await updateDoc(eventRef, {
        rsvps: currentRsvps,
        rsvpCount,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error removing RSVP:', error);
    throw error;
  }
};

// Get event RSVPs
export const getEventRsvps = async (eventId) => {
  try {
    const event = await getEvent(eventId);
    if (!event) return {};
    
    return event.rsvps || {};
  } catch (error) {
    console.error('Error getting event RSVPs:', error);
    throw error;
  }
};

// ============================================================================
// ATTENDANCE TRACKING
// ============================================================================

// Track attendance for an event
export const trackAttendance = async (eventId, attendanceData) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const event = eventDoc.data();
      const currentAttendance = event.attendance || {};
      
      // Merge attendance data
      Object.assign(currentAttendance, attendanceData);
      
      // Count attendance
      const attendanceCount = Object.values(currentAttendance).filter(status => status === 'present').length;
      
      await updateDoc(eventRef, {
        attendance: currentAttendance,
        attendanceCount,
        updatedAt: serverTimestamp()
      });
      
      return currentAttendance;
    } else {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error tracking attendance:', error);
    throw error;
  }
};

// Mark individual attendance
export const markAttendance = async (eventId, userId, status, notes = '') => {
  try {
    const attendanceData = {
      [userId]: {
        status, // 'present', 'absent', 'late'
        notes,
        timestamp: serverTimestamp()
      }
    };
    
    return await trackAttendance(eventId, attendanceData);
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

// Get event attendance
export const getEventAttendance = async (eventId) => {
  try {
    const event = await getEvent(eventId);
    if (!event) return {};
    
    return event.attendance || {};
  } catch (error) {
    console.error('Error getting event attendance:', error);
    throw error;
  }
};

// ============================================================================
// CALENDAR UTILITIES
// ============================================================================

// Get events for a specific month
export const getEventsForMonth = (year, month, callback, userRole = null) => {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    const filters = {
      startDate,
      endDate,
      isActive: true
    };
    
    if (userRole) {
      return getEventsForRole(userRole, callback, filters);
    } else {
      return getEvents(callback, filters);
    }
  } catch (error) {
    console.error('Error getting events for month:', error);
    throw error;
  }
};

// Get upcoming events
export const getUpcomingEvents = (callback, userRole = null, limitCount = 10) => {
  try {
    const now = new Date();
    const filters = {
      startDate: now,
      limit: limitCount,
      isActive: true,
      status: EVENT_STATUS.SCHEDULED
    };
    
    if (userRole) {
      return getEventsForRole(userRole, callback, filters);
    } else {
      return getEvents(callback, filters);
    }
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};

// Helper function to create common event types
export const createTrainingEvent = async (trainingData, creatorUser) => {
  const event = {
    title: trainingData.title || 'Training Session',
    description: trainingData.description || '',
    type: EVENT_TYPES.TRAINING,
    date: trainingData.date,
    startTime: trainingData.startTime,
    endTime: trainingData.endTime,
    location: trainingData.location || 'Club Grounds',
    teamId: trainingData.teamId,
    targetRoles: trainingData.targetRoles || ['player', 'coach'],
    maxAttendees: trainingData.maxAttendees || null,
    equipment: trainingData.equipment || [],
    notes: trainingData.notes || ''
  };
  
  return await createEvent(event, creatorUser);
};

export const createMatchEvent = async (matchData, creatorUser) => {
  const event = {
    title: `${matchData.homeTeam} vs ${matchData.awayTeam}`,
    description: matchData.description || '',
    type: EVENT_TYPES.MATCH,
    date: matchData.date,
    startTime: matchData.startTime,
    endTime: matchData.endTime,
    location: matchData.venue,
    teamId: matchData.teamId,
    targetRoles: ['player', 'coach', 'parent'],
    opponent: matchData.awayTeam,
    isHomeGame: matchData.isHomeGame || false,
    competition: matchData.competition || '',
    notes: matchData.notes || ''
  };
  
  return await createEvent(event, creatorUser);
}; 