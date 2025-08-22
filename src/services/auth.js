import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile as updateAuthProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { usersService } from './database';

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
    
    // Create user document in Firestore using the database service
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
      isActive: true,
      emailVerified: user.emailVerified,
      profileComplete: false
    };
    
    await usersService.createUser(user.uid, userDoc);
    
    // If user is a parent, create parent account
    if (role === 'parent') {
      try {
        const { createParentAccount } = await import('./parent');
        await createParentAccount(user.uid, {
          firstName,
          lastName,
          email,
          phone: userData.phone || null
        });
      } catch (parentError) {
        console.warn('Failed to create parent account:', parentError);
        // Don't fail the signup if parent account creation fails
      }
    }
    
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
    return await usersService.getUser(uid);
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
    return await usersService.getUsersByRole(role);
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

// Session management
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Get current user's role
export const getCurrentUserRole = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No current user found');
      return null;
    }
    
    console.log('Getting user data for UID:', user.uid);
    const userData = await getUserData(user.uid);
    console.log('User data retrieved:', userData);
    
    if (!userData) {
      console.warn('No user data found in Firestore');
      return null;
    }
    
    return userData.role || null;
  } catch (error) {
    console.error('Error getting current user role:', error);
    throw error; // Re-throw to show actual error message
  }
};

// Check if current user has specific role
export const hasRole = async (requiredRole) => {
  try {
    const userRole = await getCurrentUserRole();
    return userRole === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Check if current user has any of the required roles
export const hasAnyRole = async (requiredRoles) => {
  try {
    const userRole = await getCurrentUserRole();
    return requiredRoles.includes(userRole);
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user profile with role-based data
export const getCurrentUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userData = await getUserData(user.uid);
    if (!userData) return null;
    
    // Add additional role-specific data
    if (userData.role === 'junior') {
      // Import junior service dynamically to avoid circular dependencies
      const { juniorsService } = await import('./database');
      const juniorProfile = await juniorsService.getJuniorProfile(user.uid);
      return { ...userData, juniorProfile };
    }
    
    return userData;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    return await usersService.updateUser(userId, data);
  } catch (error) {
    throw error;
  }
};
