import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signup } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'player',
    dateOfBirth: '',
    phone: '',
    parentEmail: '',
    consent: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.role === 'junior' && !formData.consent) {
      setError('Parental consent is required for junior users');
      return;
    }
    
    if (formData.role === 'junior' && !formData.parentEmail) {
      setError('Parent email is required for junior users');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        parentEmail: formData.role === 'junior' ? formData.parentEmail : null,
        consent: formData.consent,
        teamPreference: null
      };
      
      await signup(formData.email, formData.password, userData);
      
      // Show success message and redirect to login
      alert('Account created successfully! Please check your email for verification.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Create Account</h2>
      
      {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
      
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: '15px' }}>
          <label>First Name *</label>
          <input 
            type="text" 
            name="firstName"
            value={formData.firstName} 
            onChange={handleInputChange} 
            placeholder="First Name" 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Last Name *</label>
          <input 
            type="text" 
            name="lastName"
            value={formData.lastName} 
            onChange={handleInputChange} 
            placeholder="Last Name" 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email *</label>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleInputChange} 
            placeholder="Email" 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Password *</label>
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleInputChange} 
            placeholder="Password (min 6 characters)" 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Confirm Password *</label>
          <input 
            type="password" 
            name="confirmPassword"
            value={formData.confirmPassword} 
            onChange={handleInputChange} 
            placeholder="Confirm Password" 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Date of Birth *</label>
          <input 
            type="date" 
            name="dateOfBirth"
            value={formData.dateOfBirth} 
            onChange={handleInputChange} 
            required 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone} 
            onChange={handleInputChange} 
            placeholder="Phone Number" 
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Role *</label>
          <select 
            name="role"
            value={formData.role} 
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="parent">Parent</option>
            <option value="junior">Junior</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {formData.role === 'junior' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Parent Email *</label>
              <input 
                type="email" 
                name="parentEmail"
                value={formData.parentEmail} 
                onChange={handleInputChange} 
                placeholder="Parent Email" 
                required 
                disabled={loading}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>
                <input 
                  type="checkbox" 
                  name="consent"
                  checked={formData.consent} 
                  onChange={handleInputChange}
                  disabled={loading}
                />
                I have parental consent to join AURFC
              </label>
            </div>
          </>
        )}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}

export default SignUp; 