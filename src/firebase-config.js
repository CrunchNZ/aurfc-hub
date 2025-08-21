// Firebase Configuration for AURFC Hub
// This file contains the real Firebase configuration values

const firebaseConfig = {
  // Development Environment (aurfc-dev-2e9f9)
  dev: {
    apiKey: "AIzaSyBbIxEEp_tVNs5RtcQH32P6rOTqSTqEWg8",
    authDomain: "aurfc-dev-2e9f9.firebaseapp.com",
    projectId: "aurfc-dev-2e9f9",
    storageBucket: "aurfc-dev-2e9f9.firebasestorage.app",
    messagingSenderId: "299799672333",
    appId: "1:299799672333:web:257566c923c237650cc744",
    measurementId: "G-CH793ZTC12"
  },
  
  // Test Environment (aurfc-test)
  test: {
    apiKey: "your_test_api_key",
    authDomain: "aurfc-test.firebaseapp.com",
    projectId: "aurfc-test",
    storageBucket: "aurfc-test.appspot.com",
    messagingSenderId: "your_test_sender_id",
    appId: "your_test_app_id",
    measurementId: "your_test_measurement_id"
  },
  
  // Production Environment (aurfc-prod)
  prod: {
    apiKey: "your_prod_api_key",
    authDomain: "aurfc-prod.firebaseapp.com",
    projectId: "aurfc-prod",
    storageBucket: "aurfc-prod.appspot.com",
    messagingSenderId: "your_prod_sender_id",
    appId: "your_prod_app_id",
    measurementId: "your_prod_measurement_id"
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'dev';
  } else if (hostname.includes('test') || hostname.includes('staging')) {
    return 'test';
  } else {
    return 'prod';
  }
};

// Export the configuration for the current environment
export const getFirebaseConfig = () => {
  const env = getCurrentEnvironment();
  return firebaseConfig[env] || firebaseConfig.dev;
};

export default firebaseConfig;
