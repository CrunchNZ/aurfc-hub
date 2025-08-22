import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from './firebase-config';

// Add error handling to Firebase initialization
let app, auth, db, storage;

try {
  console.log('Initializing Firebase...');
  console.log('Firebase config loaded:', firebaseConfig);
  
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('Firestore initialized');
  
  storage = getStorage(app);
  console.log('Firebase Storage initialized');
  
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, db, storage };

// Temporarily disabled emulator connections for MVP testing
// if (import.meta.env.MODE === 'development') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080');
//   connectStorageEmulator(storage, 'localhost', 9199');
// }
