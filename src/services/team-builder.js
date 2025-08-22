// Team Builder Service for AURFC Hub
// Handles rugby team lineup creation, management, and formation layouts

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
  serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// RUGBY FORMATION CONSTANTS
// ============================================================================

// Forward positions in scrum formation order
export const FORWARD_POSITIONS = [
  { number: 1, name: 'Loosehead Prop', shortName: 'LH Prop', row: 1, col: 2 },
  { number: 2, name: 'Hooker', shortName: 'Hooker', row: 1, col: 3 },
  { number: 3, name: 'Tighthead Prop', shortName: 'TH Prop', row: 1, col: 4 },
  { number: 4, name: 'Lock', shortName: 'Lock', row: 2, col: 2 },
  { number: 5, name: 'Lock', shortName: 'Lock', row: 2, col: 4 },
  { number: 6, name: 'Blindside Flanker', shortName: 'BS Flanker', row: 3, col: 1 },
  { number: 7, name: 'Openside Flanker', shortName: 'OS Flanker', row: 3, col: 3 },
  { number: 8, name: 'Number 8', shortName: 'No. 8', row: 3, col: 5 }
];

// Back positions in formation order
export const BACK_POSITIONS = [
  { number: 9, name: 'Scrum Half', shortName: 'SH', row: 4, col: 3 },
  { number: 10, name: 'Fly Half', shortName: 'FH', row: 4, col: 4 },
  { number: 11, name: 'Left Wing', shortName: 'LW', row: 5, col: 1 },
  { number: 12, name: 'Inside Centre', shortName: 'IC', row: 5, col: 2 },
  { number: 13, name: 'Outside Centre', shortName: 'OC', row: 5, col: 4 },
  { number: 14, name: 'Right Wing', shortName: 'RW', row: 5, col: 5 },
  { number: 15, name: 'Fullback', shortName: 'FB', row: 6, col: 3 }
];

// Lineup set types
export const LINEUP_SET_TYPES = [
  'Starting Lineup',
  '1st Substitution',
  '2nd Substitution',
  '3rd Substitution',
  'Final Lineup'
];

// ============================================================================
// TEAM BUILDER FUNCTIONS
// ============================================================================

/**
 * Create a new team lineup
 * @param {Object} lineupData - Lineup data
 * @returns {Promise<Object>} Created lineup data
 */
export const createTeamLineup = async (lineupData) => {
  try {
    console.log('createTeamLineup called with:', lineupData);
    console.log('Firebase db object:', db);
    
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const lineupId = `lineup-${Date.now()}`;
    const lineupDoc = {
      id: lineupId,
      teamId: lineupData.teamId,
      name: lineupData.name,
      type: lineupData.type || 'Starting Lineup',
      matchDate: lineupData.matchDate,
      opponent: lineupData.opponent,
      isHome: lineupData.isHome || true,
      formation: lineupData.formation || 'default',
      players: lineupData.players || [],
      substitutes: lineupData.substitutes || [],
      captain: lineupData.captain || null,
      viceCaptain: lineupData.viceCaptain || null,
      notes: lineupData.notes || '',
      status: lineupData.status || 'draft', // draft, final, archived
      createdBy: lineupData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('About to create document with ID:', lineupId);
    console.log('Document data:', lineupDoc);
    
    const docRef = doc(db, 'teamLineups', lineupId);
    console.log('Document reference created:', docRef);
    
    await setDoc(docRef, lineupDoc);
    console.log('Document created successfully');
    
    return { ...lineupDoc, id: lineupId };
  } catch (error) {
    console.error('Error creating team lineup:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    throw new Error('Failed to create team lineup: ' + error.message);
  }
};

/**
 * Get all lineups for a specific team
 * @param {string} teamId - Team ID
 * @returns {Promise<Array>} Array of lineup objects
 */
export const getTeamLineups = async (teamId) => {
  try {
    console.log('getTeamLineups called with teamId:', teamId);
    
    if (!teamId) {
      console.log('No teamId provided, returning empty array');
      return [];
    }
    
    // Try the ordered query first (requires index)
    try {
      const lineupsQuery = query(
        collection(db, 'teamLineups'),
        where('teamId', '==', teamId),
        orderBy('matchDate', 'desc')
      );
      
      console.log('Executing ordered Firestore query...');
      const querySnapshot = await getDocs(lineupsQuery);
      
      const lineups = [];
      querySnapshot.forEach((doc) => {
        lineups.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Processed lineups:', lineups);
      return lineups;
    } catch (indexError) {
      console.log('Ordered query failed (index not ready), trying simple query...');
      
      // Fallback to simple query without ordering (no index required)
      const simpleQuery = query(
        collection(db, 'teamLineups'),
        where('teamId', '==', teamId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      const lineups = [];
      querySnapshot.forEach((doc) => {
        lineups.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually in JavaScript
      lineups.sort((a, b) => {
        const dateA = a.matchDate ? new Date(a.matchDate) : new Date(0);
        const dateB = b.matchDate ? new Date(b.matchDate) : new Date(0);
        return dateB - dateA; // Descending order
      });
      
      console.log('Processed lineups with manual sorting:', lineups);
      return lineups;
    }
  } catch (error) {
    console.error('Error getting team lineups:', error);
    
    // If it's a "collection doesn't exist" error, return empty array
    if (error.code === 'not-found' || error.message.includes('collection') || error.message.includes('not found')) {
      console.log('Collection does not exist yet, returning empty array');
      return [];
    }
    
    // If it's an index error, return empty array and log the issue
    if (error.code === 'failed-precondition' || error.message.includes('index') || error.message.includes('requires an index')) {
      console.log('Index not created yet, returning empty array. Please create the required index.');
      console.log('Index details: teamLineups collection, fields: teamId (asc), matchDate (desc)');
      return [];
    }
    
    // For other errors, throw with more context
    throw new Error('Failed to get team lineups: ' + error.message);
  }
};

/**
 * Get a specific lineup by ID
 * @param {string} lineupId - Lineup ID
 * @returns {Promise<Object|null>} Lineup data or null
 */
export const getLineupById = async (lineupId) => {
  try {
    const lineupDoc = await getDoc(doc(db, 'teamLineups', lineupId));
    
    if (lineupDoc.exists()) {
      return { id: lineupDoc.id, ...lineupDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lineup:', error);
    throw new Error('Failed to get lineup: ' + error.message);
  }
};

/**
 * Update a team lineup
 * @param {string} lineupId - Lineup ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated lineup data
 */
export const updateTeamLineup = async (lineupId, updates) => {
  try {
    const lineupRef = doc(db, 'teamLineups', lineupId);
    
                    await updateDoc(lineupRef, {
                  ...updates,
                  updatedAt: serverTimestamp()
                });
    
    return await getLineupById(lineupId);
  } catch (error) {
    console.error('Error updating lineup:', error);
    throw new Error('Failed to update lineup: ' + error.message);
  }
};

/**
 * Delete a team lineup
 * @param {string} lineupId - Lineup ID
 * @returns {Promise<void>}
 */
export const deleteTeamLineup = async (lineupId) => {
  try {
    await deleteDoc(doc(db, 'teamLineups', lineupId));
  } catch (error) {
    console.error('Error deleting lineup:', error);
    throw new Error('Failed to delete lineup: ' + error.message);
  }
};

/**
 * Add player to lineup position
 * @param {string} lineupId - Lineup ID
 * @param {number} position - Position number (1-15)
 * @param {Object} player - Player data
 * @returns {Promise<Object>} Updated lineup data
 */
export const addPlayerToPosition = async (lineupId, position, player) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    // Remove player from any existing position
    const updatedPlayers = lineup.players.filter(p => p.id !== player.id);
    
    // Add player to new position
    const playerWithPosition = {
      ...player,
      position: position,
      positionName: position <= 8 ? 
        FORWARD_POSITIONS.find(p => p.number === position)?.name :
        BACK_POSITIONS.find(p => p.number === position)?.name
    };
    
    updatedPlayers.push(playerWithPosition);
    
    // Sort by position number
    updatedPlayers.sort((a, b) => a.position - b.position);
    
    return await updateTeamLineup(lineupId, { players: updatedPlayers });
  } catch (error) {
    console.error('Error adding player to position:', error);
    throw new Error('Failed to add player to position: ' + error.message);
  }
};

/**
 * Remove player from lineup position
 * @param {string} lineupId - Lineup ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Updated lineup data
 */
export const removePlayerFromPosition = async (lineupId, playerId) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    const updatedPlayers = lineup.players.filter(p => p.id !== playerId);
    
    return await updateTeamLineup(lineupId, { players: updatedPlayers });
  } catch (error) {
    console.error('Error removing player from position:', error);
    throw new Error('Failed to remove player from position: ' + error.message);
  }
};

/**
 * Add player to substitutes
 * @param {string} lineupId - Lineup ID
 * @param {Object} player - Player data
 * @returns {Promise<Object>} Updated lineup data
 */
export const addPlayerToSubstitutes = async (lineupId, player) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    // Check if player is already in starting lineup
    const isInStarting = lineup.players.some(p => p.id === player.id);
    if (isInStarting) {
      throw new Error('Player is already in starting lineup');
    }

    // Check if player is already in substitutes
    const isInSubs = lineup.substitutes.some(p => p.id === player.id);
    if (isInSubs) {
      throw new Error('Player is already in substitutes');
    }

    const updatedSubstitutes = [...lineup.substitutes, player];
    
    return await updateTeamLineup(lineupId, { substitutes: updatedSubstitutes });
  } catch (error) {
    console.error('Error adding player to substitutes:', error);
    throw new Error('Failed to add player to substitutes: ' + error.message);
  }
};

/**
 * Remove player from substitutes
 * @param {string} lineupId - Lineup ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Updated lineup data
 */
export const removePlayerFromSubstitutes = async (lineupId, playerId) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    const updatedSubstitutes = lineup.substitutes.filter(p => p.id !== playerId);
    
    return await updateTeamLineup(lineupId, { substitutes: updatedSubstitutes });
  } catch (error) {
    console.error('Error removing player from substitutes:', error);
    throw new Error('Failed to remove player from substitutes: ' + error.message);
  }
};

/**
 * Set team captain
 * @param {string} lineupId - Lineup ID
 * @param {string} playerId - Player ID (null to remove captain)
 * @returns {Promise<Object>} Updated lineup data
 */
export const setTeamCaptain = async (lineupId, playerId) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    if (playerId) {
      // Verify player is in the lineup
      const player = lineup.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error('Player not found in lineup');
      }
    }

    return await updateTeamLineup(lineupId, { captain: playerId });
  } catch (error) {
    console.error('Error setting team captain:', error);
    throw new Error('Failed to set team captain: ' + error.message);
  }
};

/**
 * Set team vice captain
 * @param {string} lineupId - Lineup ID
 * @param {string} playerId - Player ID (null to remove vice captain)
 * @returns {Promise<Object>} Updated lineup data
 */
export const setTeamViceCaptain = async (lineupId, playerId) => {
  try {
    const lineup = await getLineupById(lineupId);
    if (!lineup) {
      throw new Error('Lineup not found');
    }

    if (playerId) {
      // Verify player is in the lineup
      const player = lineup.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error('Player not found in lineup');
      }
    }

    return await updateTeamLineup(lineupId, { viceCaptain: playerId });
  } catch (error) {
    console.error('Error setting team vice captain:', error);
    throw new Error('Failed to set team vice captain: ' + error.message);
  }
};

/**
 * Create lineup from template
 * @param {string} teamId - Team ID
 * @param {string} templateName - Template name
 * @param {Object} matchInfo - Match information
 * @returns {Promise<Object>} Created lineup data
 */
export const createLineupFromTemplate = async (teamId, templateName, matchInfo) => {
  try {
    const lineupData = {
      teamId,
      name: templateName,
      type: 'Starting Lineup',
      matchDate: matchInfo.matchDate,
      opponent: matchInfo.opponent,
      isHome: matchInfo.isHome || true,
      players: [],
      substitutes: [],
      captain: null,
      viceCaptain: null,
      notes: '',
      status: 'draft',
      createdBy: matchInfo.createdBy
    };

    return await createTeamLineup(lineupData);
  } catch (error) {
    console.error('Error creating lineup from template:', error);
    throw new Error('Failed to create lineup from template: ' + error.message);
  }
};

/**
 * Duplicate existing lineup
 * @param {string} lineupId - Original lineup ID
 * @param {string} newName - New lineup name
 * @param {Object} matchInfo - New match information
 * @returns {Promise<Object>} New lineup data
 */
export const duplicateLineup = async (lineupId, newName, matchInfo) => {
  try {
    const originalLineup = await getLineupById(lineupId);
    if (!originalLineup) {
      throw new Error('Original lineup not found');
    }

    const newLineupData = {
      teamId: originalLineup.teamId,
      name: newName,
      type: 'Starting Lineup',
      matchDate: matchInfo.matchDate,
      opponent: matchInfo.opponent,
      isHome: matchInfo.isHome || true,
      players: [...originalLineup.players],
      substitutes: [...originalLineup.substitutes],
      captain: originalLineup.captain,
      viceCaptain: originalLineup.viceCaptain,
      notes: originalLineup.notes,
      status: 'draft',
      createdBy: matchInfo.createdBy
    };

    return await createTeamLineup(newLineupData);
  } catch (error) {
    console.error('Error duplicating lineup:', error);
    throw new Error('Failed to duplicate lineup: ' + error.message);
  }
};

/**
 * Get formation layout for display
 * @param {Array} players - Array of players with positions
 * @returns {Object} Formation layout data
 */
export const getFormationLayout = (players) => {
  const forwards = players.filter(p => p.position <= 8).sort((a, b) => a.position - b.position);
  const backs = players.filter(p => p.position > 8).sort((a, b) => a.position - b.position);

  return {
    forwards: forwards.map(player => ({
      ...player,
      ...FORWARD_POSITIONS.find(p => p.number === player.position)
    })),
    backs: backs.map(player => ({
      ...player,
      ...BACK_POSITIONS.find(p => p.number === player.position)
    }))
  };
};

/**
 * Validate lineup completeness
 * @param {Array} players - Array of players
 * @returns {Object} Validation result
 */
export const validateLineup = (players) => {
  const positions = players.map(p => p.position).sort((a, b) => a - b);
  const expectedPositions = Array.from({ length: 15 }, (_, i) => i + 1);
  
  const missingPositions = expectedPositions.filter(p => !positions.includes(p));
  const duplicatePositions = positions.filter((p, i) => positions.indexOf(p) !== i);
  
  return {
    isValid: missingPositions.length === 0 && duplicatePositions.length === 0,
    missingPositions,
    duplicatePositions,
    totalPlayers: players.length,
    isComplete: players.length === 15
  };
};
