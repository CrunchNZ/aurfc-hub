// Firebase Mocks for Testing
// This file provides comprehensive mocks for all Firebase services used in tests

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
};

// Mock Firestore Database
export const mockDb = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  arrayUnion: jest.fn((...args) => args),
  arrayRemove: jest.fn((...args) => args),
  writeBatch: jest.fn(),
  runTransaction: jest.fn(),
};

// Mock Firebase Storage
export const mockStorage = {
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
};

// Mock Firebase Auth functions
export const mockCreateUserWithEmailAndPassword = jest.fn();
export const mockSignInWithEmailAndPassword = jest.fn();
export const mockSignOut = jest.fn();
export const mockUpdateProfile = jest.fn();
export const mockSendEmailVerification = jest.fn();
export const mockSendPasswordResetEmail = jest.fn();

// Mock Firestore functions
export const mockCollection = jest.fn();
export const mockDoc = jest.fn();
export const mockGetDoc = jest.fn();
export const mockGetDocs = jest.fn();
export const mockAddDoc = jest.fn();
export const mockSetDoc = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDeleteDoc = jest.fn();
export const mockQuery = jest.fn();
export const mockWhere = jest.fn();
export const mockOrderBy = jest.fn();
export const mockLimit = jest.fn();
export const mockStartAfter = jest.fn();
export const mockServerTimestamp = jest.fn(() => new Date());
export const mockArrayUnion = jest.fn((...args) => args);
export const mockArrayRemove = jest.fn((...args) => args);
export const mockWriteBatch = jest.fn();
export const mockRunTransaction = jest.fn();

// Mock Storage functions
export const mockRef = jest.fn();
export const mockUploadBytes = jest.fn();
export const mockGetDownloadURL = jest.fn();
export const mockDeleteObject = jest.fn();

// Setup function to configure all mocks
export const setupFirebaseMocks = () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Configure mock return values
  mockDoc.mockReturnValue('mockDocRef');
  mockCollection.mockReturnValue('mockCollectionRef');
  mockRef.mockReturnValue('mockStorageRef');
  mockGetDoc.mockResolvedValue({ 
    exists: () => true, 
    data: () => ({ test: 'data' }) 
  });
  mockGetDocs.mockResolvedValue({ 
    docs: [{ id: 'test', data: () => ({ test: 'data' }) }] 
  });
  mockSetDoc.mockResolvedValue();
  mockUpdateDoc.mockResolvedValue();
  mockAddDoc.mockResolvedValue({ id: 'test' });
  mockDeleteDoc.mockResolvedValue();
  mockUploadBytes.mockResolvedValue();
  mockGetDownloadURL.mockResolvedValue('https://example.com/file');
  
  // Configure query mocks
  mockQuery.mockReturnValue('mockQuery');
  mockWhere.mockReturnValue('mockWhere');
  mockOrderBy.mockReturnValue('mockOrderBy');
  mockLimit.mockReturnValue('mockLimit');
  mockStartAfter.mockReturnValue('mockStartAfter');
  
  // Configure batch and transaction mocks
  mockWriteBatch.mockReturnValue({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
  });
  mockRunTransaction.mockResolvedValue('mockTransactionResult');
};

// Export default mocks for easy import
export default {
  auth: mockAuth,
  db: mockDb,
  storage: mockStorage,
  setupFirebaseMocks,
  // Auth functions
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
  sendEmailVerification: mockSendEmailVerification,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  // Firestore functions
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
  // Storage functions
  ref: mockRef,
  uploadBytes: mockUploadBytes,
  getDownloadURL: mockGetDownloadURL,
  deleteObject: mockDeleteObject,
};
