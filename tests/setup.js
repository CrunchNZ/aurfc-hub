require('whatwg-fetch');

// Set test environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = 'test-sender';
process.env.VITE_FIREBASE_APP_ID = 'test-app-id';
process.env.VITE_FIREBASE_MEASUREMENT_ID = 'test-measurement';

// Import our custom Firebase mocks
import {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockUpdateProfile,
  mockSendEmailVerification,
  mockSendPasswordResetEmail,
  mockCollection,
  mockDoc,
  mockGetDoc,
  mockGetDocs,
  mockAddDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockStartAfter,
  mockServerTimestamp,
  mockArrayUnion,
  mockArrayRemove,
  mockWriteBatch,
  mockRunTransaction,
  mockRef,
  mockUploadBytes,
  mockGetDownloadURL,
  mockDeleteObject,
  setupFirebaseMocks,
} from './firebase-mock';

// Mock Firebase modules globally using our custom mocks
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
  sendEmailVerification: mockSendEmailVerification,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  addDoc: mockAddDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
  serverTimestamp: mockServerTimestamp,
  arrayUnion: mockArrayUnion,
  arrayRemove: mockArrayRemove,
  writeBatch: mockWriteBatch,
  runTransaction: mockRunTransaction,
}));

jest.mock('firebase/storage', () => ({
  ref: mockRef,
  uploadBytes: mockUploadBytes,
  getDownloadURL: mockGetDownloadURL,
  deleteObject: mockDeleteObject,
}));

// Mock the Firebase app initialization
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({})),
  getFirestore: jest.fn(() => ({})),
  getStorage: jest.fn(() => ({})),
}));

// Mock our Firebase configuration module
jest.mock('../src/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {},
}));

// Setup Firebase mocks before each test
beforeEach(() => {
  setupFirebaseMocks();
}); 