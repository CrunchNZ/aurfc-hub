import React, { useState, useEffect } from 'react';
import { uploadContent, awardBadge, getJuniorProgressSummary } from '../services/junior';
import { useAuth } from '../contexts/AuthContext';

function JuniorPortal() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [juniorProgress, setJuniorProgress] = useState({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    badges: [],
    achievements: [],
    skills: {
      passing: 0,
      tackling: 0,
      kicking: 0,
      teamwork: 0,
      fitness: 0
    }
  });
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillValue, setSkillValue] = useState(0);
  
  const { currentUser: user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const role = await getCurrentUserRole();
          setUserRole(role || 'player');
          
          // Only fetch junior progress if user is a junior
          if (role === 'junior') {
            const progress = await getJuniorProgressSummary(user.uid);
            setJuniorProgress(progress);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const handleUpload = async () => {
    if (file && user) {
      try {
        setUploading(true);
        setUploadProgress(0);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        
        await uploadContent(user.uid, file.name, file);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Reset form
        setFile(null);
        
        // Award experience for upload
        const newProgress = {
          ...juniorProgress,
          experience: juniorProgress.experience + 25,
          skills: {
            ...juniorProgress.skills,
            teamwork: Math.min(juniorProgress.skills.teamwork + 5, 100)
          }
        };
        
        // Check for level up
        if (newProgress.experience >= newProgress.experienceToNext) {
          newProgress.level += 1;
          newProgress.experience = newProgress.experience - newProgress.experienceToNext;
          newProgress.experienceToNext = Math.floor(newProgress.experienceToNext * 1.5);
          
          // Award level up badge
          const levelBadge = {
            id: `level-${newProgress.level}`,
            name: `Level ${newProgress.level}`,
            description: `Reached level ${newProgress.level}`,
            icon: '⭐',
            earnedAt: new Date()
          };
          newProgress.badges.push(levelBadge);
        }
        
        setJuniorProgress(newProgress);
        
        setTimeout(() => {
          setUploadProgress(0);
          setUploading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSkillUpdate = async () => {
    if (selectedSkill && skillValue > 0) {
      const newProgress = {
        ...juniorProgress,
        skills: {
          ...juniorProgress.skills,
          [selectedSkill]: Math.min(juniorProgress.skills[selectedSkill] + skillValue, 100)
        }
      };
      
      // Check for skill mastery badges
      if (newProgress.skills[selectedSkill] >= 100) {
        const masteryBadge = {
          id: `${selectedSkill}-master`,
          name: `${selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)} Master`,
          description: `Mastered ${selectedSkill} skill`,
          icon: '🏆',
          earnedAt: new Date()
        };
        newProgress.badges.push(masteryBadge);
      }
      
      setJuniorProgress(newProgress);
      setShowSkillModal(false);
      setSelectedSkill('');
      setSkillValue(0);
    }
  };

  const getSkillIcon = (skill) => {
    const icons = {
      passing: '🏉',
      tackling: '💪',
      kicking: '⚽',
      teamwork: '🤝',
      fitness: '🏃'
    };
    return icons[skill] || '🎯';
  };

  const getSkillColor = (value) => {
    if (value >= 80) return 'text-accent-green';
    if (value >= 60) return 'text-accent-gold';
    if (value >= 40) return 'text-accent-orange';
    return 'text-accent-red';
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-text-secondary mb-4">
            🏉 AURFC Junior Portal
          </div>
          <div className="text-lg text-text-secondary">
            Please log in to access the junior player portal.
          </div>
        </div>
      </div>
    );
  }

  if (userRole !== 'junior') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-text-secondary mb-4">
            🚫 Access Restricted
          </div>
          <div className="text-lg text-text-secondary">
            This portal is only available for junior players.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Junior Portal Header */}
      <div className="bg-gradient-to-r from-accent-gold via-yellow-400 to-accent-gold rounded-card text-text-primary p-8 mb-8 animate-bounce-gentle">
        <div className="text-center">
          <div className="text-6xl mb-4">🏉</div>
          <h1 className="text-4xl font-bold mb-2">AURFC Junior Portal</h1>
          <p className="text-xl text-text-secondary">
            Level up your rugby skills and earn badges!
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Level Card */}
        <div className="bg-white rounded-card shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="text-2xl font-bold text-primary mb-2">Level {juniorProgress.level}</h3>
          <div className="w-full bg-secondary-light rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary-light h-3 rounded-full transition-all duration-500"
              style={{ width: `${(juniorProgress.experience / juniorProgress.experienceToNext) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-text-secondary">
            {juniorProgress.experience} / {juniorProgress.experienceToNext} XP
          </p>
        </div>

        {/* Total Experience */}
        <div className="bg-white rounded-card shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">💎</div>
          <h3 className="text-2xl font-bold text-primary mb-2">Total XP</h3>
          <p className="text-3xl font-bold text-accent-gold">
            {juniorProgress.level * 100 + juniorProgress.experience}
          </p>
          <p className="text-sm text-text-secondary">Experience Points</p>
        </div>

        {/* Badges Count */}
        <div className="bg-white rounded-card shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-2xl font-bold text-primary mb-2">Badges</h3>
          <p className="text-3xl font-bold text-accent-gold">{juniorProgress.badges.length}</p>
          <p className="text-sm text-text-secondary">Achievements Unlocked</p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="bg-white rounded-card shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Rugby Skills</h2>
          <button
            onClick={() => setShowSkillModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
          >
            Update Skills
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(juniorProgress.skills).map(([skill, value]) => (
            <div key={skill} className="text-center">
              <div className="text-4xl mb-3">{getSkillIcon(skill)}</div>
              <h3 className="font-semibold text-text-primary mb-2 capitalize">
                {skill}
              </h3>
              <div className="w-full bg-secondary-light rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    value >= 80 ? 'bg-accent-green' : 
                    value >= 60 ? 'bg-accent-gold' : 
                    value >= 40 ? 'bg-orange-400' : 'bg-accent-red'
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
              <p className={`text-sm font-bold ${getSkillColor(value)}`}>
                {value}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Upload Section */}
      <div className="bg-white rounded-card shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Share Your Progress</h2>
        
        <div className="border-2 border-dashed border-secondary-light rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Upload Training Videos or Photos
          </h3>
          <p className="text-text-secondary mb-6">
            Share your rugby journey and earn experience points!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,video/*"
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light transition-colors duration-200"
            />
            
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="w-full bg-secondary-light rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-accent-green to-green-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {uploadProgress}% Complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-card shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Your Badges</h2>
        
        {juniorProgress.badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {juniorProgress.badges.map(badge => (
              <div key={badge.id} className="bg-gradient-to-br from-accent-gold/20 to-yellow-100 rounded-lg p-6 text-center border border-accent-gold/30">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-semibold text-text-primary mb-2">{badge.name}</h3>
                <p className="text-sm text-text-secondary mb-3">{badge.description}</p>
                <p className="text-xs text-text-secondary">
                  Earned: {badge.earnedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-text-secondary">No badges yet. Keep training to earn your first badge!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-semibold text-primary mb-2">Training Resources</h3>
          <p className="text-sm text-text-secondary mb-4">
            Access drills, techniques, and training videos
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium">
            View Resources
          </button>
        </div>
        
        <div className="bg-white rounded-card shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold text-primary mb-2">Team Challenges</h3>
          <p className="text-sm text-text-secondary mb-4">
            Participate in team challenges and competitions
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium">
            Join Challenges
          </button>
        </div>
      </div>

      {/* Skill Update Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-primary mb-4">Update Skills</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Select Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                >
                  <option value="">Choose a skill</option>
                  <option value="passing">Passing</option>
                  <option value="tackling">Tackling</option>
                  <option value="kicking">Kicking</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="fitness">Fitness</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Points to Add
                </label>
                <input
                  type="number"
                  value={skillValue}
                  onChange={(e) => setSkillValue(parseInt(e.target.value) || 0)}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border-2 border-secondary-light rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                  placeholder="1-20 points"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSkillUpdate}
                disabled={!selectedSkill || skillValue <= 0}
                className="flex-1 bg-accent-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Skill
              </button>
              <button
                onClick={() => setShowSkillModal(false)}
                className="flex-1 bg-secondary text-text-primary py-2 px-4 rounded-lg hover:bg-secondary-dark transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JuniorPortal; 