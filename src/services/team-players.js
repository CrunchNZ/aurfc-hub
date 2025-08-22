// Team Players Service for AURFC Hub
// Handles adding, removing, and managing players within teams

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
  arrayRemove
} from 'firebase/firestore';

// ============================================================================
// PLAYER POSITIONS
// ============================================================================

export const RUGBY_POSITIONS = [
  'Prop',
  'Hooker', 
  'Lock',
  'Flanker',
  'Number 8',
  'Half-Back',
  '1st-Five',
  '2nd-Five',
  'Centre',
  'Wing',
  'Fullback'
];

// ============================================================================
// TEAM PLAYER MANAGEMENT
// ============================================================================

/**
 * Add a player to a team
 * @param {string} teamId - Team ID
 * @param {Object} playerData - Player data
 * @returns {Promise<Object>} Updated team data
 */
export const addPlayerToTeam = async (teamId, playerData) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }
    
    const team = teamDoc.data();
    
    // Validate player data
    if (!playerData.firstName || !playerData.position1) {
      throw new Error('First name and primary position are required');
    }
    
    // Create player object
    const player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      firstName: playerData.firstName,
      lastName: playerData.lastName || '',
      position1: playerData.position1,
      position2: playerData.position2 || null,
      position3: playerData.position3 || null,
      addedAt: new Date(), // Use regular Date instead of serverTimestamp for arrayUnion
      addedBy: playerData.addedBy,
      status: 'active' // active, inactive, injured, suspended
    };
    
    // Add player to team's players array
    await updateDoc(teamRef, {
      players: arrayUnion(player),
      updatedAt: serverTimestamp()
    });
    
    return { ...team, players: [...(team.players || []), player] };
  } catch (error) {
    console.error('Error adding player to team:', error);
    throw new Error('Failed to add player to team: ' + error.message);
  }
};

/**
 * Remove a player from a team
 * @param {string} teamId - Team ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Updated team data
 */
export const removePlayerFromTeam = async (teamId, playerId) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }
    
    const team = teamDoc.data();
    const updatedPlayers = (team.players || []).filter(p => p.id !== playerId);
    
    await updateDoc(teamRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp()
    });
    
    return { ...team, players: updatedPlayers };
  } catch (error) {
    console.error('Error removing player from team:', error);
    throw new Error('Failed to remove player from team: ' + error.message);
  }
};

/**
 * Update player information in a team
 * @param {string} teamId - Team ID
 * @param {string} playerId - Player ID
 * @param {Object} updates - Player updates
 * @returns {Promise<Object>} Updated team data
 */
export const updatePlayerInTeam = async (teamId, playerId, updates) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }
    
    const team = teamDoc.data();
    const updatedPlayers = (team.players || []).map(player => {
      if (player.id === playerId) {
        return { ...player, ...updates, updatedAt: new Date() }; // Use regular Date for array operations
      }
      return player;
    });
    
    await updateDoc(teamRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp()
    });
    
    return { ...team, players: updatedPlayers };
  } catch (error) {
    console.error('Error updating player in team:', error);
    throw new Error('Failed to update player in team: ' + error.message);
  }
};

/**
 * Get all players in a team
 * @param {string} teamId - Team ID
 * @returns {Promise<Array>} Array of player objects
 */
export const getTeamPlayers = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }
    
    const team = teamDoc.data();
    return team.players || [];
  } catch (error) {
    console.error('Error getting team players:', error);
    throw new Error('Failed to get team players: ' + error.message);
  }
};

/**
 * Get player by ID from a team
 * @param {string} teamId - Team ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object|null>} Player object or null
 */
export const getTeamPlayer = async (teamId, playerId) => {
  try {
    const players = await getTeamPlayers(teamId);
    return players.find(p => p.id === playerId) || null;
  } catch (error) {
    console.error('Error getting team player:', error);
    throw new Error('Failed to get team player: ' + error.message);
  }
};

/**
 * Search players in a team by name or position
 * @param {string} teamId - Team ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching players
 */
export const searchTeamPlayers = async (teamId, searchTerm) => {
  try {
    const players = await getTeamPlayers(teamId);
    
    if (!searchTerm) return players;
    
    const term = searchTerm.toLowerCase();
    return players.filter(player => 
      player.firstName.toLowerCase().includes(term) ||
      (player.lastName && player.lastName.toLowerCase().includes(term)) ||
      player.position1.toLowerCase().includes(term) ||
      (player.position2 && player.position2.toLowerCase().includes(term)) ||
      (player.position3 && player.position3.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching team players:', error);
    throw new Error('Failed to search team players: ' + error.message);
  }
};

/**
 * Get players by position in a team
 * @param {string} teamId - Team ID
 * @param {string} position - Position to filter by
 * @returns {Promise<Array>} Array of players in that position
 */
export const getTeamPlayersByPosition = async (teamId, position) => {
  try {
    const players = await getTeamPlayers(teamId);
    return players.filter(player => 
      player.position1 === position ||
      player.position2 === position ||
      player.position3 === position
    );
  } catch (error) {
    console.error('Error getting team players by position:', error);
    throw new Error('Failed to get team players by position: ' + error.message);
  }
};

/**
 * Get team roster summary
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Team roster summary
 */
export const getTeamRosterSummary = async (teamId) => {
  try {
    const players = await getTeamPlayers(teamId);
    
    const summary = {
      totalPlayers: players.length,
      activePlayers: players.filter(p => p.status === 'active').length,
      positions: {},
      statusCounts: {}
    };
    
    // Count players by position
    players.forEach(player => {
      [player.position1, player.position2, player.position3].forEach(pos => {
        if (pos) {
          summary.positions[pos] = (summary.positions[pos] || 0) + 1;
        }
      });
      
      summary.statusCounts[player.status] = (summary.statusCounts[player.status] || 0) + 1;
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting team roster summary:', error);
    throw new Error('Failed to get team roster summary: ' + error.message);
  }
};
