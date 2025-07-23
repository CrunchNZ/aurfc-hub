import { login } from '../src/services/auth';

// Mock Firebase auth for testing
describe('Auth Service', () => {
  test('login function exists', () => {
    expect(login).toBeDefined();
  });

  // TODO: Add more comprehensive tests with mocked Firebase
});
