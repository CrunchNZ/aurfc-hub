// Firebase Configuration for AURFC Hub
// Supports development and production environments

import { getFirebaseConfig } from './env.js';

// Get environment-specific Firebase configuration
export const firebaseConfig = getFirebaseConfig();

// Firebase configuration validation
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
};

// Environment-specific Firebase settings
export const firebaseSettings = {
  development: {
    enableEmulator: true,
    enableDebug: true,
    enableAnalytics: false,
    enablePerformance: false,
  },
  production: {
    enableEmulator: false,
    enableDebug: false,
    enableAnalytics: true,
    enablePerformance: true,
  }
};

// Get current environment settings
export const getFirebaseSettings = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? firebaseSettings.development : firebaseSettings.production;
};

// Firebase initialization options
export const firebaseInitOptions = {
  // Performance monitoring
  performance: {
    enable: getFirebaseSettings().enablePerformance,
    dataCollectionEnabled: getFirebaseSettings().enablePerformance,
  },
  
  // Analytics
  analytics: {
    enable: getFirebaseSettings().enableAnalytics,
    measurementId: firebaseConfig.measurementId,
  },
  
  // Storage
  storage: {
    enable: true,
    bucket: firebaseConfig.storageBucket,
  },
  
  // Firestore
  firestore: {
    enable: true,
    projectId: firebaseConfig.projectId,
  },
  
  // Authentication
  auth: {
    enable: true,
    domain: firebaseConfig.authDomain,
  }
};

export default firebaseConfig;
