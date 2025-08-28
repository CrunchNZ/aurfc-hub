import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertTriangle size={32} className="text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-text-secondary mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-red-600 overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;

