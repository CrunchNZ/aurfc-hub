// Attendance Service for AURFC Hub
// Handles attendance tracking, reporting, and management

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
  runTransaction
} from 'firebase/firestore';

// ============================================================================
// ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Create a new attendance record for an event
 * @param {Object} attendanceData - Attendance data
 * @returns {Promise<Object>} Created attendance record
 */
export const createAttendanceRecord = async (attendanceData) => {
  try {
    const attendanceId = `attendance-${Date.now()}`;
    const attendanceDoc = {
      id: attendanceId,
      eventId: attendanceData.eventId,
      eventType: attendanceData.eventType, // 'training', 'match', 'event'
      eventName: attendanceData.eventName,
      eventDate: attendanceData.eventDate,
      teamId: attendanceData.teamId,
      teamName: attendanceData.teamName,
      coachId: attendanceData.coachId,
      players: attendanceData.players || [], // Array of player attendance records
      totalPlayers: attendanceData.totalPlayers || 0,
      presentCount: attendanceData.presentCount || 0,
      absentCount: attendanceData.absentCount || 0,
      lateCount: attendanceData.lateCount || 0,
      notes: attendanceData.notes || '',
      status: 'active', // 'active', 'cancelled', 'completed'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: attendanceData.createdBy
    };

    await setDoc(doc(db, 'attendance', attendanceId), attendanceDoc);
    return { ...attendanceDoc, id: attendanceId };
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw new Error('Failed to create attendance record: ' + error.message);
  }
};

/**
 * Get attendance record by ID
 * @param {string} attendanceId - Attendance record ID
 * @returns {Promise<Object|null>} Attendance record or null
 */
export const getAttendanceRecord = async (attendanceId) => {
  try {
    const attendanceDoc = await getDoc(doc(db, 'attendance', attendanceId));
    
    if (attendanceDoc.exists()) {
      return { id: attendanceDoc.id, ...attendanceDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting attendance record:', error);
    throw new Error('Failed to get attendance record: ' + error.message);
  }
};

/**
 * Get all attendance records for a team
 * @param {string} teamId - Team ID
 * @param {string} eventType - Optional event type filter
 * @returns {Promise<Array>} Array of attendance records
 */
export const getTeamAttendanceRecords = async (teamId, eventType = null) => {
  try {
    let attendanceQuery = query(
      collection(db, 'attendance'),
      where('teamId', '==', teamId),
      orderBy('eventDate', 'desc')
    );

    if (eventType) {
      attendanceQuery = query(
        collection(db, 'attendance'),
        where('teamId', '==', teamId),
        where('eventType', '==', eventType),
        orderBy('eventDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(attendanceQuery);
    const attendanceRecords = [];
    
    querySnapshot.forEach((doc) => {
      attendanceRecords.push({ id: doc.id, ...doc.data() });
    });
    
    return attendanceRecords;
  } catch (error) {
    console.error('Error getting team attendance records:', error);
    throw new Error('Failed to get team attendance records: ' + error.message);
  }
};

/**
 * Get attendance records for a specific event
 * @param {string} eventId - Event ID
 * @returns {Promise<Object|null>} Attendance record for the event
 */
export const getEventAttendance = async (eventId) => {
  try {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('eventId', '==', eventId)
    );
    
    const querySnapshot = await getDocs(attendanceQuery);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting event attendance:', error);
    throw new Error('Failed to get event attendance: ' + error.message);
  }
};

/**
 * Update player attendance for an event
 * @param {string} attendanceId - Attendance record ID
 * @param {string} playerId - Player ID
 * @param {Object} attendanceData - Player attendance data
 * @returns {Promise<Object>} Updated attendance record
 */
export const updatePlayerAttendance = async (attendanceId, playerId, attendanceData) => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    
    // Get current attendance record
    const currentAttendance = await getDoc(attendanceRef);
    if (!currentAttendance.exists()) {
      throw new Error('Attendance record not found');
    }

    const currentData = currentAttendance.data();
    const currentPlayers = currentData.players || [];
    
    // Find and update player attendance
    const playerIndex = currentPlayers.findIndex(p => p.playerId === playerId);
    
    if (playerIndex >= 0) {
      // Update existing player attendance
      currentPlayers[playerIndex] = {
        ...currentPlayers[playerIndex],
        ...attendanceData,
        updatedAt: serverTimestamp()
      };
    } else {
      // Add new player attendance
      currentPlayers.push({
        playerId,
        playerName: attendanceData.playerName,
        status: attendanceData.status, // 'present', 'absent', 'late', 'excused'
        checkInTime: attendanceData.checkInTime || null,
        checkOutTime: attendanceData.checkOutTime || null,
        notes: attendanceData.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Recalculate totals
    const presentCount = currentPlayers.filter(p => p.status === 'present').length;
    const absentCount = currentPlayers.filter(p => p.status === 'absent').length;
    const lateCount = currentPlayers.filter(p => p.status === 'late').length;

    // Update the attendance record
    await updateDoc(attendanceRef, {
      players: currentPlayers,
      presentCount,
      absentCount,
      lateCount,
      totalPlayers: currentPlayers.length,
      updatedAt: serverTimestamp()
    });

    return await getAttendanceRecord(attendanceId);
  } catch (error) {
    console.error('Error updating player attendance:', error);
    throw new Error('Failed to update player attendance: ' + error.message);
  }
};

/**
 * Bulk update attendance for multiple players
 * @param {string} attendanceId - Attendance record ID
 * @param {Array} playerAttendance - Array of player attendance updates
 * @returns {Promise<Object>} Updated attendance record
 */
export const bulkUpdateAttendance = async (attendanceId, playerAttendance) => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    
    // Get current attendance record
    const currentAttendance = await getDoc(attendanceRef);
    if (!currentAttendance.exists()) {
      throw new Error('Attendance record not found');
    }

    const currentData = currentAttendance.data();
    const currentPlayers = currentData.players || [];
    
    // Update each player's attendance
    playerAttendance.forEach(update => {
      const playerIndex = currentPlayers.findIndex(p => p.playerId === update.playerId);
      
      if (playerIndex >= 0) {
        // Update existing player attendance
        currentPlayers[playerIndex] = {
          ...currentPlayers[playerIndex],
          status: update.status,
          checkInTime: update.checkInTime || null,
          checkOutTime: update.checkOutTime || null,
          notes: update.notes || '',
          updatedAt: serverTimestamp()
        };
      } else {
        // Add new player attendance
        currentPlayers.push({
          playerId: update.playerId,
          playerName: update.playerName,
          status: update.status,
          checkInTime: update.checkInTime || null,
          checkOutTime: update.checkOutTime || null,
          notes: update.notes || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });

    // Recalculate totals
    const presentCount = currentPlayers.filter(p => p.status === 'present').length;
    const absentCount = currentPlayers.filter(p => p.status === 'absent').length;
    const lateCount = currentPlayers.filter(p => p.status === 'late').length;

    // Update the attendance record
    await updateDoc(attendanceRef, {
      players: currentPlayers,
      presentCount,
      absentCount,
      lateCount,
      totalPlayers: currentPlayers.length,
      updatedAt: serverTimestamp()
    });

    return await getAttendanceRecord(attendanceId);
  } catch (error) {
    console.error('Error bulk updating attendance:', error);
    throw new Error('Failed to bulk update attendance: ' + error.message);
  }
};

/**
 * Get attendance statistics for a team
 * @param {string} teamId - Team ID
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} Attendance statistics
 */
export const getTeamAttendanceStats = async (teamId, startDate, endDate) => {
  try {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('teamId', '==', teamId),
      where('eventDate', '>=', startDate),
      where('eventDate', '<=', endDate),
      orderBy('eventDate', 'desc')
    );
    
    const querySnapshot = await getDocs(attendanceQuery);
    const attendanceRecords = [];
    
    querySnapshot.forEach((doc) => {
      attendanceRecords.push({ id: doc.id, ...doc.data() });
    });

    // Calculate statistics
    const totalEvents = attendanceRecords.length;
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + (record.presentCount || 0), 0);
    const totalAbsent = attendanceRecords.reduce((sum, record) => sum + (record.absentCount || 0), 0);
    const totalLate = attendanceRecords.reduce((sum, record) => sum + (record.lateCount || 0), 0);
    
    const averageAttendance = totalEvents > 0 ? (totalPresent / totalEvents).toFixed(2) : 0;
    const attendanceRate = totalEvents > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2) : 0;

    return {
      totalEvents,
      totalPresent,
      totalAbsent,
      totalLate,
      averageAttendance: parseFloat(averageAttendance),
      attendanceRate: parseFloat(attendanceRate),
      records: attendanceRecords
    };
  } catch (error) {
    console.error('Error getting team attendance stats:', error);
    throw new Error('Failed to get team attendance stats: ' + error.message);
  }
};

/**
 * Get player attendance history
 * @param {string} playerId - Player ID
 * @param {string} teamId - Team ID
 * @param {Date} startDate - Start date for history
 * @param {Date} endDate - End date for history
 * @returns {Promise<Object>} Player attendance history
 */
export const getPlayerAttendanceHistory = async (playerId, teamId, startDate, endDate) => {
  try {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('teamId', '==', teamId),
      where('eventDate', '>=', startDate),
      where('eventDate', '<=', endDate),
      orderBy('eventDate', 'desc')
    );
    
    const querySnapshot = await getDocs(attendanceQuery);
    const playerHistory = [];
    
    querySnapshot.forEach((doc) => {
      const record = { id: doc.id, ...doc.data() };
      const playerRecord = record.players?.find(p => p.playerId === playerId);
      
      if (playerRecord) {
        playerHistory.push({
          eventId: record.eventId,
          eventName: record.eventName,
          eventType: record.eventType,
          eventDate: record.eventDate,
          status: playerRecord.status,
          checkInTime: playerRecord.checkInTime,
          checkOutTime: playerRecord.checkOutTime,
          notes: playerRecord.notes
        });
      }
    });

    // Calculate player statistics
    const totalEvents = playerHistory.length;
    const presentCount = playerHistory.filter(h => h.status === 'present').length;
    const absentCount = playerHistory.filter(h => h.status === 'absent').length;
    const lateCount = playerHistory.filter(h => h.status === 'late').length;
    const excusedCount = playerHistory.filter(h => h.status === 'excused').length;
    
    const attendanceRate = totalEvents > 0 ? ((presentCount / totalEvents) * 100).toFixed(2) : 0;

    return {
      playerId,
      teamId,
      totalEvents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate: parseFloat(attendanceRate),
      history: playerHistory
    };
  } catch (error) {
    console.error('Error getting player attendance history:', error);
    throw new Error('Failed to get player attendance history: ' + error.message);
  }
};

/**
 * Delete attendance record
 * @param {string} attendanceId - Attendance record ID
 * @returns {Promise<void>}
 */
export const deleteAttendanceRecord = async (attendanceId) => {
  try {
    await deleteDoc(doc(db, 'attendance', attendanceId));
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    throw new Error('Failed to delete attendance record: ' + error.message);
  }
};

/**
 * Export attendance data for reporting
 * @param {string} teamId - Team ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Exportable attendance data
 */
export const exportAttendanceData = async (teamId, startDate, endDate) => {
  try {
    const stats = await getTeamAttendanceStats(teamId, startDate, endDate);
    const records = stats.records;
    
    // Format data for export
    const exportData = {
      teamId,
      teamName: records[0]?.teamName || 'Unknown Team',
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalEvents: stats.totalEvents,
        totalPresent: stats.totalPresent,
        totalAbsent: stats.totalAbsent,
        totalLate: stats.totalLate,
        averageAttendance: stats.averageAttendance,
        attendanceRate: stats.attendanceRate
      },
      events: records.map(record => ({
        eventId: record.eventId,
        eventName: record.eventName,
        eventType: record.eventType,
        eventDate: record.eventDate,
        presentCount: record.presentCount,
        absentCount: record.absentCount,
        lateCount: record.lateCount,
        totalPlayers: record.totalPlayers,
        notes: record.notes
      })),
      exportedAt: new Date().toISOString()
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting attendance data:', error);
    throw new Error('Failed to export attendance data: ' + error.message);
  }
};
