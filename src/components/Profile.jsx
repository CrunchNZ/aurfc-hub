import React, { useState, useEffect } from 'react';
import { auth, updateUserProfile, getCurrentUserRole } from '../services/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    jerseyNumber: '',
    emergencyContact: '',
    medicalInfo: '',
    bio: ''
  });
  const [userRole, setUserRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const { currentUser: user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              name: userData.name || '',
              email: user.email || '',
              phone: userData.phone || '',
              position: userData.position || '',
              jerseyNumber: userData.jerseyNumber || '',
              emergencyContact: userData.emergencyContact || '',
              medicalInfo: userData.medicalInfo || '',
              bio: userData.bio || ''
            });
          }
          
          // Get user role
          const role = await getCurrentUserRole();
          setUserRole(role || 'player');
        } catch (err) {
          setError('Failed to load profile information');
          console.error('Error fetching profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess('');
      
      // Update profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: profile.name,
        phone: profile.phone,
        position: profile.position,
        jerseyNumber: profile.jerseyNumber,
        emergencyContact: profile.emergencyContact,
        medicalInfo: profile.medicalInfo,
        bio: profile.bio,
        updatedAt: new Date()
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-text-secondary mb-4">
            👤 AURFC Player Profile
          </div>
          <div className="text-lg text-text-secondary">
            Please log in to view and edit your profile.
          </div>
        </div>
      </div>
    );
  }

  if (loading && !profile.name) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="loading mx-auto mb-4"></div>
          <div className="text-text-secondary">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-card text-white p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.name || 'Player Profile'}</h1>
            <p className="text-white/80 text-lg">{profile.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
              {profile.position && (
                <span className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full text-sm font-medium">
                  {profile.position}
                </span>
              )}
              {profile.jerseyNumber && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  #{profile.jerseyNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-accent-green text-white p-4 rounded-lg mb-6 text-center font-medium animate-fade-in">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-accent-red text-white p-4 rounded-lg mb-6 text-center font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-card shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                placeholder="Email address"
              />
              <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Emergency contact name & number"
              />
            </div>
          </div>

          {/* Rugby Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Position
              </label>
              <select
                name="position"
                value={profile.position}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select position</option>
                <option value="Prop">Prop</option>
                <option value="Hooker">Hooker</option>
                <option value="Lock">Lock</option>
                <option value="Flanker">Flanker</option>
                <option value="Number 8">Number 8</option>
                <option value="Scrum Half">Scrum Half</option>
                <option value="Fly Half">Fly Half</option>
                <option value="Centre">Centre</option>
                <option value="Wing">Wing</option>
                <option value="Full Back">Full Back</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Jersey Number
              </label>
              <input
                type="number"
                name="jerseyNumber"
                value={profile.jerseyNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
                max="99"
                className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Jersey number (1-99)"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Medical Information
            </label>
            <textarea
              name="medicalInfo"
              value={profile.medicalInfo}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed resize-vertical"
              placeholder="Any medical conditions, allergies, or important health information"
            />
            <p className="text-xs text-text-secondary mt-1">This information is kept confidential and only shared with coaches and medical staff</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
              className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed resize-vertical"
              placeholder="Tell us about yourself, your rugby experience, goals, etc."
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent-green text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-secondary text-text-primary py-3 px-6 rounded-lg hover:bg-secondary-dark transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Profile Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">🏉</div>
          <h3 className="font-semibold text-primary mb-2">Position</h3>
          <p className="text-lg text-text-primary">{profile.position || 'Not specified'}</p>
        </div>
        
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">👕</div>
          <h3 className="font-semibold text-primary mb-2">Jersey Number</h3>
          <p className="text-lg text-text-primary">{profile.jerseyNumber || 'Not assigned'}</p>
        </div>
        
        <div className="bg-white rounded-card shadow-md p-6 text-center">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-semibold text-primary mb-2">Contact</h3>
          <p className="text-sm text-text-primary">{profile.phone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile; 