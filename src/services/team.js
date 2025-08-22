// Team Management Service for AURFC Hub
// Handles team creation, updates, and management

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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

/**
 * Create a new team
 * @param {Object} teamData - Team data
 * @returns {Promise<Object>} Created team data
 */
export const createTeam = async (teamData) => {
  try {
    const teamId = `team-${Date.now()}`;
    const teamDoc = {
      id: teamId,
      name: teamData.name,
      ageGroup: teamData.ageGroup,
      type: teamData.type, // 'Rippa', 'Open', 'Restricted'
      description: teamData.description || '',
      maxPlayers: teamData.maxPlayers || 15,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: teamData.createdBy
    };

    await setDoc(doc(db, 'teams', teamId), teamDoc);
    return { ...teamDoc, id: teamId };
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team: ' + error.message);
  }
};

/**
 * Get all teams
 * @returns {Promise<Array>} Array of team objects
 */
export const getAllTeams = async () => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      orderBy('ageGroup', 'asc')
    );
    
    const querySnapshot = await getDocs(teamsQuery);
    const teams = [];
    
    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() });
    });
    
    return teams;
  } catch (error) {
    console.error('Error getting teams:', error);
    throw new Error('Failed to get teams: ' + error.message);
  }
};

/**
 * Get team by ID
 * @param {string} teamId - Team ID
 * @returns {Promise<Object|null>} Team data or null
 */
export const getTeamById = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    
    if (teamDoc.exists()) {
      return { id: teamDoc.id, ...teamDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting team:', error);
    throw new Error('Failed to get team: ' + error.message);
  }
};

/**
 * Update team
 * @param {string} teamId - Team ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated team data
 */
export const updateTeam = async (teamId, updates) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    
    await updateDoc(teamRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return await getTeamById(teamId);
  } catch (error) {
    console.error('Error updating team:', error);
    throw new Error('Failed to update team: ' + error.message);
  }
};

/**
 * Delete team
 * @param {string} teamId - Team ID
 * @returns {Promise<void>}
 */
export const deleteTeam = async (teamId) => {
  try {
    await deleteDoc(doc(db, 'teams', teamId));
  } catch (error) {
    console.error('Error deleting team:', error);
    throw new Error('Failed to delete team: ' + error.message);
  }
};

/**
 * Toggle team active status
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Updated team data
 */
export const toggleTeamStatus = async (teamId, newStatus) => {
  try {
    const team = await getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    return await updateTeam(teamId, { active: newStatus });
  } catch (error) {
    console.error('Error toggling team status:', error);
    throw new Error('Failed to toggle team status: ' + error.message);
  }
};

// ============================================================================
// TEAM UTILITIES
// ============================================================================

/**
 * Get teams by age group
 * @param {string} ageGroup - Age group filter
 * @returns {Promise<Array>} Array of teams for the age group
 */
export const getTeamsByAgeGroup = async (ageGroup) => {
  try {
    const teams = await getAllTeams();
    return teams.filter(team => team.ageGroup === ageGroup && team.active);
  } catch (error) {
    console.error('Error getting teams by age group:', error);
    throw new Error('Failed to get teams by age group: ' + error.message);
  }
};

/**
 * Get active teams only
 * @returns {Promise<Array>} Array of active teams
 */
export const getActiveTeams = async () => {
  try {
    const teams = await getAllTeams();
    return teams.filter(team => team.active);
  } catch (error) {
    console.error('Error getting active teams:', error);
    throw new Error('Failed to get active teams: ' + error.message);
  }
};

/**
 * Get teams formatted for dropdown
 * @returns {Promise<Array>} Array of teams formatted for select dropdown
 */
export const getTeamsForDropdown = async () => {
  try {
    const teams = await getActiveTeams();
    return teams.map(team => ({
      value: team.id,
      label: team.name,
      ageGroup: team.ageGroup,
      type: team.type
    }));
  } catch (error) {
    console.error('Error getting teams for dropdown:', error);
    throw new Error('Failed to get teams for dropdown: ' + error.message);
  }
};

/**
 * Populate initial teams with preset rugby teams
 * @returns {Promise<Array>} Array of created team IDs
 */
export const populateInitialTeams = async () => {
  try {
    const initialTeams = [
      { name: "Under 6 Rippa", ageGroup: "Under 6", type: "Rippa", description: "Rippa rugby for players under 6 years old", maxPlayers: 12 },
      { name: "Under 7 Rippa", ageGroup: "Under 7", type: "Rippa", description: "Rippa rugby for players under 7 years old", maxPlayers: 12 },
      { name: "Under 8 Open", ageGroup: "Under 8", type: "Open", description: "Open rugby for players under 8 years old", maxPlayers: 15 },
      { name: "Under 8 Restricted", ageGroup: "Under 8", type: "Restricted", description: "Restricted rugby for players under 8 years old", maxPlayers: 15 },
      { name: "Under 9 Open", ageGroup: "Under 9", type: "Open", description: "Open rugby for players under 9 years old", maxPlayers: 15 },
      { name: "Under 9 Restricted", ageGroup: "Under 9", type: "Restricted", description: "Restricted rugby for players under 9 years old", maxPlayers: 15 },
      { name: "Under 10 Open", ageGroup: "Under 10", type: "Open", description: "Open rugby for players under 10 years old", maxPlayers: 15 },
      { name: "Under 10 Restricted", ageGroup: "Under 10", type: "Restricted", description: "Restricted rugby for players under 10 years old", maxPlayers: 15 },
      { name: "Under 11 Open", ageGroup: "Under 11", type: "Open", description: "Open rugby for players under 11 years old", maxPlayers: 15 },
      { name: "Under 11 Restricted", ageGroup: "Under 11", type: "Restricted", description: "Restricted rugby for players under 11 years old", maxPlayers: 15 },
      { name: "Under 12 Open", ageGroup: "Under 12", type: "Open", description: "Open rugby for players under 12 years old", maxPlayers: 15 },
      { name: "Under 12 Restricted", ageGroup: "Under 12", type: "Restricted", description: "Restricted rugby for players under 12 years old", maxPlayers: 15 },
      { name: "Under 13 Open", ageGroup: "Under 13", type: "Open", description: "Open rugby for players under 13 years old", maxPlayers: 15 },
      { name: "Under 13 Restricted", ageGroup: "Under 13", type: "Restricted", description: "Restricted rugby for players under 13 years old", maxPlayers: 15 }
    ];
    
    const createdTeamIds = [];
    
    for (const team of initialTeams) {
      try {
        const createdTeam = await createTeam(team);
        createdTeamIds.push(createdTeam.id);
        console.log(`✅ Created team: ${team.name}`);
      } catch (error) {
        console.error(`❌ Failed to create team ${team.name}:`, error);
      }
    }
    
    return createdTeamIds;
  } catch (error) {
    console.error('Error populating initial teams:', error);
    throw new Error('Failed to populate initial teams: ' + error.message);
  }
}; 