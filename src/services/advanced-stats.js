// Advanced Statistics Service for AURFC Hub
// Comprehensive data management, validation, and analytics

import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
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
  Timestamp,
  increment
} from 'firebase/firestore';

// ============================================================================
// DATA STRUCTURES & VALIDATION
// ============================================================================

// Comprehensive match statistics structure
export const MATCH_STATISTICS_SCHEMA = {
  // Basic match info
  matchId: 'string',
  teamId: 'string',
  opponent: 'string',
  date: 'timestamp',
  status: 'string',
  
  // Timer and periods
  matchTimer: {
    startTime: 'timestamp',
    pausedTime: 'timestamp',
    totalPaused: 'number',
    currentTime: 'number',
    state: 'string'
  },
  
  // Core statistics
  statistics: {
    // Possession tracking (time-based)
    possession: {
      team: 'number',        // 0 or 1 (toggle)
      opponent: 'number',    // 0 or 1 (toggle)
      teamStartTime: 'timestamp',
      opponentStartTime: 'timestamp',
      teamTotalTime: 'number',
      opponentTotalTime: 'number'
    },
    
    // Territory tracking (time-based)
    territory: {
      team: 'number',        // 0 or 1 (toggle)
      opponent: 'number',    // 0 or 1 (toggle)
      teamStartTime: 'timestamp',
      opponentStartTime: 'timestamp',
      teamTotalTime: 'number',
      opponentTotalTime: 'number'
    },
    
    // Counters
    errors: { team: 'number', opponent: 'number' },
    penalties: { team: 'number', opponent: 'number' },
    turnovers: { team: 'number', opponent: 'number' },
    
    // Scoring
    tries: { team: 'number', opponent: 'number' },
    conversions: { team: 'number', opponent: 'number' },
    penaltyGoals: { team: 'number', opponent: 'number' },
    dropGoals: { team: 'number', opponent: 'number' },
    
    // Set pieces
    scrums: { team: 'number', opponent: 'number' },
    lineOuts: { team: 'number', opponent: 'number' },
    rucks: { team: 'number', opponent: 'number' },
    mauls: { team: 'number', opponent: 'number' }
  },
  
  // Player statistics
  playerStats: {
    // Each player has their own stats object
    [playerId]: {
      playerId: 'string',
      playerName: 'string',
      position: 'string',
      timeOnField: 'number',
      timeOnBench: 'number',
      tries: 'number',
      conversions: 'number',
      penaltyGoals: 'number',
      dropGoals: 'number',
      errors: 'number',
      penalties: 'number',
      turnovers: 'number'
    }
  },
  
  // Events log
  events: [
    {
      id: 'string',
      type: 'string',
      timestamp: 'timestamp',
      period: 'number',
      playerId: 'string',
      playerName: 'string',
      team: 'string',
      details: 'object'
    }
  ],
  
  // Team formation
  currentXV: [
    {
      id: 'string',
      firstName: 'string',
      lastName: 'string',
      position: 'string',
      positionName: 'string',
      profileImage: 'string'
    }
  ],
  
  substitutes: [
    {
      id: 'string',
      firstName: 'string',
      lastName: 'string',
      position: 'string',
      positionName: 'string',
      profileImage: 'string'
    }
  ]
};

// ============================================================================
// ADVANCED STATISTICS FUNCTIONS
// ============================================================================

/**
 * Update match statistics with validation and rollback
 * @param {string} matchId - Match ID
 * @param {Object} updates - Statistics updates
 * @returns {Promise<Object>} Updated match data
 */
export const updateMatchStatistics = async (matchId, updates) => {
  try {
    console.log('🔄 Updating match statistics:', { matchId, updates });
    
    // Get current match data
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const currentMatch = matchDoc.data();
    
    // Validate updates structure
    const validatedUpdates = validateStatisticsUpdates(updates);
    
    // Create updated statistics object
    const updatedStatistics = {
      ...currentMatch.statistics,
      ...validatedUpdates
    };
    
    // Update the match document
    await updateDoc(matchRef, {
      statistics: updatedStatistics,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Match statistics updated successfully');
    
    // Return updated match data
    return {
      ...currentMatch,
      statistics: updatedStatistics,
      updatedAt: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error updating match statistics:', error);
    throw new Error(`Failed to update match statistics: ${error.message}`);
  }
};

/**
 * Record a match event with full validation
 * @param {string} matchId - Match ID
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
export const recordMatchEvent = async (matchId, eventType, eventData) => {
  try {
    console.log('📝 Recording match event:', { matchId, eventType, eventData });
    
    // Validate event data
    const validatedEvent = validateEventData(eventType, eventData);
    
    // Create event object
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: serverTimestamp(),
      period: eventData.period || 1,
      playerId: eventData.playerId || null,
      playerName: eventData.playerName || null,
      team: eventData.team || 'team',
      details: eventData.details || {},
      ...validatedEvent
    };
    
    // Update match document with event and statistics
    const matchRef = doc(db, 'matches', matchId);
    
    // Use transaction for atomic update
    await runTransaction(db, async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const currentMatch = matchDoc.data();
      const currentStatistics = currentMatch.statistics || {};
      
      // Update statistics based on event type
      const updatedStatistics = updateStatisticsFromEvent(
        currentStatistics, 
        eventType, 
        eventData
      );
      
      // Update player statistics if player is involved
      const updatedPlayerStats = updatePlayerStatsFromEvent(
        currentMatch.playerStats || {},
        eventType,
        eventData
      );
      
      // Update the match document
      transaction.update(matchRef, {
        events: arrayUnion(event),
        statistics: updatedStatistics,
        playerStats: updatedPlayerStats,
        updatedAt: serverTimestamp()
      });
    });
    
    console.log('✅ Match event recorded successfully');
    return event;
    
  } catch (error) {
    console.error('❌ Error recording match event:', error);
    throw new Error(`Failed to record match event: ${error.message}`);
  }
};

/**
 * Get comprehensive match analytics
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} Match analytics
 */
export const getMatchAnalytics = async (matchId) => {
  try {
    console.log('📊 Getting match analytics:', matchId);
    
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const match = matchDoc.data();
    const statistics = match.statistics || {};
    
    // Calculate possession percentages
    const totalMatchTime = calculateTotalMatchTime(match);
    const possessionPercentages = calculatePossessionPercentages(statistics, totalMatchTime);
    const territoryPercentages = calculateTerritoryPercentages(statistics, totalMatchTime);
    
    // Calculate scoring efficiency
    const scoringEfficiency = calculateScoringEfficiency(statistics);
    
    // Player performance analysis
    const playerPerformance = analyzePlayerPerformance(match.playerStats || {});
    
    const analytics = {
      matchId,
      basicStats: statistics,
      possessionPercentages,
      territoryPercentages,
      scoringEfficiency,
      playerPerformance,
      totalMatchTime,
      generatedAt: new Date()
    };
    
    console.log('✅ Match analytics generated successfully');
    return analytics;
    
  } catch (error) {
    console.error('❌ Error getting match analytics:', error);
    throw new Error(`Failed to get match analytics: ${error.message}`);
  }
};

/**
 * Get team season statistics
 * @param {string} teamId - Team ID
 * @param {string} season - Season (e.g., '2024')
 * @returns {Promise<Object>} Season statistics
 */
export const getTeamSeasonStats = async (teamId, season) => {
  try {
    console.log('🏆 Getting team season stats:', { teamId, season });
    
    // Query matches for the team in the specified season
    const matchesQuery = query(
      collection(db, 'matches'),
      where('teamId', '==', teamId),
      where('date', '>=', new Date(`${season}-01-01`)),
      where('date', '<=', new Date(`${season}-12-31`)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(matchesQuery);
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Aggregate statistics across all matches
    const seasonStats = aggregateSeasonStatistics(matches);
    
    console.log('✅ Team season stats generated successfully');
    return seasonStats;
    
  } catch (error) {
    console.error('❌ Error getting team season stats:', error);
    throw new Error(`Failed to get team season stats: ${error.message}`);
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate statistics updates
 */
function validateStatisticsUpdates(updates) {
  const validUpdates = {};
  
  // Validate possession updates
  if (updates.possession) {
    if (typeof updates.possession.team === 'number' && updates.possession.team >= 0) {
      validUpdates.possession = updates.possession;
    }
  }
  
  // Validate territory updates
  if (updates.territory) {
    if (typeof updates.territory.team === 'number' && updates.territory.team >= 0) {
      validUpdates.territory = updates.territory;
    }
  }
  
  // Validate counter updates
  const counters = ['errors', 'penalties', 'turnovers', 'tries', 'conversions', 'penaltyGoals', 'dropGoals'];
  counters.forEach(counter => {
    if (updates[counter] && typeof updates[counter] === 'object') {
      if (typeof updates[counter].team === 'number' && updates[counter].team >= 0) {
        validUpdates[counter] = updates[counter];
      }
    }
  });
  
  return validUpdates;
}

/**
 * Validate event data
 */
function validateEventData(eventType, eventData) {
  const validEvent = {};
  
  // Validate player data if present
  if (eventData.playerId && eventData.playerName) {
    validEvent.playerId = eventData.playerId;
    validEvent.playerName = eventData.playerName;
  }
  
  // Validate team
  if (eventData.team && ['team', 'opponent'].includes(eventData.team)) {
    validEvent.team = eventData.team;
  }
  
  // Validate points if scoring event
  if (['try', 'conversion', 'penalty_goal', 'drop_goal'].includes(eventType)) {
    if (typeof eventData.points === 'number' && eventData.points >= 0) {
      validEvent.points = eventData.points;
    }
  }
  
  return validEvent;
}

/**
 * Update statistics from event
 */
function updateStatisticsFromEvent(currentStats, eventType, eventData) {
  const updatedStats = { ...currentStats };
  
  switch (eventType) {
    case 'try':
      if (eventData.team === 'team') {
        updatedStats.tries.team = (updatedStats.tries?.team || 0) + 1;
      } else {
        updatedStats.tries.opponent = (updatedStats.tries?.opponent || 0) + 1;
      }
      break;
      
    case 'conversion':
      if (eventData.team === 'team') {
        updatedStats.conversions.team = (updatedStats.conversions?.team || 0) + 1;
      } else {
        updatedStats.conversions.opponent = (updatedStats.conversions?.opponent || 0) + 1;
      }
      break;
      
    case 'penalty_goal':
      if (eventData.team === 'team') {
        updatedStats.penaltyGoals.team = (updatedStats.penaltyGoals?.team || 0) + 1;
      } else {
        updatedStats.penaltyGoals.opponent = (updatedStats.penaltyGoals?.opponent || 0) + 1;
      }
      break;
      
    case 'drop_goal':
      if (eventData.team === 'team') {
        updatedStats.dropGoals.team = (updatedStats.dropGoals?.team || 0) + 1;
      } else {
        updatedStats.dropGoals.opponent = (updatedStats.dropGoals?.opponent || 0) + 1;
      }
      break;
      
    case 'error':
      if (eventData.team === 'team') {
        updatedStats.errors.team = (updatedStats.errors?.team || 0) + 1;
      } else {
        updatedStats.errors.opponent = (updatedStats.errors?.opponent || 0) + 1;
      }
      break;
      
    case 'penalty':
      if (eventData.team === 'team') {
        updatedStats.penalties.team = (updatedStats.penalties?.team || 0) + 1;
      } else {
        updatedStats.penalties.opponent = (updatedStats.penalties?.opponent || 0) + 1;
      }
      break;
      
    case 'turnover':
      if (eventData.team === 'team') {
        updatedStats.turnovers.team = (updatedStats.turnovers?.team || 0) + 1;
      } else {
        updatedStats.turnovers.opponent = (updatedStats.turnovers?.opponent || 0) + 1;
      }
      break;
  }
  
  return updatedStats;
}

/**
 * Update player statistics from event
 */
function updatePlayerStatsFromEvent(currentPlayerStats, eventType, eventData) {
  if (!eventData.playerId) return currentPlayerStats;
  
  const updatedPlayerStats = { ...currentPlayerStats };
  const playerId = eventData.playerId;
  
  if (!updatedPlayerStats[playerId]) {
    updatedPlayerStats[playerId] = {
      playerId: eventData.playerId,
      playerName: eventData.playerName,
      tries: 0,
      conversions: 0,
      penaltyGoals: 0,
      dropGoals: 0,
      errors: 0,
      penalties: 0,
      turnovers: 0
    };
  }
  
  const player = updatedPlayerStats[playerId];
  
  switch (eventType) {
    case 'try':
      player.tries = (player.tries || 0) + 1;
      break;
    case 'conversion':
      player.conversions = (player.conversions || 0) + 1;
      break;
    case 'penalty_goal':
      player.penaltyGoals = (player.penaltyGoals || 0) + 1;
      break;
    case 'drop_goal':
      player.dropGoals = (player.dropGoals || 0) + 1;
      break;
    case 'error':
      player.errors = (player.errors || 0) + 1;
      break;
    case 'penalty':
      player.penalties = (player.penalties || 0) + 1;
      break;
    case 'turnover':
      player.turnovers = (player.turnovers || 0) + 1;
      break;
  }
  
  return updatedPlayerStats;
}

/**
 * Calculate total match time
 */
function calculateTotalMatchTime(match) {
  if (!match.matchTimer?.startTime) return 0;
  
  const startTime = match.matchTimer.startTime.toDate();
  const now = new Date();
  const totalPaused = match.matchTimer.totalPaused || 0;
  
  return Math.max(0, now - startTime - totalPaused);
}

/**
 * Calculate possession percentages
 */
function calculatePossessionPercentages(statistics, totalMatchTime) {
  if (totalMatchTime === 0) return { team: 0, opponent: 0 };
  
  const teamTime = statistics.possession?.teamTotalTime || 0;
  const opponentTime = statistics.possession?.opponentTotalTime || 0;
  
  return {
    team: Math.round((teamTime / totalMatchTime) * 100),
    opponent: Math.round((opponentTime / totalMatchTime) * 100)
  };
}

/**
 * Calculate territory percentages
 */
function calculateTerritoryPercentages(statistics, totalMatchTime) {
  if (totalMatchTime === 0) return { team: 0, opponent: 0 };
  
  const teamTime = statistics.territory?.teamTotalTime || 0;
  const opponentTime = statistics.territory?.opponentTotalTime || 0;
  
  return {
    team: Math.round((teamTime / totalMatchTime) * 100),
    opponent: Math.round((opponentTime / totalMatchTime) * 100)
  };
}

/**
 * Calculate scoring efficiency
 */
function calculateScoringEfficiency(statistics) {
  const teamTries = statistics.tries?.team || 0;
  const teamConversions = statistics.conversions?.team || 0;
  const teamPenaltyGoals = statistics.penaltyGoals?.team || 0;
  const teamDropGoals = statistics.dropGoals?.team || 0;
  
  const totalPoints = (teamTries * 5) + (teamConversions * 2) + (teamPenaltyGoals * 3) + (teamDropGoals * 3);
  const totalAttempts = teamTries + teamConversions + teamPenaltyGoals + teamDropGoals;
  
  return {
    totalPoints,
    totalAttempts,
    efficiency: totalAttempts > 0 ? Math.round((totalPoints / totalAttempts) * 100) / 100 : 0
  };
}

/**
 * Analyze player performance
 */
function analyzePlayerPerformance(playerStats) {
  const players = Object.values(playerStats);
  
  return players.map(player => ({
    ...player,
    totalPoints: (player.tries * 5) + (player.conversions * 2) + (player.penaltyGoals * 3) + (player.dropGoals * 3),
    performance: calculatePlayerPerformanceScore(player)
  })).sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Calculate player performance score
 */
function calculatePlayerPerformanceScore(player) {
  let score = 0;
  
  // Positive contributions
  score += (player.tries || 0) * 10;
  score += (player.conversions || 0) * 5;
  score += (player.penaltyGoals || 0) * 8;
  score += (player.dropGoals || 0) * 8;
  
  // Negative contributions
  score -= (player.errors || 0) * 2;
  score -= (player.penalties || 0) * 3;
  score -= (player.turnovers || 0) * 2;
  
  return Math.max(0, score);
}

/**
 * Aggregate season statistics
 */
function aggregateSeasonStatistics(matches) {
  const seasonStats = {
    totalMatches: matches.length,
    wins: 0,
    losses: 0,
    draws: 0,
    totalPoints: 0,
    totalTries: 0,
    totalConversions: 0,
    totalPenaltyGoals: 0,
    totalDropGoals: 0,
    totalErrors: 0,
    totalPenalties: 0,
    totalTurnovers: 0,
    averagePossession: 0,
    averageTerritory: 0
  };
  
  let totalPossession = 0;
  let totalTerritory = 0;
  
  matches.forEach(match => {
    const stats = match.statistics || {};
    
    // Count wins/losses/draws (simplified logic)
    const teamPoints = (stats.tries?.team || 0) * 5 + (stats.conversions?.team || 0) * 2 + 
                      (stats.penaltyGoals?.team || 0) * 3 + (stats.dropGoals?.team || 0) * 3;
    const opponentPoints = (stats.tries?.opponent || 0) * 5 + (stats.conversions?.opponent || 0) * 2 + 
                          (stats.penaltyGoals?.opponent || 0) * 3 + (stats.dropGoals?.opponent || 0) * 3;
    
    if (teamPoints > opponentPoints) seasonStats.wins++;
    else if (teamPoints < opponentPoints) seasonStats.losses++;
    else seasonStats.draws++;
    
    // Aggregate statistics
    seasonStats.totalPoints += teamPoints;
    seasonStats.totalTries += stats.tries?.team || 0;
    seasonStats.totalConversions += stats.conversions?.team || 0;
    seasonStats.totalPenaltyGoals += stats.penaltyGoals?.team || 0;
    seasonStats.totalDropGoals += stats.dropGoals?.team || 0;
    seasonStats.totalErrors += stats.errors?.team || 0;
    seasonStats.totalPenalties += stats.penalties?.team || 0;
    seasonStats.totalTurnovers += stats.turnovers?.team || 0;
    
    // Calculate possession and territory percentages for this match
    const matchTime = calculateTotalMatchTime(match);
    if (matchTime > 0) {
      const possessionPercent = calculatePossessionPercentages(stats, matchTime);
      const territoryPercent = calculateTerritoryPercentages(stats, matchTime);
      totalPossession += possessionPercent.team;
      totalTerritory += territoryPercent.team;
    }
  });
  
  // Calculate averages
  if (matches.length > 0) {
    seasonStats.averagePossession = Math.round(totalPossession / matches.length);
    seasonStats.averageTerritory = Math.round(totalTerritory / matches.length);
  }
  
  return seasonStats;
}

export default {
  updateMatchStatistics,
  recordMatchEvent,
  getMatchAnalytics,
  getTeamSeasonStats,
  MATCH_STATISTICS_SCHEMA
};
