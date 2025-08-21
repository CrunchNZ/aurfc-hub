import { db, storage } from '../firebase';
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Junior Portal Service for AURFC Hub
// Handles content uploads, gamification, and parent dashboard functionality

// Badge types and achievements
export const BADGE_TYPES = {
  ATTENDANCE: 'attendance',
  PERFORMANCE: 'performance',
  TEAMWORK: 'teamwork',
  IMPROVEMENT: 'improvement',
  LEADERSHIP: 'leadership',
  SPORTSMANSHIP: 'sportsmanship'
};

export const AVAILABLE_BADGES = {
  first_training: {
    id: 'first_training',
    name: 'First Training',
    description: 'Attended your first training session',
    icon: '🏃',
    type: BADGE_TYPES.ATTENDANCE,
    points: 10
  },
  attendance_streak_5: {
    id: 'attendance_streak_5',
    name: '5 Session Streak',
    description: 'Attended 5 consecutive training sessions',
    icon: '🔥',
    type: BADGE_TYPES.ATTENDANCE,
    points: 25
  },
  first_try: {
    id: 'first_try',
    name: 'First Try',
    description: 'Scored your first try',
    icon: '🏉',
    type: BADGE_TYPES.PERFORMANCE,
    points: 20
  },
  team_player: {
    id: 'team_player',
    name: 'Team Player',
    description: 'Helped a teammate during training',
    icon: '🤝',
    type: BADGE_TYPES.TEAMWORK,
    points: 15
  },
  skills_improver: {
    id: 'skills_improver',
    name: 'Skills Improver',
    description: 'Showed significant improvement in skills',
    icon: '📈',
    type: BADGE_TYPES.IMPROVEMENT,
    points: 30
  },
  captain_material: {
    id: 'captain_material',
    name: 'Captain Material',
    description: 'Showed leadership qualities',
    icon: '👑',
    type: BADGE_TYPES.LEADERSHIP,
    points: 40
  },
  good_sport: {
    id: 'good_sport',
    name: 'Good Sport',
    description: 'Demonstrated excellent sportsmanship',
    icon: '🏆',
    type: BADGE_TYPES.SPORTSMANSHIP,
    points: 35
  }
};

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

// Upload content (photos, videos, documents)
export const uploadContent = async (juniorId, file, metadata = {}) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `juniors/${juniorId}/content/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save content record to Firestore
    const contentData = {
      fileName: file.name,
      originalName: file.name,
      storagePath: `juniors/${juniorId}/content/${fileName}`,
      downloadURL,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: serverTimestamp(),
      uploadedBy: juniorId,
      metadata: metadata || {},
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'juniorContent'), contentData);
    
    // Update junior's content list
    const juniorRef = doc(db, 'users', juniorId);
    await updateDoc(juniorRef, {
      contentUploads: arrayUnion(docRef.id),
      lastContentUpload: serverTimestamp()
    });
    
    return { id: docRef.id, ...contentData };
  } catch (error) {
    console.error('Error uploading content:', error);
    throw error;
  }
};

// Get content for a junior
export const getJuniorContent = async (juniorId, options = {}) => {
  try {
    let q = query(
      collection(db, 'juniorContent'),
      where('uploadedBy', '==', juniorId),
      where('isActive', '==', true)
    );
    
    q = query(q, orderBy('uploadedAt', 'desc'));
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting junior content:', error);
    throw error;
  }
};

// Delete content
export const deleteContent = async (contentId, juniorId) => {
  try {
    const contentRef = doc(db, 'juniorContent', contentId);
    const contentDoc = await getDoc(contentRef);
    
    if (contentDoc.exists()) {
      const contentData = contentDoc.data();
      
      // Delete from storage
      const storageRef = ref(storage, contentData.storagePath);
      await deleteObject(storageRef);
      
      // Mark as deleted in Firestore
      await updateDoc(contentRef, {
        isActive: false,
        deletedAt: serverTimestamp()
      });
      
      // Remove from junior's content list
      const juniorRef = doc(db, 'users', juniorId);
      await updateDoc(juniorRef, {
        contentUploads: arrayRemove(contentId)
      });
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// ============================================================================
// NOTES AND PROGRESS TRACKING
// ============================================================================

// Add a note for a junior
export const addJuniorNote = async (juniorId, noteData, authorUser) => {
  try {
    const note = {
      juniorId,
      content: noteData.content,
      category: noteData.category || 'general', // general, training, behavior, achievement
      isPrivate: noteData.isPrivate || false, // visible to parents or coaches only
      authorId: authorUser.uid,
      authorName: authorUser.displayName || 'Unknown',
      authorRole: noteData.authorRole || 'coach',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'juniorNotes'), note);
    return { id: docRef.id, ...note };
  } catch (error) {
    console.error('Error adding junior note:', error);
    throw error;
  }
};

// Get notes for a junior
export const getJuniorNotes = async (juniorId, userRole = 'parent') => {
  try {
    let q = query(
      collection(db, 'juniorNotes'),
      where('juniorId', '==', juniorId),
      where('isActive', '==', true)
    );
    
    // Filter private notes for parents
    if (userRole === 'parent') {
      q = query(q, where('isPrivate', '==', false));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting junior notes:', error);
    throw error;
  }
};

// ============================================================================
// GAMIFICATION AND BADGES
// ============================================================================

// Award a badge to a junior
export const awardBadge = async (juniorId, badgeId, awardedBy, reason = '') => {
  try {
    const badge = AVAILABLE_BADGES[badgeId];
    if (!badge) {
      throw new Error('Badge not found');
    }
    
    // Check if junior already has this badge
    const juniorRef = doc(db, 'users', juniorId);
    const juniorDoc = await getDoc(juniorRef);
    
    if (juniorDoc.exists()) {
      const juniorData = juniorDoc.data();
      const currentBadges = juniorData.badges || [];
      
      // Check if badge already awarded
      if (currentBadges.some(b => b.badgeId === badgeId)) {
        throw new Error('Badge already awarded');
      }
      
      const badgeAward = {
        badgeId,
        ...badge,
        awardedAt: serverTimestamp(),
        awardedBy,
        reason
      };
      
      // Add badge to junior's profile
      await updateDoc(juniorRef, {
        badges: arrayUnion(badgeAward),
        totalPoints: (juniorData.totalPoints || 0) + badge.points,
        lastBadgeAwarded: serverTimestamp()
      });
      
      // Create badge award record
      await addDoc(collection(db, 'badgeAwards'), {
        juniorId,
        badgeId,
        awardedBy,
        reason,
        points: badge.points,
        awardedAt: serverTimestamp()
      });
      
      return badgeAward;
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// Get junior's badges and points
export const getJuniorBadges = async (juniorId) => {
  try {
    const juniorRef = doc(db, 'users', juniorId);
    const juniorDoc = await getDoc(juniorRef);
    
    if (juniorDoc.exists()) {
      const data = juniorDoc.data();
      return {
        badges: data.badges || [],
        totalPoints: data.totalPoints || 0,
        level: calculateLevel(data.totalPoints || 0)
      };
    }
    
    return { badges: [], totalPoints: 0, level: 1 };
  } catch (error) {
    console.error('Error getting junior badges:', error);
    throw error;
  }
};

// Calculate level based on points
const calculateLevel = (points) => {
  if (points >= 500) return 10;
  if (points >= 400) return 9;
  if (points >= 300) return 8;
  if (points >= 250) return 7;
  if (points >= 200) return 6;
  if (points >= 150) return 5;
  if (points >= 100) return 4;
  if (points >= 60) return 3;
  if (points >= 30) return 2;
  return 1;
};

// Get leaderboard
export const getJuniorLeaderboard = async (limit = 10) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'junior'),
      orderBy('totalPoints', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// ============================================================================
// PARENT DASHBOARD
// ============================================================================

// Get comprehensive parent dashboard data
export const getParentDashboard = async (juniorId) => {
  try {
    // Get junior's basic info
    const juniorRef = doc(db, 'users', juniorId);
    const juniorDoc = await getDoc(juniorRef);
    
    if (!juniorDoc.exists()) {
      throw new Error('Junior not found');
    }
    
    const juniorData = juniorDoc.data();
    
    // Get recent content
    const recentContent = await getJuniorContent(juniorId, { limit: 5 });
    
    // Get notes
    const notes = await getJuniorNotes(juniorId, 'parent');
    
    // Get badges and points
    const gamification = await getJuniorBadges(juniorId);
    
    // Get recent performance data (simplified)
    const performanceQuery = query(
      collection(db, 'performances'),
      where('playerId', '==', juniorId),
      orderBy('recordedAt', 'desc'),
      limit(5)
    );
    const performanceSnapshot = await getDocs(performanceQuery);
    const recentPerformance = performanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get attendance data (simplified)
    const attendanceQuery = query(
      collection(db, 'events'),
      where('attendance.' + juniorId, '!=', null),
      orderBy('date', 'desc'),
      limit(10)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceData = attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      junior: {
        id: juniorId,
        name: `${juniorData.firstName} ${juniorData.lastName}`,
        ...juniorData
      },
      content: recentContent,
      notes: notes,
      gamification: gamification,
      performance: recentPerformance,
      attendance: attendanceData,
      summary: {
        totalContentUploads: recentContent.length,
        totalNotes: notes.length,
        totalBadges: gamification.badges.length,
        currentLevel: gamification.level,
        totalPoints: gamification.totalPoints
      }
    };
  } catch (error) {
    console.error('Error getting parent dashboard:', error);
    throw error;
  }
};

// Get junior progress summary
export const getJuniorProgressSummary = async (juniorId, timeframe = 'month') => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'season':
        startDate.setMonth(0); // Start of year
        break;
    }
    
    // Get activities in timeframe
    const activitiesQuery = query(
      collection(db, 'juniorNotes'),
      where('juniorId', '==', juniorId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );
    
    const activitiesSnapshot = await getDocs(activitiesQuery);
    const activities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      timeframe,
      startDate,
      endDate,
      activities,
      summary: {
        totalActivities: activities.length,
        trainingNotes: activities.filter(a => a.category === 'training').length,
        achievementNotes: activities.filter(a => a.category === 'achievement').length,
        behaviorNotes: activities.filter(a => a.category === 'behavior').length
      }
    };
  } catch (error) {
    console.error('Error getting progress summary:', error);
    throw error;
  }
}; 