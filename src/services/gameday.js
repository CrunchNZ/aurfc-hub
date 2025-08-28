// GameDay Service for AURFC Hub
// Comprehensive match management, statistics tracking, and real-time updates

import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction,
  onSnapshot,
  limit,
  Timestamp
} from 'firebase/firestore';

// ============================================================================
// MATCH MANAGEMENT
// ============================================================================

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  HALF_TIME: 'half_time',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Period constants
export const PERIODS = {
  FIRST_HALF: 1,
  HALF_TIME: 'half_time',
  SECOND_HALF: 2,
  EXTRA_TIME: 'extra_time'
};

// Timer states
export const TIMER_STATES = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  HALF_TIME: 'half_time'
};

// Event types for statistics
export const EVENT_TYPES = {
  // Basic stats
  POSSESSION: 'possession',
  TERRITORY: 'territory',
  
  // Match events
  TRY: 'try',
  CONVERSION: 'conversion',
  PENALTY_GOAL: 'penalty_goal',
  DROP_GOAL: 'drop_goal',
  
  // Discipline
  PENALTY: 'penalty',
  ERROR: 'error',
  TURNOVER: 'turnover',
  YELLOW_CARD: 'yellow_card',
  RED_CARD: 'red_card',
  
  // Set pieces
  SCRUM: 'scrum',
  LINE_OUT: 'line_out',
  RUCK: 'ruck',
  MAUL: 'maul',
  BREAKDOWN: 'breakdown'
};

// Substitution reasons
export const SUBSTITUTION_REASONS = {
  TACTICAL: 'tactical',
  INJURY: 'injury',
  FATIGUE: 'fatigue',
  PERFORMANCE: 'performance',
  DISCIPLINARY: 'disciplinary'
};

/**
 * Create a new match
 * @param {Object} matchData - Match data
 * @returns {Promise<Object>} Created match
 */
export const createMatch = async (matchData) => {
  try {
    const matchId = `match-${Date.now()}`;
    const matchDoc = {
      id: matchId,
      teamId: matchData.teamId,
      teamName: matchData.teamName,
      opponent: matchData.opponent,
      date: matchData.date || new Date(),
      status: MATCH_STATUS.SCHEDULED,
      periods: [],
      currentPeriod: 1,
      matchTimer: {
        startTime: null,
        pausedTime: null,
        totalPaused: 0,
        currentTime: 0,
        state: TIMER_STATES.STOPPED
      },
      substitutions: [],
      statistics: {
        possession: { team: 0, opponent: 0 },
        territory: { team: 0, opponent: 0 },
        errors: { team: 0, opponent: 0 },
        penalties: { team: 0, opponent: 0 },
        turnovers: { team: 0, opponent: 0 },
        tries: { team: 0, opponent: 0 },
        conversions: { team: 0, opponent: 0 },
        penaltyGoals: { team: 0, opponent: 0 },
        dropGoals: { team: 0, opponent: 0 }
      },
      playerStats: {},
      startingXV: matchData.startingXV || [],
      substitutes: matchData.substitutes || [],
      createdBy: matchData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'matches', matchId), matchDoc);
    return { ...matchDoc, id: matchId };
  } catch (error) {
    console.error('Error creating match:', error);
    throw new Error('Failed to create match: ' + error.message);
  }
};

/**
 * Get match by ID
 * @param {string} matchId - Match ID
 * @returns {Promise<Object|null>} Match data or null
 */
export const getMatch = async (matchId) => {
  try {
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    
    if (matchDoc.exists()) {
      return { id: matchDoc.id, ...matchDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting match:', error);
    throw new Error('Failed to get match: ' + error.message);
  }
};

/**
 * Update match status
 * @param {string} matchId - Match ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateMatchStatus = async (matchId, status) => {
  try {
    await updateDoc(doc(db, 'matches', matchId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating match status:', error);
    throw new Error('Failed to update match status: ' + error.message);
  }
};

/**
 * Update match with any fields
 * @param {string} matchId - Match ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateMatch = async (matchId, updates) => {
  try {
    await updateDoc(doc(db, 'matches', matchId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating match:', error);
    throw new Error('Failed to update match: ' + error.message);
  }
};

/**
 * Get all matches for a team
 * @param {string} teamId - Team ID
 * @returns {Promise<Array>} Array of matches
 */
export const getTeamMatches = async (teamId) => {
  try {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('teamId', '==', teamId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(matchesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting team matches:', error);
    throw new Error('Failed to get team matches: ' + error.message);
  }
};

// ============================================================================
// MATCH TIMER MANAGEMENT
// ============================================================================

/**
 * Start match timer
 * @param {string} matchId - Match ID
 * @returns {Promise<void>}
 */
export const startMatchTimer = async (matchId) => {
  try {
    const now = new Date();
    await updateDoc(doc(db, 'matches', matchId), {
      'matchTimer.startTime': now,
      'matchTimer.state': TIMER_STATES.RUNNING,
      'matchTimer.pausedTime': null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error starting match timer:', error);
    throw new Error('Failed to start match timer: ' + error.message);
  }
};

/**
 * Pause match timer
 * @param {string} matchId - Match ID
 * @returns {Promise<void>}
 */
export const pauseMatchTimer = async (matchId) => {
  try {
    const now = new Date();
    await updateDoc(doc(db, 'matches', matchId), {
      'matchTimer.state': TIMER_STATES.PAUSED,
      'matchTimer.pausedTime': now,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error pausing match timer:', error);
    throw new Error('Failed to pause match timer: ' + error.message);
  }
};

/**
 * Resume match timer
 * @param {string} matchId - Match ID
 * @returns {Promise<void>}
 */
export const resumeMatchTimer = async (matchId) => {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const now = new Date();
    const pausedTime = match.matchTimer.pausedTime;
    const totalPaused = match.matchTimer.totalPaused + (now - pausedTime);
    
    await updateDoc(doc(db, 'matches', matchId), {
      'matchTimer.state': TIMER_STATES.RUNNING,
      'matchTimer.pausedTime': null,
      'matchTimer.totalPaused': totalPaused,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error resuming match timer:', error);
    throw new Error('Failed to resume match timer: ' + error.message);
  }
};

/**
 * End period
 * @param {string} matchId - Match ID
 * @param {number|string} period - Period number or 'half_time'
 * @returns {Promise<void>}
 */
export const endPeriod = async (matchId, period) => {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const now = new Date();
    const periodData = {
      period,
      startTime: match.matchTimer.startTime,
      endTime: now,
      duration: now - match.matchTimer.startTime - match.matchTimer.totalPaused
    };
    
    await updateDoc(doc(db, 'matches', matchId), {
      periods: arrayUnion(periodData),
      currentPeriod: period === 'half_time' ? 'half_time' : period + 1,
      'matchTimer.state': period === 'half_time' ? TIMER_STATES.HALF_TIME : TIMER_STATES.STOPPED,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error ending period:', error);
    throw new Error('Failed to end period: ' + error.message);
  }
};

// ============================================================================
// PLAYER MANAGEMENT & SUBSTITUTIONS
// ============================================================================

/**
 * Record player substitution
 * @param {string} matchId - Match ID
 * @param {Object} substitutionData - Substitution data
 * @returns {Promise<void>}
 */
export const recordSubstitution = async (matchId, substitutionData) => {
  try {
    const now = new Date();
    const substitution = {
      id: `sub-${Date.now()}`,
      playerId: substitutionData.playerId,
      playerName: substitutionData.playerName,
      position: substitutionData.position,
      timeOn: substitutionData.type === 'on' ? now : null,
      timeOff: substitutionData.type === 'off' ? now : null,
      period: substitutionData.period || 1,
      reason: substitutionData.reason || SUBSTITUTION_REASONS.TACTICAL,
      timestamp: now
    };
    
    await updateDoc(doc(db, 'matches', matchId), {
      substitutions: arrayUnion(substitution),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording substitution:', error);
    throw new Error('Failed to record substitution: ' + error.message);
  }
};

/**
 * Get player statistics for a match
 * @param {string} matchId - Match ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Player statistics
 */
export const getPlayerStats = async (matchId, playerId) => {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    return match.playerStats[playerId] || {
      timeOnField: 0,
      timeOnBench: 0,
      substitutions: 0,
      errors: 0,
      penalties: 0,
      tries: 0,
      conversions: 0
    };
  } catch (error) {
    console.error('Error getting player stats:', error);
    throw new Error('Failed to get player stats: ' + error.message);
  }
};

// ============================================================================
// STATISTICS TRACKING
// ============================================================================

/**
 * Record match event
 * @param {string} matchId - Match ID
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @returns {Promise<void>}
 */
export const recordEvent = async (matchId, eventType, eventData = {}) => {
  try {
    const now = new Date();
    const event = {
      id: `event-${Date.now()}`,
      type: eventType,
      timestamp: now,
      period: eventData.period || 1,
      playerId: eventData.playerId || null,
      playerName: eventData.playerName || null,
      details: eventData.details || {},
      ...eventData
    };
    
    // Update match statistics based on event type
    const statsUpdate = {};
    
    switch (eventType) {
      case EVENT_TYPES.POSSESSION:
        statsUpdate[`statistics.possession.${eventData.team || 'team'}`] = 
          (eventData.value || 0);
        break;
      case EVENT_TYPES.TERRITORY:
        statsUpdate[`statistics.territory.${eventData.team || 'team'}`] = 
          (eventData.value || 0);
        break;
      case EVENT_TYPES.TRY:
        statsUpdate['statistics.tries.team'] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
      case EVENT_TYPES.CONVERSION:
        statsUpdate['statistics.conversions.team'] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
      case EVENT_TYPES.PENALTY_GOAL:
        statsUpdate['statistics.penaltyGoals.team'] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
      case EVENT_TYPES.ERROR:
        statsUpdate[`statistics.errors.${eventData.team || 'team'}`] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
      case EVENT_TYPES.PENALTY:
        statsUpdate[`statistics.penalties.${eventData.team || 'team'}`] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
      case EVENT_TYPES.TURNOVER:
        statsUpdate[`statistics.turnovers.${eventData.team || 'team'}`] = 
          (eventData.team === 'opponent' ? 0 : 1);
        break;
    }
    
    // Update match with event and statistics
    await updateDoc(doc(db, 'matches', matchId), {
      events: arrayUnion(event),
      ...statsUpdate,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording event:', error);
    throw new Error('Failed to record event: ' + error.message);
  }
};

/**
 * Toggle possession
 * @param {string} matchId - Match ID
 * @param {string} team - 'team' or 'opponent'
 * @returns {Promise<void>}
 */
export const togglePossession = async (matchId, team = 'team') => {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const now = new Date();
    const currentStats = match.statistics?.possession || { team: false, opponent: false, teamStartTime: null, opponentStartTime: null, teamTotalTime: 0, opponentTotalTime: 0 };
    
    // Toggle possession for the specified team
    let updatedStats;
    if (team === 'team') {
      if (currentStats.team) {
        // Team had possession, now stopping it
        const teamTime = currentStats.teamStartTime ? (now - currentStats.teamStartTime.toDate()) : 0;
        updatedStats = {
          team: false,
          opponent: currentStats.opponent,
          teamStartTime: null,
          opponentStartTime: currentStats.opponentStartTime,
          teamTotalTime: currentStats.teamTotalTime + teamTime,
          opponentTotalTime: currentStats.opponentTotalTime
        };
      } else {
        // Team starting possession, stopping opponent if they had it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: true,
          opponent: false,
          teamStartTime: now,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      }
    } else {
      if (currentStats.opponent) {
        // Opponent had possession, now stopping it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: currentStats.team,
          opponent: false,
          teamStartTime: currentStats.teamStartTime,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      } else {
        // Opponent starting possession, stopping team if they had it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: false,
          opponent: true,
          teamStartTime: currentStats.teamStartTime,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      }
    }
    
    await updateDoc(doc(db, 'matches', matchId), {
      'statistics.possession': updatedStats,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling possession:', error);
    throw new Error('Failed to toggle possession: ' + error.message);
  }
};

/**
 * Toggle territory
 * @param {string} matchId - Match ID
 * @param {string} team - 'team' or 'opponent'
 * @returns {Promise<void>}
 */
export const toggleTerritory = async (matchId, team = 'team') => {
  try {
    const match = await getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const now = new Date();
    const currentStats = match.statistics?.territory || { team: false, opponent: false, teamStartTime: null, opponentStartTime: null, teamTotalTime: 0, opponentTotalTime: 0 };
    
    // Toggle territory for the specified team
    let updatedStats;
    if (team === 'team') {
      if (currentStats.team) {
        // Team had territory, now stopping it
        const teamTime = currentStats.teamStartTime ? (now - currentStats.teamStartTime.toDate()) : 0;
        updatedStats = {
          team: false,
          opponent: currentStats.opponent,
          teamStartTime: null,
          opponentStartTime: currentStats.opponentStartTime,
          teamTotalTime: currentStats.teamTotalTime + teamTime,
          opponentTotalTime: currentStats.opponentTotalTime
        };
      } else {
        // Team starting territory, stopping opponent if they had it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: true,
          opponent: false,
          teamStartTime: now,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      }
    } else {
      if (currentStats.opponent) {
        // Opponent had territory, now stopping it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: currentStats.team,
          opponent: false,
          teamStartTime: currentStats.teamStartTime,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      } else {
        // Opponent starting territory, stopping team if they had it
        const opponentTime = currentStats.opponentStartTime ? (now - currentStats.opponentStartTime.toDate()) : 0;
        updatedStats = {
          team: false,
          opponent: true,
          teamStartTime: currentStats.teamStartTime,
          opponentStartTime: null,
          teamTotalTime: currentStats.teamTotalTime,
          opponentTotalTime: currentStats.opponentTotalTime + opponentTime
        };
      }
    }
    
    await updateDoc(doc(db, 'matches', matchId), {
      'statistics.territory': updatedStats,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling territory:', error);
    throw new Error('Failed to toggle territory: ' + error.message);
  }
};

// ============================================================================
// REAL-TIME UPDATES
// ============================================================================

/**
 * Listen to match updates in real-time
 * @param {string} matchId - Match ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const listenToMatch = (matchId, callback) => {
  try {
    return onSnapshot(doc(db, 'matches', matchId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error setting up match listener:', error);
    throw new Error('Failed to set up match listener: ' + error.message);
  }
};

/**
 * Listen to team matches
 * @param {string} teamId - Team ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const listenToTeamMatches = (teamId, callback) => {
  try {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('teamId', '==', teamId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(matchesQuery, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(matches);
    });
  } catch (error) {
    console.error('Error setting up team matches listener:', error);
    throw new Error('Failed to set up team matches listener: ' + error.message);
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate match duration
 * @param {Object} match - Match data
 * @returns {number} Duration in milliseconds
 */
export const calculateMatchDuration = (match) => {
  if (!match.matchTimer.startTime) return 0;
  
  const now = new Date();
  const startTime = match.matchTimer.startTime.toDate();
  const totalPaused = match.matchTimer.totalPaused || 0;
  
  return now - startTime - totalPaused;
};

/**
 * Format match time
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time (MM:SS)
 */
export const formatMatchTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get current match period
 * @param {Object} match - Match data
 * @returns {string} Current period description
 */
export const getCurrentPeriodDescription = (match) => {
  switch (match.currentPeriod) {
    case 1:
      return '1st Half';
    case 'half_time':
      return 'Half Time';
    case 2:
      return '2nd Half';
    case 'extra_time':
      return 'Extra Time';
    default:
      return 'Unknown';
  }
};

/**
 * Calculate possession percentage
 * @param {Object} match - Match data
 * @returns {Object} Possession percentages for team and opponent
 */
export const calculatePossessionPercentage = (match) => {
  if (!match?.statistics?.possession) return { team: 0, opponent: 0 };
  
  const possession = match.statistics.possession;
  const now = new Date();
  
  // Calculate current session time
  let teamCurrentTime = possession.teamTotalTime || 0;
  let opponentCurrentTime = possession.opponentTotalTime || 0;
  
  if (possession.team && possession.teamStartTime) {
    teamCurrentTime += (now - possession.teamStartTime.toDate());
  }
  if (possession.opponent && possession.opponentStartTime) {
    opponentCurrentTime += (now - possession.opponentStartTime.toDate());
  }
  
  const totalTime = teamCurrentTime + opponentCurrentTime;
  if (totalTime === 0) return { team: 0, opponent: 0 };
  
  return {
    team: Math.round((teamCurrentTime / totalTime) * 100),
    opponent: Math.round((opponentCurrentTime / totalTime) * 100)
  };
};

/**
 * Calculate territory percentage
 * @param {Object} match - Match data
 * @returns {Object} Territory percentages for team and opponent
 */
export const calculateTerritoryPercentage = (match) => {
  if (!match?.statistics?.territory) return { team: 0, opponent: 0 };
  
  const territory = match.statistics.territory;
  const now = new Date();
  
  // Calculate current session time
  let teamCurrentTime = territory.teamTotalTime || 0;
  let opponentCurrentTime = territory.opponentTotalTime || 0;
  
  if (territory.team && territory.teamStartTime) {
    teamCurrentTime += (now - territory.teamStartTime.toDate());
  }
  if (territory.opponent && territory.opponentStartTime) {
    opponentCurrentTime += (now - territory.opponentStartTime.toDate());
  }
  
  const totalTime = teamCurrentTime + opponentCurrentTime;
  if (totalTime === 0) return { team: 0, opponent: 0 };
  
  return {
    team: Math.round((teamCurrentTime / totalTime) * 100),
    opponent: Math.round((opponentCurrentTime / totalTime) * 100)
  };
};

export default {
  // Match management
  createMatch,
  getMatch,
  updateMatchStatus,
  updateMatch,
  getTeamMatches,
  
  // Timer management
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  endPeriod,
  
  // Player management
  recordSubstitution,
  getPlayerStats,
  
  // Statistics
  recordEvent,
  togglePossession,
  toggleTerritory,
  
  // Real-time updates
  listenToMatch,
  listenToTeamMatches,
  
  // Utilities
  calculateMatchDuration,
  formatMatchTime,
  getCurrentPeriodDescription,
  calculatePossessionPercentage,
  calculateTerritoryPercentage,
  
  // Constants
  MATCH_STATUS,
  PERIODS,
  TIMER_STATES,
  EVENT_TYPES,
  SUBSTITUTION_REASONS
};
