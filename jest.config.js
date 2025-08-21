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
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.jsx',
    '!src/index.css',
  ],
}; 