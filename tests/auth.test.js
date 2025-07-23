import { signup, login, logout } from '../src/services/auth';
import { auth } from '../src/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

jest.mock('../src/firebase', () => ({
  auth: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signup calls createUserWithEmailAndPassword', async () => {
    const mockUserCredential = { user: { email: 'test@example.com' } };
    createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
    const user = await signup('test@example.com', 'password', 'player');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
    expect(user.email).toBe('test@example.com');
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
});
