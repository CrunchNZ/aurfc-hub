import { signup, login, logout } from '../src/services/auth';
import { auth, db } from '../src/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

jest.mock('../src/firebase', () => ({
  auth: jest.fn(),
  db: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
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
    doc.mockReturnValue('mockDocRef');
    setDoc.mockResolvedValue();
    const user = await signup('test@example.com', 'password', 'player', true);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
    expect(doc).toHaveBeenCalledWith(db, 'users', '123');
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', {
      email: 'test@example.com',
      role: 'player',
      consent: true,
    });
    expect(user).toBe(mockUser);
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
    await expect(signup('junior@example.com', 'password', 'junior', false)).rejects.toThrow('Parental consent required for junior users');
  });
});
