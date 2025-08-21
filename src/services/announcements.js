import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  where,
  updateDoc,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { notifySystemAnnouncement } from './notifications';

// Announcements Service for AURFC Hub
// Handles club announcements and news feed

// Announcement priorities
export const ANNOUNCEMENT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Announcement categories
export const ANNOUNCEMENT_CATEGORIES = {
  GENERAL: 'general',
  TRAINING: 'training',
  MATCH: 'match',
  SOCIAL: 'social',
  FINANCIAL: 'financial',
  JUNIOR: 'junior',
  COACHING: 'coaching'
};

// Create a new announcement
export const createAnnouncement = async (announcementData, authorUser) => {
  try {
    const announcement = {
      ...announcementData,
      authorId: authorUser.uid,
      authorName: authorUser.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      viewCount: 0,
      reactions: {
        likes: 0,
        hearts: 0,
        thumbsUp: 0
      },
      comments: []
    };
    
    const docRef = await addDoc(collection(db, 'announcements'), announcement);
    
    // Send notification to relevant users
    if (announcement.sendNotification !== false) {
      await notifySystemAnnouncement(
        announcement.title,
        announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
        announcement.targetRoles || ['all']
      );
    }
    
    return { id: docRef.id, ...announcement };
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

// Get announcements with filtering options
export const getAnnouncements = (callback, options = {}) => {
  try {
    const {
      category = null,
      priority = null,
      targetRole = null,
      limitCount = 20,
      onlyActive = true
    } = options;
    
    let q = query(collection(db, 'announcements'));
    
    // Apply filters
    if (onlyActive) {
      q = query(q, where('isActive', '==', true));
    }
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (priority) {
      q = query(q, where('priority', '==', priority));
    }
    
    if (targetRole && targetRole !== 'all') {
      q = query(q, where('targetRoles', 'array-contains', targetRole));
    }
    
    // Order by creation date (newest first) and limit
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
    
    return onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(announcements);
    });
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
};

// Get announcements for a specific user role
export const getAnnouncementsForRole = (userRole, callback, limitCount = 20) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(
      announcementsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(announcement => {
          // Include if no specific target roles or if user's role is included
          return !announcement.targetRoles || 
                 announcement.targetRoles.length === 0 ||
                 announcement.targetRoles.includes('all') ||
                 announcement.targetRoles.includes(userRole);
        });
      
      callback(announcements);
    });
  } catch (error) {
    console.error('Error getting announcements for role:', error);
    throw error;
  }
};

// Update an announcement
export const updateAnnouncement = async (announcementId, updates) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(announcementRef, updateData);
    return { id: announcementId, ...updateData };
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

// Delete an announcement (soft delete)
export const deleteAnnouncement = async (announcementId) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Add reaction to announcement
export const addReactionToAnnouncement = async (announcementId, reactionType, userId) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    const announcementDoc = await getDoc(announcementRef);
    
    if (announcementDoc.exists()) {
      const announcement = announcementDoc.data();
      const currentReactions = announcement.reactions || {};
      const userReactions = announcement.userReactions || {};
      
      // Remove previous reaction by this user
      if (userReactions[userId]) {
        const prevReaction = userReactions[userId];
        currentReactions[prevReaction] = Math.max(0, (currentReactions[prevReaction] || 0) - 1);
      }
      
      // Add new reaction
      currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
      userReactions[userId] = reactionType;
      
      await updateDoc(announcementRef, {
        reactions: currentReactions,
        userReactions: userReactions,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error adding reaction to announcement:', error);
    throw error;
  }
};

// Remove reaction from announcement
export const removeReactionFromAnnouncement = async (announcementId, userId) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    const announcementDoc = await getDoc(announcementRef);
    
    if (announcementDoc.exists()) {
      const announcement = announcementDoc.data();
      const currentReactions = announcement.reactions || {};
      const userReactions = announcement.userReactions || {};
      
      if (userReactions[userId]) {
        const reactionType = userReactions[userId];
        currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] || 0) - 1);
        delete userReactions[userId];
        
        await updateDoc(announcementRef, {
          reactions: currentReactions,
          userReactions: userReactions,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error removing reaction from announcement:', error);
    throw error;
  }
};

// Increment view count
export const incrementAnnouncementViewCount = async (announcementId) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    const announcementDoc = await getDoc(announcementRef);
    
    if (announcementDoc.exists()) {
      const currentViewCount = announcementDoc.data().viewCount || 0;
      await updateDoc(announcementRef, {
        viewCount: currentViewCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
};

// Helper function to create common announcement types
export const createMatchAnnouncement = async (matchData, authorUser) => {
  const announcement = {
    title: `Match: ${matchData.homeTeam} vs ${matchData.awayTeam}`,
    content: `Match scheduled for ${matchData.date} at ${matchData.venue}. ${matchData.additionalInfo || ''}`,
    category: ANNOUNCEMENT_CATEGORIES.MATCH,
    priority: ANNOUNCEMENT_PRIORITIES.HIGH,
    targetRoles: ['player', 'coach', 'parent'],
    data: {
      matchId: matchData.id,
      date: matchData.date,
      venue: matchData.venue,
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam
    }
  };
  
  return await createAnnouncement(announcement, authorUser);
};

export const createTrainingAnnouncement = async (trainingData, authorUser) => {
  const announcement = {
    title: `Training Session: ${trainingData.title}`,
    content: `Training scheduled for ${trainingData.date} at ${trainingData.venue}. ${trainingData.description || ''}`,
    category: ANNOUNCEMENT_CATEGORIES.TRAINING,
    priority: ANNOUNCEMENT_PRIORITIES.NORMAL,
    targetRoles: trainingData.targetRoles || ['player', 'coach'],
    data: {
      trainingId: trainingData.id,
      date: trainingData.date,
      venue: trainingData.venue,
      type: trainingData.type
    }
  };
  
  return await createAnnouncement(announcement, authorUser);
};
