import { db } from '../firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

export const sendMessage = async (roomId, message) => {
  try {
    const messagesRef = collection(db, 'chats', roomId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getMessages = (roomId, callback) => {
  const messagesRef = collection(db, 'chats', roomId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}; 