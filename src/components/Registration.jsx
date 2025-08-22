import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Users, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Registration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    
    // Role and Team
    role: '',
    teamPreference: '',
    position: '',
    experience: '',
    
    // Junior specific
    parentEmail: '',
    parentPhone: '',
    parentName: '',
    emergencyContact: '',
    medicalConditions: '',
    
    // Address
    address: '',
    city: '',
    postalCode: '',
    
    // Consent and agreements
    consent: false,
    termsAccepted: false,
    marketingOptIn: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const teamOptions = [
    'Senior A (Premier)',
    'Senior B (Division 1)',
    'Senior C (Division 2)',
    'Under 21',
    'Under 19',
    'Under 16',
    'Under 14',
    'Under 12',
    'Under 10',
    'Under 8',
    'Under 6',
    "Women's Premier",
    "Women's Development"
  ];

  const positionOptions = [
    'Prop (1, 3)',
    'Hooker (2)',
    'Lock (4, 5)',
    'Flanker (6, 7)',
    'Number 8 (8)',
    'Scrum-half (9)',
    'Fly-half (10)',
    'Wing (11, 14)',
    'Centre (12, 13)',
    'Fullback (15)',
    'Utility Back',
    'Utility Forward'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
        
      case 2:
        if (!formData.role) newErrors.role = 'Please select a role';
        if (!formData.teamPreference && formData.role !== 'admin') newErrors.teamPreference = 'Please select a team preference';
        
        // Junior specific validations
        if (formData.role === 'junior') {
          const age = calculateAge(formData.dateOfBirth);
          if (age < 13) {
            if (!formData.parentEmail.trim()) newErrors.parentEmail = 'Parent email is required for under 13s';
            if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required for under 13s';
          }
          if (!formData.consent) newErrors.consent = 'Parental consent is required for juniors';
        }
        break;
        
      case 3:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await signup(formData.email, formData.password, formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`form-input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="Enter first name"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`form-input pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Enter last name"
            />
          </div>
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-3 text-gray" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter email address"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Password *</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Create password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`form-input pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-3 text-gray" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input pl-10"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Role & Team Information</h2>
        
        <div className="form-group">
          <label className="form-label">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={`form-select ${errors.role ? 'border-red-500' : ''}`}
          >
            <option value="">Select your role</option>
            <option value="player">Senior Player (18+)</option>
            <option value="junior">Junior Player (5-18)</option>
            <option value="coach">Coach</option>
            <option value="parent">Parent/Guardian</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>

        {formData.role && formData.role !== 'admin' && (
          <div className="form-group">
            <label className="form-label">Team Preference *</label>
            <select
              name="teamPreference"
              value={formData.teamPreference}
              onChange={handleInputChange}
              className={`form-select ${errors.teamPreference ? 'border-red-500' : ''}`}
            >
              <option value="">Select preferred team</option>
              {teamOptions.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            {errors.teamPreference && <p className="text-red-500 text-sm mt-1">{errors.teamPreference}</p>}
          </div>
        )}

        {(formData.role === 'player' || formData.role === 'junior') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Preferred Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select position</option>
                {positionOptions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select experience</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="advanced">Advanced (5+ years)</option>
                <option value="elite">Elite/Professional</option>
              </select>
            </div>
          </div>
        )}

        {/* Junior specific fields */}
        {formData.role === 'junior' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Junior Player Information</h3>
            
            {age < 13 && (
              <div className="alert alert-info mb-4">
                <AlertCircle size={16} />
                Additional parent/guardian information required for players under 13
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Parent/Guardian Name {age < 13 && '*'}</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.parentName ? 'border-red-500' : ''}`}
                  placeholder="Enter parent/guardian name"
                />
                {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Parent/Guardian Email {age < 13 && '*'}</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  className={`form-input ${errors.parentEmail ? 'border-red-500' : ''}`}
                  placeholder="Enter parent/guardian email"
                />
                {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Emergency contact name and phone"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical Conditions/Allergies</label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Please list any medical conditions, allergies, or medications"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className={`${errors.consent ? 'border-red-500' : ''}`}
                />
                <span className="text-sm">
                  I give consent for my child to participate in AURFC activities *
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-sm mt-1">{errors.consent}</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Final Details</h2>
      
      <div className="form-group">
        <label className="form-label">Address</label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-3 text-gray" />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-input pl-10"
            placeholder="Enter street address"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter city"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter postal code"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Terms and Conditions</h3>
        
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className={`mt-1 ${errors.termsAccepted ? 'border-red-500' : ''}`}
            />
            <span className="text-sm">
              I accept the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> *
            </span>
          </label>
          {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="marketingOptIn"
              checked={formData.marketingOptIn}
              onChange={handleInputChange}
              className="mt-1"
            />
            <span className="text-sm">
              I would like to receive updates about AURFC events and news
            </span>
          </label>
        </div>
      </div>

      {errors.submit && (
        <div className="alert alert-danger flex items-center gap-2 mt-4">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <div className="text-4xl mb-2">🏉</div>
              <h1 className="card-title">Join AURFC</h1>
              <p className="text-gray">Complete your registration to get started</p>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={`w-12 h-1 mx-2 ${
                          step > stepNumber ? 'bg-primary' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-outline"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? <div className="loading"></div> : 'Complete Registration'}
                  </button>
                )}
              </div>
            </form>

            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;