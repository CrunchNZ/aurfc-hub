import { signup, login, logout, updateUserProfile } from '../src/services/auth';
import { auth, db } from '../src/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

jest.mock('../src/firebase', () => ({
  auth: jest.fn(),
  db: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signup calls createUserWithEmailAndPassword and stores user data in Firestore', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    const mockUserCredential = { user: mockUser };
    createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    updateProfile.mockResolvedValue();
    sendEmailVerification.mockResolvedValue();
    doc.mockReturnValue('mockDocRef');
    setDoc.mockResolvedValue();
    
    const userData = {
      role: 'player',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      parentEmail: null,
      consent: true,
      teamPreference: null
    };
    
    const result = await signup('test@example.com', 'password', userData);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
    expect(updateProfile).toHaveBeenCalledWith(mockUser, {
      displayName: 'Test User'
    });
    expect(doc).toHaveBeenCalledWith(db, 'users', '123');
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', expect.objectContaining({
      uid: '123',
      email: 'test@example.com',
      role: 'player',
      consent: true
    }));
    expect(result.user).toBe(mockUser);
  });

  test('login calls signInWithEmailAndPassword', async () => {
    const mockUserCredential = { user: { email: 'test@example.com' } };
    signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    const user = await login('test@example.com', 'password');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
    expect(user.email).toBe('test@example.com');
  });

  test('logout calls signOut', async () => {
    signOut.mockResolvedValue();
    await logout();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  test('signup fails without consent for junior role', async () => {
    const userData = {
      role: 'junior',
      firstName: 'Junior',
      lastName: 'User',
      dateOfBirth: '2010-01-01',
      parentEmail: 'parent@example.com',
      consent: false,
      teamPreference: null
    };
    await expect(signup('junior@example.com', 'password', userData)).rejects.toThrow('Parental consent required for junior users');
  });

  test('updateUserProfile updates user data in Firestore', async () => {
    const mockUserId = '123';
    const mockData = { name: 'Test User' };
    doc.mockReturnValue('mockDocRef');
    setDoc.mockResolvedValue();
    await updateUserProfile(mockUserId, mockData);
    expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', expect.objectContaining({
      name: 'Test User',
      updatedAt: expect.any(Date)
    }), { merge: true });
  });
});
