// Firebase Mock Configuration
// This file provides mocks for all Firebase services used in the application

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
};

// Mock Firestore Database
const mockDb = {};

// Mock Firebase Storage
const mockStorage = {};

// Mock Firebase Auth functions
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockUpdateProfile = jest.fn();
const mockSendEmailVerification = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

// Mock Firestore functions
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();
const mockServerTimestamp = jest.fn(() => new Date());
const mockArrayUnion = jest.fn((...args) => args);
const mockArrayRemove = jest.fn((...args) => args);
const mockWriteBatch = jest.fn();
const mockRunTransaction = jest.fn();

// Mock Storage functions
const mockRef = jest.fn();
const mockUploadBytes = jest.fn();
const mockGetDownloadURL = jest.fn();
const mockDeleteObject = jest.fn();

// Setup function to configure all mocks
const setupFirebaseMocks = () => {
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

// Export mocks for individual test files
export {
  mockAuth,
  mockDb,
  mockStorage,
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
};

// Default export for easy import
export default {
  auth: mockAuth,
  db: mockDb,
  storage: mockStorage,
  setupFirebaseMocks,
};
