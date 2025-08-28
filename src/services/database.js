// Database Service Layer for AURFC Hub
// This service handles all Firestore database operations

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

// Helper function to add timestamps
const addTimestamps = (data) => ({
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

const updateTimestamp = (data) => ({
  ...data,
  updatedAt: serverTimestamp()
});

// ============================================================================
// USERS COLLECTION
// ============================================================================

export const usersService = {
  // Create a new user
  async createUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, addTimestamps(userData));
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUser(userId) {
    try {
      console.log('Database: Getting user with ID:', userId);
      const userRef = doc(db, 'users', userId);
      console.log('Database: User reference created');
      
      const userSnap = await getDoc(userRef);
      console.log('Database: User snapshot retrieved, exists:', userSnap.exists());
      
      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() };
        console.log('Database: User data:', userData);
        return userData;
      }
      
      console.log('Database: User document does not exist');
      return null;
    } catch (error) {
      console.error('Database: Error getting user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateTimestamp(updates));
      return { id: userId, ...updates };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  },

  // Get users by team
  async getUsersByTeam(teamId) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('teamPreference', '==', teamId), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users by team:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchTerm, filters = {}) {
    try {
      let q = collection(db, 'users');
      
      // Apply filters
      if (filters.role) {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side search for name/email
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return users.filter(user => 
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      return { id: userId, role: newRole };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  async deleteUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: userId, isActive: false };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// ============================================================================
// TEAMS COLLECTION
// ============================================================================

export const teamsService = {
  // Create a new team
  async createTeam(teamData) {
    try {
      const teamsRef = collection(db, 'teams');
      const docRef = await addDoc(teamsRef, addTimestamps(teamData));
      return { id: docRef.id, ...teamData };
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  // Get team by ID
  async getTeam(teamId) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);
      
      if (teamSnap.exists()) {
        return { id: teamSnap.id, ...teamSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting team:', error);
      throw error;
    }
  },

  // Update team
  async updateTeam(teamId, updates) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, updateTimestamp(updates));
      return { id: teamId, ...updates };
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Get all teams
  async getAllTeams(filters = {}) {
    try {
      let q = collection(db, 'teams');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  },

  // Add player to team
  async addPlayerToTeam(teamId, playerId) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        playerIds: arrayUnion(playerId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding player to team:', error);
      throw error;
    }
  },

  // Remove player from team
  async removePlayerFromTeam(teamId, playerId) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        playerIds: arrayRemove(playerId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing player from team:', error);
      throw error;
    }
  }
};

// ============================================================================
// EVENTS COLLECTION
// ============================================================================

export const eventsService = {
  // Create a new event
  async createEvent(eventData) {
    try {
      const eventsRef = collection(db, 'events');
      const docRef = await addDoc(eventsRef, addTimestamps(eventData));
      return { id: docRef.id, ...eventData };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get event by ID
  async getEvent(eventId) {
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
  },

  // Update event
  async updateEvent(eventId, updates) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, updateTimestamp(updates));
      return { id: eventId, ...updates };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Get events by team
  async getEventsByTeam(teamId, filters = {}) {
    try {
      let q = collection(db, 'events');
      q = query(q, where('teamIds', 'array-contains', teamId));
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      
      q = query(q, orderBy('startTime', 'asc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting events by team:', error);
      throw error;
    }
  },

  // RSVP to event
  async rsvpToEvent(eventId, userId, response) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const event = await getDoc(eventRef);
      
      if (!event.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = event.data();
      const updates = { updatedAt: serverTimestamp() };
      
      // Remove user from all RSVP arrays first
      if (eventData.rsvps?.confirmed) {
        updates['rsvps.confirmed'] = arrayRemove(userId);
      }
      if (eventData.rsvps?.declined) {
        updates['rsvps.declined'] = arrayRemove(userId);
      }
      if (eventData.rsvps?.pending) {
        updates['rsvps.pending'] = arrayRemove(userId);
      }
      
      // Add user to appropriate RSVP array
      if (response === 'confirm') {
        updates['rsvps.confirmed'] = arrayUnion(userId);
      } else if (response === 'decline') {
        updates['rsvps.declined'] = arrayUnion(userId);
      } else {
        updates['rsvps.pending'] = arrayUnion(userId);
      }
      
      await updateDoc(eventRef, updates);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  },

  // Mark attendance
  async markAttendance(eventId, userId, status) {
    try {
      const eventRef = doc(db, 'events', eventId);
      const event = await getDoc(eventRef);
      
      if (!event.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = event.data();
      const updates = { updatedAt: serverTimestamp() };
      
      // Remove user from all attendance arrays first
      if (eventData.attendance?.present) {
        updates['attendance.present'] = arrayRemove(userId);
      }
      if (eventData.attendance?.absent) {
        updates['attendance.absent'] = arrayRemove(userId);
      }
      if (eventData.attendance?.late) {
        updates['attendance.late'] = arrayRemove(userId);
      }
      
      // Add user to appropriate attendance array
      if (status === 'present') {
        updates['attendance.present'] = arrayUnion(userId);
      } else if (status === 'absent') {
        updates['attendance.absent'] = arrayUnion(userId);
      } else if (status === 'late') {
        updates['attendance.late'] = arrayUnion(userId);
      }
      
      await updateDoc(eventRef, updates);
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }
};

// ============================================================================
// PERFORMANCES COLLECTION
// ============================================================================

export const performancesService = {
  // Create performance record
  async createPerformance(performanceData) {
    try {
      const performancesRef = collection(db, 'performances');
      const docRef = await addDoc(performancesRef, addTimestamps(performanceData));
      return { id: docRef.id, ...performanceData };
    } catch (error) {
      console.error('Error creating performance:', error);
      throw error;
    }
  },

  // Get performance by ID
  async getPerformance(performanceId) {
    try {
      const performanceRef = doc(db, 'performances', performanceId);
      const performanceSnap = await getDoc(performanceRef);
      
      if (performanceSnap.exists()) {
        return { id: performanceSnap.id, ...performanceSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting performance:', error);
      throw error;
    }
  },

  // Update performance
  async updatePerformance(performanceId, updates) {
    try {
      const performanceRef = doc(db, 'performances', performanceId);
      await updateDoc(performanceRef, updateTimestamp(updates));
      return { id: performanceId, ...updates };
    } catch (error) {
      console.error('Error updating performance:', error);
      throw error;
    }
  },

  // Get performances by player
  async getPerformancesByPlayer(playerId, limit = 10) {
    try {
      const performancesRef = collection(db, 'performances');
      const q = query(
        performancesRef, 
        where('playerId', '==', playerId),
        orderBy('date', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting performances by player:', error);
      throw error;
    }
  },

  // Get performances by team
  async getPerformancesByTeam(teamId, filters = {}) {
    try {
      let q = collection(db, 'performances');
      q = query(q, where('teamId', '==', teamId));
      
      if (filters.startDate) {
        q = query(q, where('date', '>=', filters.startDate));
      }
      if (filters.endDate) {
        q = query(q, where('date', '<=', filters.endDate));
      }
      
      q = query(q, orderBy('date', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting performances by team:', error);
      throw error;
    }
  }
};

// ============================================================================
// DRILLS COLLECTION
// ============================================================================

export const drillsService = {
  // Create drill
  async createDrill(drillData) {
    try {
      const drillsRef = collection(db, 'drills');
      const docRef = await addDoc(drillsRef, addTimestamps(drillData));
      return { id: docRef.id, ...drillData };
    } catch (error) {
      console.error('Error creating drill:', error);
      throw error;
    }
  },

  // Get drill by ID
  async getDrill(drillId) {
    try {
      const drillRef = doc(db, 'drills', drillId);
      const drillSnap = await getDoc(drillRef);
      
      if (drillSnap.exists()) {
        return { id: drillSnap.id, ...drillSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting drill:', error);
      throw error;
    }
  },

  // Update drill
  async updateDrill(drillId, updates) {
    try {
      const drillRef = doc(db, 'drills', drillId);
      await updateDoc(drillRef, updateTimestamp(updates));
      return { id: drillId, ...updates };
    } catch (error) {
      console.error('Error updating drill:', error);
      throw error;
    }
  },

  // Get drills by category
  async getDrillsByCategory(category, difficulty = null) {
    try {
      let q = collection(db, 'drills');
      q = query(q, where('category', '==', category));
      
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty));
      }
      
      q = query(q, orderBy('name', 'asc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting drills by category:', error);
      throw error;
    }
  },

  // Search drills
  async searchDrills(searchTerm, filters = {}) {
    try {
      let q = collection(db, 'drills');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', filters.isPublic));
      }
      
      const querySnapshot = await getDocs(q);
      const drills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side search for name/description
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return drills.filter(drill => 
          drill.name?.toLowerCase().includes(searchLower) ||
          drill.description?.toLowerCase().includes(searchLower) ||
          drill.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return drills;
    } catch (error) {
      console.error('Error searching drills:', error);
      throw error;
    }
  }
};

// ============================================================================
// BADGES COLLECTION
// ============================================================================

export const badgesService = {
  // Create badge
  async createBadge(badgeData) {
    try {
      const badgesRef = collection(db, 'badges');
      const docRef = await addDoc(badgesRef, addTimestamps(badgeData));
      return { id: docRef.id, ...badgeData };
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  },

  // Get badge by ID
  async getBadge(badgeId) {
    try {
      const badgeRef = doc(db, 'badges', badgeId);
      const badgeSnap = await getDoc(badgeRef);
      
      if (badgeSnap.exists()) {
        return { id: badgeSnap.id, ...badgeSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting badge:', error);
      throw error;
    }
  },

  // Get all active badges
  async getActiveBadges() {
    try {
      const badgesRef = collection(db, 'badges');
      const q = query(badgesRef, where('isActive', '==', true), orderBy('name', 'asc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active badges:', error);
      throw error;
    }
  },

  // Award badge to user
  async awardBadgeToUser(userId, badgeId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        badges: arrayUnion(badgeId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error awarding badge to user:', error);
      throw error;
    }
  }
};



// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export default {
  users: usersService,
  teams: teamsService,
  events: eventsService,
  performances: performancesService,
  drills: drillsService,
  badges: badgesService
};
