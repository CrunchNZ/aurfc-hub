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
  onSnapshot
} from 'firebase/firestore';
import { notifyTeamUpdate } from './notifications';

// Team Management Service for AURFC Hub
// Handles team rosters, performance tracking, and drills

// ============================================================================
// TEAM ROSTER MANAGEMENT
// ============================================================================

// Create a new team
export const createTeam = async (teamData, creatorUser) => {
  try {
    const team = {
      ...teamData,
      createdBy: creatorUser.uid,
      createdByName: creatorUser.displayName || 'Unknown',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      players: [],
      coaches: [creatorUser.uid],
      season: teamData.season || new Date().getFullYear(),
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        pointsFor: 0,
        pointsAgainst: 0
      }
    };
    
    const docRef = await addDoc(collection(db, 'teams'), team);
    
    // Send notification about new team
    await notifyTeamUpdate(
      docRef.id,
      team.name,
      'team_created',
      `New team "${team.name}" has been created.`,
      ['coach', 'admin']
    );
    
    return { id: docRef.id, ...team };
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Get team by ID
export const getTeam = async (teamId) => {
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
};

// Get all teams
export const getTeams = (callback, filters = {}) => {
  try {
    let q = query(collection(db, 'teams'));
    
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }
    
    if (filters.season) {
      q = query(q, where('season', '==', filters.season));
    }
    
    if (filters.ageGroup) {
      q = query(q, where('ageGroup', '==', filters.ageGroup));
    }
    
    q = query(q, orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(teams);
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    throw error;
  }
};

// Add player to team roster
export const addPlayerToTeam = async (teamId, playerId, playerData) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const team = await getDoc(teamRef);
    
    if (team.exists()) {
      const currentPlayers = team.data().players || [];
      
      // Check if player is already in the team
      if (currentPlayers.some(p => p.userId === playerId)) {
        throw new Error('Player is already in this team');
      }
      
      const playerInfo = {
        userId: playerId,
        name: playerData.name,
        position: playerData.position || 'Forward',
        jerseyNumber: playerData.jerseyNumber,
        joinedAt: serverTimestamp(),
        isActive: true,
        stats: {
          matchesPlayed: 0,
          tries: 0,
          conversions: 0,
          penalties: 0,
          yellowCards: 0,
          redCards: 0
        }
      };
      
      await updateDoc(teamRef, {
        players: arrayUnion(playerInfo),
        updatedAt: serverTimestamp()
      });
      
      // Send notification
      await notifyTeamUpdate(
        teamId,
        team.data().name,
        'player_added',
        `${playerData.name} has been added to the team.`,
        ['coach', 'player']
      );
      
      return playerInfo;
    } else {
      throw new Error('Team not found');
    }
  } catch (error) {
    console.error('Error adding player to team:', error);
    throw error;
  }
};

// Remove player from team roster
export const removePlayerFromTeam = async (teamId, playerId) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const team = await getDoc(teamRef);
    
    if (team.exists()) {
      const currentPlayers = team.data().players || [];
      const playerToRemove = currentPlayers.find(p => p.userId === playerId);
      
      if (playerToRemove) {
        await updateDoc(teamRef, {
          players: arrayRemove(playerToRemove),
          updatedAt: serverTimestamp()
        });
        
        // Send notification
        await notifyTeamUpdate(
          teamId,
          team.data().name,
          'player_removed',
          `${playerToRemove.name} has been removed from the team.`,
          ['coach']
        );
      }
    }
  } catch (error) {
    console.error('Error removing player from team:', error);
    throw error;
  }
};

// Update player in team
export const updatePlayerInTeam = async (teamId, playerId, updates) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const team = await getDoc(teamRef);
    
    if (team.exists()) {
      const currentPlayers = team.data().players || [];
      const updatedPlayers = currentPlayers.map(player => {
        if (player.userId === playerId) {
          return { ...player, ...updates, updatedAt: serverTimestamp() };
        }
        return player;
      });
      
      await updateDoc(teamRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp()
      });
      
      return updatedPlayers.find(p => p.userId === playerId);
    }
  } catch (error) {
    console.error('Error updating player in team:', error);
    throw error;
  }
};

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

// Create or update player performance
export const trackPlayerPerformance = async (playerId, matchId, performanceData) => {
  try {
    const performance = {
      playerId,
      matchId,
      ...performanceData,
      recordedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'performances'), performance);
    return { id: docRef.id, ...performance };
  } catch (error) {
    console.error('Error tracking player performance:', error);
    throw error;
  }
};

// Get player performances
export const getPlayerPerformances = async (playerId, options = {}) => {
  try {
    let q = query(
      collection(db, 'performances'),
      where('playerId', '==', playerId)
    );
    
    if (options.matchId) {
      q = query(q, where('matchId', '==', options.matchId));
    }
    
    if (options.season) {
      q = query(q, where('season', '==', options.season));
    }
    
    q = query(q, orderBy('recordedAt', 'desc'));
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting player performances:', error);
    throw error;
  }
};

// Get team performance summary
export const getTeamPerformanceSummary = async (teamId, season) => {
  try {
    const team = await getTeam(teamId);
    if (!team) return null;
    
    const performances = [];
    for (const player of team.players) {
      const playerPerfs = await getPlayerPerformances(player.userId, { season });
      performances.push(...playerPerfs);
    }
    
    // Calculate team statistics
    const summary = {
      totalMatches: new Set(performances.map(p => p.matchId)).size,
      totalTries: performances.reduce((sum, p) => sum + (p.tries || 0), 0),
      totalConversions: performances.reduce((sum, p) => sum + (p.conversions || 0), 0),
      totalPenalties: performances.reduce((sum, p) => sum + (p.penalties || 0), 0),
      totalPoints: 0,
      averagePerformance: 0
    };
    
    summary.totalPoints = (summary.totalTries * 5) + (summary.totalConversions * 2) + (summary.totalPenalties * 3);
    summary.averagePerformance = summary.totalMatches > 0 ? summary.totalPoints / summary.totalMatches : 0;
    
    return summary;
  } catch (error) {
    console.error('Error getting team performance summary:', error);
    throw error;
  }
};

// ============================================================================
// DRILLS AND TRAINING
// ============================================================================

// Create a new drill
export const createDrill = async (drillData, creatorUser) => {
  try {
    const drill = {
      ...drillData,
      createdBy: creatorUser.uid,
      createdByName: creatorUser.displayName || 'Unknown',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      category: drillData.category || 'general',
      difficulty: drillData.difficulty || 'intermediate',
      equipment: drillData.equipment || [],
      tags: drillData.tags || []
    };
    
    const docRef = await addDoc(collection(db, 'drills'), drill);
    return { id: docRef.id, ...drill };
  } catch (error) {
    console.error('Error creating drill:', error);
    throw error;
  }
};

// Get drills with filtering
export const getDrills = (callback, filters = {}) => {
  try {
    let q = query(collection(db, 'drills'));
    
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }
    
    q = query(q, orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const drills = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(drills);
    });
  } catch (error) {
    console.error('Error getting drills:', error);
    throw error;
  }
};

// Update drill
export const updateDrill = async (drillId, updates) => {
  try {
    const drillRef = doc(db, 'drills', drillId);
    await updateDoc(drillRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { id: drillId, ...updates };
  } catch (error) {
    console.error('Error updating drill:', error);
    throw error;
  }
};

// Delete drill (soft delete)
export const deleteDrill = async (drillId) => {
  try {
    const drillRef = doc(db, 'drills', drillId);
    await updateDoc(drillRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting drill:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const createRoster = createTeam;
export const trackPerformance = trackPlayerPerformance; 