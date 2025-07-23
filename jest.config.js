module.exports = {
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^\\./env$': '<rootDir>/tests/env-mock.js',
    '^\\./env\\.js$': '<rootDir>/tests/env-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
}; 