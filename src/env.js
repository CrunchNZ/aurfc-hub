// Environment Configuration for AURFC Hub
// Supports development, staging, and production environments

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isPreview = import.meta.env.MODE === 'preview';

// Environment-specific configurations
export const config = {
  // Environment flags
  isDevelopment,
  isProduction,
  isPreview,
  
  // App metadata
  appName: 'AURFC Hub',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  
  // Feature flags
  features: {
    debugMode: isDevelopment,
    analytics: isProduction,
    errorReporting: isProduction,
    performanceMonitoring: isProduction,
  },
  
  // API and service configurations
  api: {
    timeout: isProduction ? 30000 : 60000, // Shorter timeout in production
    retryAttempts: isProduction ? 2 : 3,
  },
  
  // Logging configuration
  logging: {
    level: isDevelopment ? 'debug' : 'warn',
    enableConsole: isDevelopment,
    enableRemote: isProduction,
  },
  
  // Performance configurations
  performance: {
    enableLazyLoading: isProduction,
    enableCodeSplitting: true,
    enableServiceWorker: isProduction,
    enableCompression: isProduction,
  },
  
  // Security configurations
  security: {
    enableCSP: isProduction,
    enableHSTS: isProduction,
    enableXSSProtection: true,
  }
};

// Environment-specific Firebase configuration
export const getFirebaseConfig = () => {
  if (isDevelopment) {
    // Development environment
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  } else {
    // Production environment - use production Firebase project
    return {
      apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_PROD_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }
};

// Environment-specific feature toggles
export const isFeatureEnabled = (featureName) => {
  const featureFlags = {
    // Development features
    debugMode: isDevelopment,
    testMode: isDevelopment || isPreview,
    
    // Production features
    analytics: isProduction,
    errorReporting: isProduction,
    performanceMonitoring: isProduction,
    
    // Always enabled features
    authentication: true,
    teamManagement: true,
    calendar: true,
    chat: true,
    store: true,
    teamBuilder: true,
  };
  
  return featureFlags[featureName] || false;
};

// Performance monitoring configuration
export const getPerformanceConfig = () => ({
  enableMetrics: isProduction,
  sampleRate: isProduction ? 0.1 : 1.0, // Sample 10% in production
  maxEvents: isProduction ? 1000 : 10000,
  flushInterval: isProduction ? 5000 : 1000,
});

// Error reporting configuration
export const getErrorReportingConfig = () => ({
  enableReporting: isProduction,
  reportUnhandledErrors: isProduction,
  reportConsoleErrors: isDevelopment,
  maxErrorsPerSession: isProduction ? 10 : 100,
});

// Analytics configuration
export const getAnalyticsConfig = () => ({
  enableTracking: isProduction,
  trackPageViews: isProduction,
  trackUserActions: isProduction,
  trackPerformance: isProduction,
  anonymizeData: isProduction,
});

export default config; 