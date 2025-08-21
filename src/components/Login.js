import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, resetPassword } from '../services/auth';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'Login failed. Please check your credentials and try again';
    }
  };

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-header text-center">
            <h1 className="card-title">Reset Password</h1>
            <p className="text-gray">Enter your email to receive reset instructions</p>
          </div>

          {resetSuccess ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-success mx-auto mb-3" />
              <h3 className="text-success mb-2">Email Sent!</h3>
              <p className="text-gray mb-4">Check your inbox for password reset instructions</p>
              <button 
                onClick={() => {
                  setResetMode(false);
                  setResetSuccess(false);
                  setResetEmail('');
                }}
                className="btn btn-primary"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset}>
              {error && (
                <div className="alert alert-danger flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <div className="loading"></div> : 'Send Reset Email'}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-primary hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-header text-center">
          <div className="text-4xl mb-2">🏉</div>
          <h1 className="card-title">Welcome to AURFC Hub</h1>
          <p className="text-gray">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert alert-danger flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input pl-10 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray hover:text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? <div className="loading"></div> : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setResetMode(true)}
            className="text-primary hover:underline text-sm"
          >
            Forgot your password?
          </button>
        </div>

        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo credentials for testing */}
        <div className="mt-4 p-3 bg-light rounded-lg">
          <p className="text-xs text-gray mb-2">Demo Accounts:</p>
          <div className="text-xs space-y-1">
            <div>Admin: admin@aurfc.ac.nz / password</div>
            <div>Coach: coach@aurfc.ac.nz / password</div>
            <div>Player: player@aurfc.ac.nz / password</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
