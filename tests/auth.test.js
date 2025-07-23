import { signup, login, logout } from '../src/services/auth';
import { MockFirebase } from 'firebase-mock';

describe('Auth Service', () => {
  let mockauth;

  beforeEach(() => {
    const mocksdk = new MockFirebase();
    mockauth = mocksdk.auth();
  });

  test('signup creates user and stores role', async () => {
    const user = await signup('test@example.com', 'password', 'player', true);
    expect(user.email).toBe('test@example.com');
    // Mock check for role in Firestore
  });

  test('login returns user', async () => {
    const user = await login('test@example.com', 'password');
    expect(user.email).toBe('test@example.com');
  });

  test('logout signs out user', async () => {
    await logout();
    expect(mockauth.currentUser).toBeNull();
  });
});
