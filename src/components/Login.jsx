import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, resetPassword } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
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
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h3>Reset Password</h3>
        <input 
          type="email" 
          value={resetEmail} 
          onChange={(e) => setResetEmail(e.target.value)} 
          placeholder="Email for reset" 
          disabled={resetLoading}
        />
        <button 
          type="button" 
          onClick={handleReset}
          disabled={resetLoading || !resetEmail}
        >
          {resetLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>Don't have an account? <a href="/signup">Sign up here</a></p>
      </div>
    </div>
  );
}

export default Login;
