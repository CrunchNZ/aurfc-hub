import { db, storage } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadContent = async (juniorId, fileName, content) => {
  try {
    const storageRef = ref(storage, `juniors/${juniorId}/${fileName}`);
    await uploadBytes(storageRef, content);
    const url = await getDownloadURL(storageRef);
    const juniorRef = doc(db, 'juniors', juniorId);
    await updateDoc(juniorRef, { content: url });
  } catch (error) {
    throw error;
  }
};

export const awardBadge = async (juniorId, badge) => {
  try {
    const badgeRef = doc(db, 'badges', juniorId);
    await updateDoc(badgeRef, { badges: arrayUnion(badge) });
  } catch (error) {
    throw error;
  }
};

export const getParentDashboard = async (juniorId) => {
  try {
    const juniorRef = doc(db, 'juniors', juniorId);
    const docSnap = await getDoc(juniorRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
}; 