import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Sign up new user
export const signup = async (email, password, role, consent) => {
  if (role === 'junior' && !consent) {
    throw new Error('Parental consent required for junior users');
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role,
      consent: role === 'junior' ? consent : true,
    });
    return user;
  } catch (error) {
    throw error;
  }
};

// Login existing user
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// TODO: Add function to get user role from Firestore

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, data, { merge: true });
  } catch (error) {
    throw error;
  }
};
