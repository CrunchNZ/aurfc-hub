import { db } from '../firebase';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const createEvent = async (eventId, data) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await setDoc(eventRef, data);
  } catch (error) {
    throw error;
  }
};

export const rsvpEvent = async (eventId, userId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, { rsvps: arrayUnion(userId) });
  } catch (error) {
    throw error;
  }
};

export const trackAttendance = async (eventId, attendanceData) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, attendanceData);
  } catch (error) {
    throw error;
  }
}; 