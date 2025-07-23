import { db } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export const createRoster = async (teamId, data) => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await setDoc(teamRef, data);
  } catch (error) {
    throw error;
  }
};

export const trackPerformance = async (playerId, data) => {
  try {
    const perfRef = doc(db, 'performances', playerId);
    await updateDoc(perfRef, data);
  } catch (error) {
    throw error;
  }
};

export const createDrill = async (drillId, data) => {
  try {
    const drillRef = doc(db, 'drills', drillId);
    await setDoc(drillRef, data);
  } catch (error) {
    throw error;
  }
}; 