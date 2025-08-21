import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  where
} from 'firebase/firestore';

// Chat Service for AURFC Hub
// Handles real-time chat functionality with Firestore

// Send a message to a chat room
export const sendMessage = async (roomId, message, user) => {
  try {
    const messagesRef = collection(db, 'chats', roomId, 'messages');
    const messageData = {
      text: message.text,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userRole: message.userRole || 'player',
      timestamp: serverTimestamp(),
      edited: false,
      editedAt: null
    };
    
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update room's last message and activity
    await updateChatRoom(roomId, {
      lastMessage: message.text,
      lastMessageBy: user.displayName || 'Anonymous',
      lastActivity: serverTimestamp(),
      messageCount: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages from a chat room with real-time updates
export const getMessages = (roomId, callback, messageLimit = 50) => {
  try {
    const messagesRef = collection(db, 'chats', roomId, 'messages');
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })).reverse(); // Reverse to show oldest first
      callback(messages);
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Create or get a chat room
export const createChatRoom = async (roomId, roomData) => {
  try {
    const roomRef = doc(db, 'chats', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      const newRoomData = {
        ...roomData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        messageCount: 0,
        isActive: true
      };
      await setDoc(roomRef, newRoomData);
    }
    
    return roomRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Update chat room metadata
const updateChatRoom = async (roomId, updates) => {
  try {
    const roomRef = doc(db, 'chats', roomId);
    await updateDoc(roomRef, updates);
  } catch (error) {
    console.error('Error updating chat room:', error);
    throw error;
  }
};

// Get chat rooms for a user based on their role
export const getUserChatRooms = (userRole, callback) => {
  try {
    const chatsRef = collection(db, 'chats');
    let q;
    
    // Different rooms based on user role
    if (userRole === 'coach' || userRole === 'admin') {
      // Coaches and admins can see all rooms
      q = query(chatsRef, where('isActive', '==', true));
    } else {
      // Players and juniors see specific rooms
      q = query(
        chatsRef, 
        where('allowedRoles', 'array-contains', userRole),
        where('isActive', '==', true)
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(rooms);
    });
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

// Create default chat rooms for the club
export const initializeDefaultChatRooms = async () => {
  const defaultRooms = [
    {
      id: 'general',
      name: 'General Chat',
      description: 'General discussions for all club members',
      allowedRoles: ['coach', 'player', 'junior', 'parent', 'admin'],
      isPublic: true,
      createdBy: 'system'
    },
    {
      id: 'coaches',
      name: 'Coaches Only',
      description: 'Private discussions for coaches',
      allowedRoles: ['coach', 'admin'],
      isPublic: false,
      createdBy: 'system'
    },
    {
      id: 'players',
      name: 'Players Chat',
      description: 'Chat for all players',
      allowedRoles: ['player', 'coach', 'admin'],
      isPublic: true,
      createdBy: 'system'
    },
    {
      id: 'juniors',
      name: 'Junior Players',
      description: 'Chat for junior players and their parents',
      allowedRoles: ['junior', 'parent', 'coach', 'admin'],
      isPublic: true,
      createdBy: 'system'
    }
  ];
  
  try {
    for (const room of defaultRooms) {
      await createChatRoom(room.id, room);
    }
    console.log('Default chat rooms initialized');
  } catch (error) {
    console.error('Error initializing default chat rooms:', error);
    throw error;
  }
}; 