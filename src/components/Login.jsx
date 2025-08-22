import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login, resetPassword } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import Logo from './Logo';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userProfile } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      // Login successful - the useEffect will handle the redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      setError('Please enter an email address');
      return;
    }
    
    setResetLoading(true);
    setError(null);
    
    try {
      await resetPassword(resetEmail);
      alert('Password reset email sent to ' + resetEmail);
      setResetEmail('');
      setShowResetForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark p-4">
      {/* Rugby-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-green rounded-full opacity-10 animate-bounce-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 bg-accent-gold rounded-full opacity-10 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* AURFC Logo/Header */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Logo variant="icon" size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AURFC Hub</h1>
          <p className="text-white/80 text-sm">Auckland University Rugby Football Club</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-card shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-primary text-center mb-6">Welcome Back</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Temporary Test User Creation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🧪 Development: Create Test User</h3>
            <p className="text-xs text-blue-600 mb-3">
              Use this button to create a test account for development purposes.
            </p>
            <button
              onClick={async () => {
                try {
                  const { createUserWithEmailAndPassword } = await import('firebase/auth');
                  const userCredential = await createUserWithEmailAndPassword(
                    auth, 
                    'test@aurfc.com', 
                    'testpass123'
                  );
                  alert(`Test user created successfully! UID: ${userCredential.user.uid}`);
                  setEmail('test@aurfc.com');
                  setPassword('testpass123');
                } catch (err) {
                  if (err.code === 'auth/email-already-in-use') {
                    alert('Test user already exists! You can now log in with test@aurfc.com / testpass123');
                    setEmail('test@aurfc.com');
                    setPassword('testpass123');
                  } else {
                    alert(`Error creating test user: ${err.message}`);
                  }
                }
              }}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Create Test User (test@aurfc.com / testpass123)
            </button>
          </div>
          
          {/* Password Reset */}
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setShowResetForm(!showResetForm)}
              className="text-primary hover:text-primary-light text-sm font-medium transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>
          
          {/* Reset Password Form */}
          <AnimatePresence>
            {showResetForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-secondary-light"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-4">Reset Password</h3>
                <div className="space-y-4">
                  <input 
                    type="email" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    disabled={resetLoading}
                    className="form-input"
                  />
                  <motion.button 
                    type="button" 
                    onClick={handleReset}
                    disabled={resetLoading || !resetEmail}
                    className="btn-secondary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {resetLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Sign Up Link */}
          <div className="mt-8 text-center pt-6 border-t border-secondary-light">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <motion.a 
                href="/signup" 
                className="text-primary hover:text-primary-light font-medium transition-colors duration-200"
                whileHover={{ x: 2 }}
              >
                Sign up here
              </motion.a>
            </p>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-white/60 text-xs">
            © 2025 AURFC Hub. Established 1906.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
