import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile as updateAuthProfile } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export { auth };

// Sign up new user
export const signup = async (email, password, userData) => {
  const { role, firstName, lastName, dateOfBirth, parentEmail, consent, teamPreference } = userData;
  
  if (role === 'junior' && !consent) {
    throw new Error('Parental consent required for junior users');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Firebase Auth profile
    await updateAuthProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email,
      firstName,
      lastName,
      role,
      dateOfBirth: new Date(dateOfBirth),
      teamPreference: teamPreference || null,
      parentEmail: role === 'junior' ? parentEmail : null,
      consent: role === 'junior' ? consent : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: user.emailVerified,
      profileComplete: false
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    // Send verification email
    if (!user.emailVerified) {
      await sendEmailVerification(user);
    }
    
    return { user, userDoc };
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

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Get user role
export const getUserRole = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return userData?.role || 'player';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'player';
  }
};

// Check if user has permission for action
export const hasPermission = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

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

export const updateUserProfile = async (userId, data) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    await setDoc(userDoc, updateData, { merge: true });
  } catch (error) {
    throw error;
  }
};
