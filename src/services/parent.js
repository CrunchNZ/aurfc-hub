// Parent Service for AURFC Hub
// Handles parent account management, child oversight, and family coordination

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
  arrayRemove
} from 'firebase/firestore';

// ============================================================================
// PARENT ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Create or update parent account
 * @param {string} parentId - Parent user ID
 * @param {Object} parentData - Parent account data
 * @returns {Promise<Object>} Created/updated parent data
 */
export const createParentAccount = async (parentId, parentData) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    const parentDoc = {
      ...parentData,
      children: [],
      familySettings: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          showFamilyInfo: true,
          allowChildContact: false
        },
        calendar: {
          syncWithPersonal: true,
          defaultReminders: [60, 1440] // 1 hour and 1 day before
        }
      },
      emergencyContacts: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(parentRef, parentDoc);
    return { id: parentId, ...parentDoc };
  } catch (error) {
    console.error('Error creating parent account:', error);
    throw error;
  }
};

/**
 * Get parent account by ID
 * @param {string} parentId - Parent user ID
 * @returns {Promise<Object|null>} Parent account data
 */
export const getParentAccount = async (parentId) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    const parentSnap = await getDoc(parentRef);
    
    if (parentSnap.exists()) {
      return { id: parentSnap.id, ...parentSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting parent account:', error);
    throw error;
  }
};

/**
 * Update parent account
 * @param {string} parentId - Parent user ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated parent data
 */
export const updateParentAccount = async (parentId, updates) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    await updateDoc(parentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error updating parent account:', error);
    throw error;
  }
};

// ============================================================================
// CHILD MANAGEMENT
// ============================================================================

/**
 * Add child to parent account
 * @param {string} parentId - Parent user ID
 * @param {string} childId - Child user ID
 * @param {Object} childData - Child relationship data
 * @returns {Promise<Object>} Updated parent account
 */
export const addChildToParent = async (parentId, childId, childData) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    const childRef = doc(db, 'users', childId);
    
    // Verify child exists and is a junior
    const childSnap = await getDoc(childRef);
    if (!childSnap.exists()) {
      throw new Error('Child user not found');
    }
    
    const childUserData = childSnap.data();
    if (childUserData.role !== 'player') {
      throw new Error('User is not a junior player');
    }
    
    // Add child to parent's children array
    const childInfo = {
      childId,
      firstName: childUserData.firstName,
      lastName: childUserData.lastName,
      dateOfBirth: childUserData.dateOfBirth,
      teamPreference: childUserData.teamPreference,
      relationship: childData.relationship || 'child',
      addedAt: serverTimestamp(),
      permissions: {
        viewSchedule: true,
        viewPerformance: true,
        viewPayments: true,
        manageRSVP: true,
        receiveNotifications: true
      }
    };
    
    await updateDoc(parentRef, {
      children: arrayUnion(childInfo)
    });
    
    // Update child's parent reference
    await updateDoc(childRef, {
      parentId: parentId,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error adding child to parent:', error);
    throw error;
  }
};

/**
 * Remove child from parent account
 * @param {string} parentId - Parent user ID
 * @param {string} childId - Child user ID
 * @returns {Promise<Object>} Updated parent account
 */
export const removeChildFromParent = async (parentId, childId) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    const childRef = doc(db, 'users', childId);
    
    // Get current parent data
    const parentData = await getParentAccount(parentId);
    const updatedChildren = parentData.children.filter(child => child.childId !== childId);
    
    // Update parent account
    await updateDoc(parentRef, {
      children: updatedChildren,
      updatedAt: serverTimestamp()
    });
    
    // Remove parent reference from child
    await updateDoc(childRef, {
      parentId: null,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error removing child from parent:', error);
    throw error;
  }
};

/**
 * Update child permissions
 * @param {string} parentId - Parent user ID
 * @param {string} childId - Child user ID
 * @param {Object} permissions - New permissions
 * @returns {Promise<Object>} Updated parent account
 */
export const updateChildPermissions = async (parentId, childId, permissions) => {
  try {
    const parentData = await getParentAccount(parentId);
    const updatedChildren = parentData.children.map(child => {
      if (child.childId === childId) {
        return {
          ...child,
          permissions: {
            ...child.permissions,
            ...permissions
          }
        };
      }
      return child;
    });
    
    await updateDoc(doc(db, 'parents', parentId), {
      children: updatedChildren,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error updating child permissions:', error);
    throw error;
  }
};

// ============================================================================
// FAMILY OVERVIEW & COORDINATION
// ============================================================================

/**
 * Get comprehensive family overview
 * @param {string} parentId - Parent user ID
 * @returns {Promise<Object>} Family overview data
 */
export const getFamilyOverview = async (parentId) => {
  try {
    const parentData = await getParentAccount(parentId);
    if (!parentData || !parentData.children) {
      return { children: [], upcomingEvents: [], recentActivity: [] };
    }
    
    // Get detailed information for each child
    const childrenDetails = await Promise.all(
      parentData.children.map(async (child) => {
        const childUserData = await getDoc(doc(db, 'users', child.childId));
        const childData = childUserData.exists() ? childUserData.data() : null;
        
        if (!childData) return null;
        
        return {
          ...child,
          userData: childData,
          // Additional child-specific data can be fetched here
          // such as upcoming events, recent performances, etc.
        };
      })
    );
    
    // Filter out any null children
    const validChildren = childrenDetails.filter(child => child !== null);
    
    return {
      children: validChildren,
      familySettings: parentData.familySettings,
      emergencyContacts: parentData.emergencyContacts
    };
  } catch (error) {
    console.error('Error getting family overview:', error);
    throw error;
  }
};

/**
 * Get family calendar events
 * @param {string} parentId - Parent user ID
 * @param {Date} startDate - Start date for events
 * @param {Date} endDate - End date for events
 * @returns {Promise<Array>} Array of family events
 */
export const getFamilyCalendarEvents = async (parentId, startDate, endDate) => {
  try {
    const parentData = await getParentAccount(parentId);
    if (!parentData || !parentData.children) {
      return [];
    }
    
    const childIds = parentData.children.map(child => child.childId);
    
    // Query events that involve any of the children
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('targetRoles', 'array-contains-any', ['player', 'all']),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const eventsSnap = await getDocs(q);
    const events = eventsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter events to only include those relevant to the family
    // This could be enhanced with more sophisticated filtering logic
    return events;
  } catch (error) {
    console.error('Error getting family calendar events:', error);
    throw error;
  }
};

// ============================================================================
// NOTIFICATION MANAGEMENT
// ============================================================================

/**
 * Update family notification preferences
 * @param {string} parentId - Parent user ID
 * @param {Object} notificationSettings - New notification settings
 * @returns {Promise<Object>} Updated parent account
 */
export const updateFamilyNotifications = async (parentId, notificationSettings) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    await updateDoc(parentRef, {
      'familySettings.notifications': notificationSettings,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error updating family notifications:', error);
    throw error;
  }
};

/**
 * Get family notification preferences
 * @param {string} parentId - Parent user ID
 * @returns {Promise<Object>} Notification preferences
 */
export const getFamilyNotificationPreferences = async (parentId) => {
  try {
    const parentData = await getParentAccount(parentId);
    return parentData?.familySettings?.notifications || {
      email: true,
      push: true,
      sms: false
    };
  } catch (error) {
    console.error('Error getting family notification preferences:', error);
    throw error;
  }
};

// ============================================================================
// EMERGENCY CONTACTS
// ============================================================================

/**
 * Add emergency contact to family
 * @param {string} parentId - Parent user ID
 * @param {Object} contactData - Emergency contact information
 * @returns {Promise<Object>} Updated parent account
 */
export const addEmergencyContact = async (parentId, contactData) => {
  try {
    const parentRef = doc(db, 'parents', parentId);
    const contact = {
      ...contactData,
      id: Date.now().toString(), // Simple ID generation
      addedAt: serverTimestamp()
    };
    
    await updateDoc(parentRef, {
      emergencyContacts: arrayUnion(contact)
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

/**
 * Remove emergency contact from family
 * @param {string} parentId - Parent user ID
 * @param {string} contactId - Contact ID to remove
 * @returns {Promise<Object>} Updated parent account
 */
export const removeEmergencyContact = async (parentId, contactId) => {
  try {
    const parentData = await getParentAccount(parentId);
    const updatedContacts = parentData.emergencyContacts.filter(
      contact => contact.id !== contactId
    );
    
    await updateDoc(doc(db, 'parents', parentId), {
      emergencyContacts: updatedContacts,
      updatedAt: serverTimestamp()
    });
    
    return await getParentAccount(parentId);
  } catch (error) {
    console.error('Error removing emergency contact:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is a parent
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if user is a parent
 */
export const isUserParent = async (userId) => {
  try {
    const parentData = await getParentAccount(userId);
    return parentData !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get all parents
 * @returns {Promise<Array>} Array of all parent accounts
 */
export const getAllParents = async () => {
  try {
    const parentsRef = collection(db, 'parents');
    const parentsSnap = await getDocs(parentsRef);
    
    return parentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all parents:', error);
    throw error;
  }
};
