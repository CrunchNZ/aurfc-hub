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
  writeBatch
} from 'firebase/firestore';

// Notifications Service for AURFC Hub
// Handles in-app notifications and announcements

// Notification types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  TEAM_UPDATE: 'team_update',
  PAYMENT: 'payment',
  SYSTEM: 'system'
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      isRead: false,
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send notification to specific users
export const sendNotificationToUsers = async (userIds, notificationData) => {
  try {
    const batch = writeBatch(db);
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = {
        ...notificationData,
        recipientId: userId,
        createdAt: serverTimestamp(),
        isRead: false,
        isActive: true
      };
      
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, notification);
      notifications.push({ id: notificationRef.id, ...notification });
    }
    
    await batch.commit();
    return notifications;
  } catch (error) {
    console.error('Error sending notifications to users:', error);
    throw error;
  }
};

// Send notification to users by role
export const sendNotificationToRole = async (role, notificationData) => {
  try {
    const notification = {
      ...notificationData,
      targetRole: role,
      recipientId: null, // null means it's for all users of this role
      createdAt: serverTimestamp(),
      isRead: false,
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  } catch (error) {
    console.error('Error sending notification to role:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = (userId, userRole, callback, notificationLimit = 20) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Query for notifications targeted to this user or their role
    const q = query(
      notificationsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(notificationLimit)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(notification => {
          // Include if targeted to specific user or to user's role
          return notification.recipientId === userId || 
                 notification.targetRole === userRole ||
                 notification.targetRole === 'all';
        });
      
      callback(notifications);
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId, userRole) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('isActive', '==', true),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(docSnapshot => {
      const notification = docSnapshot.data();
      // Only mark as read if it's for this user or their role
      if (notification.recipientId === userId || 
          notification.targetRole === userRole ||
          notification.targetRole === 'all') {
        batch.update(docSnapshot.ref, {
          isRead: true,
          readAt: serverTimestamp()
        });
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Helper functions for common notification scenarios

// Notify about new chat message
export const notifyNewChatMessage = async (roomId, roomName, senderName, message, excludeUserId) => {
  // This would typically get users in the room and send notifications
  // For now, we'll send to all users except the sender
  const notification = {
    type: NOTIFICATION_TYPES.MESSAGE,
    title: `New message in ${roomName}`,
    message: `${senderName}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
    data: {
      roomId,
      roomName,
      senderName
    },
    targetRole: 'all' // Would be more specific in real implementation
  };
  
  return await createNotification(notification);
};

// Notify about new event
export const notifyNewEvent = async (eventData, targetRoles = ['all']) => {
  const notifications = [];
  
  for (const role of targetRoles) {
    const notification = {
      type: NOTIFICATION_TYPES.EVENT,
      title: 'New Event Created',
      message: `${eventData.title} - ${eventData.date}`,
      data: {
        eventId: eventData.id,
        eventTitle: eventData.title,
        eventDate: eventData.date
      },
      targetRole: role
    };
    
    const notificationId = await sendNotificationToRole(role, notification);
    notifications.push(notificationId);
  }
  
  return notifications;
};

// Notify about team updates
export const notifyTeamUpdate = async (teamId, teamName, updateType, updateMessage, targetRoles = ['player', 'coach']) => {
  const notifications = [];
  
  for (const role of targetRoles) {
    const notification = {
      type: NOTIFICATION_TYPES.TEAM_UPDATE,
      title: `Team Update - ${teamName}`,
      message: updateMessage,
      data: {
        teamId,
        teamName,
        updateType
      },
      targetRole: role
    };
    
    const notificationId = await sendNotificationToRole(role, notification);
    notifications.push(notificationId);
  }
  
  return notifications;
};

// Notify about system announcements
export const notifySystemAnnouncement = async (title, message, targetRoles = ['all']) => {
  const notifications = [];
  
  for (const role of targetRoles) {
    const notification = {
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title,
      message,
      data: {},
      targetRole: role
    };
    
    const notificationId = await sendNotificationToRole(role, notification);
    notifications.push(notificationId);
  }
  
  return notifications;
};
