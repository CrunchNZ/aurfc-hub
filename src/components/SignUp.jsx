import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signup } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

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
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const handleRoleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { value } = e.target;
    console.log('Role changed to:', value);
    
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submission triggered manually');
    console.log('Current form data:', formData);
    
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
      
      console.log('Submitting user data:', userData);
      await signup(formData.email, formData.password, userData);
      
      // Show success message and redirect to login
      alert('Account created successfully! Please check your email for verification.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getRoleIcon = (role) => {
    const icons = {
      player: '🏃',
      coach: '📋',
      parent: '👨‍👩‍👧‍👦',
      junior: '⚽',
      admin: '⚙️'
    };
    return icons[role] || '👤';
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      player: 'Active team member',
      coach: 'Team leadership and training',
      parent: 'Supporting family member',
      junior: 'Young player (under 18)',
      admin: 'System administrator'
    };
    return descriptions[role] || 'Club member';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark p-4">
      {/* Rugby-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-green rounded-full opacity-10 animate-bounce-gentle"></div>
        <div className="absolute -bottom-40 -right-40 w-60 h-60 bg-accent-gold rounded-full opacity-10 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
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
          <h1 className="text-3xl font-bold text-white mb-2">Join AURFC Hub</h1>
          <p className="text-white/80 text-sm">Auckland University Rugby Football Club</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-card shadow-xl p-8"
        >
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep ? 'bg-primary text-white' : 'bg-secondary-light text-text-secondary'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-secondary-light'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-primary text-center mb-6">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Account Details'}
            {currentStep === 3 && 'Role & Consent'}
          </h2>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="form-error text-center mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSignUp} className="space-y-6" noValidate onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">First Name *</label>
                      <input 
                        id="firstName"
                        type="text" 
                        name="firstName"
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        placeholder="Enter first name" 
                        required 
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">Last Name *</label>
                      <input 
                        id="lastName"
                        type="text" 
                        name="lastName"
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        placeholder="Enter last name" 
                        required 
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
                    <input 
                      id="dateOfBirth"
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth} 
                      onChange={handleInputChange} 
                      required 
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      id="phone"
                      type="tel" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Enter phone number" 
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Account Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email"
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="Enter email address" 
                      required 
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">Password *</label>
                      <input 
                        id="password"
                        type="password" 
                        name="password"
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder="Min 6 characters" 
                        required 
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                      <input 
                        id="confirmPassword"
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        placeholder="Confirm password" 
                        required 
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Role & Consent */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="form-group">
                    <label htmlFor="role" className="form-label">Role *</label>
                    <select 
                      id="role"
                      name="role"
                      value={formData.role} 
                      onChange={handleRoleChange}
                      disabled={loading}
                      className="form-input"
                      onKeyDown={(e) => {
                        // Prevent form submission on Enter key
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    >
                      <option value="player">Player</option>
                      <option value="coach">Coach</option>
                      <option value="parent">Parent</option>
                      <option value="junior">Junior</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    {/* Role Description */}
                    <div className="mt-3 p-4 bg-secondary-light rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{getRoleIcon(formData.role)}</span>
                        <span className="font-semibold text-text-primary capitalize">{formData.role}</span>
                      </div>
                      <p className="text-text-secondary text-sm">{getRoleDescription(formData.role)}</p>
                    </div>
                  </div>
                  
                  {formData.role === 'junior' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg"
                    >
                      <h4 className="font-semibold text-accent-green">Junior Registration Requirements</h4>
                      
                      <div className="form-group">
                        <label htmlFor="parentEmail" className="form-label">Parent Email *</label>
                        <input 
                          id="parentEmail"
                          type="email" 
                          name="parentEmail"
                          value={formData.parentEmail} 
                          onChange={handleInputChange} 
                          placeholder="Enter parent's email" 
                          required 
                          disabled={loading}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <input 
                          id="consent"
                          type="checkbox" 
                          name="consent"
                          checked={formData.consent} 
                          onChange={handleInputChange}
                          disabled={loading}
                          className="mt-1 w-4 h-4 text-primary border-secondary rounded focus:ring-primary focus:ring-opacity-20"
                        />
                        <label htmlFor="consent" className="text-sm text-text-secondary">
                          I have parental consent to join AURFC and understand that my parent/guardian will be notified of my registration.
                        </label>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Previous
                </motion.button>
              )}
              
              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next →
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary ml-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              )}
            </div>
          </form>
          
          {/* Login Link */}
          <div className="mt-8 text-center pt-6 border-t border-secondary-light">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <motion.a 
                href="/login" 
                className="text-primary hover:text-primary-light font-medium transition-colors duration-200"
                whileHover={{ x: 2 }}
              >
                Login here
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

export default SignUp; 