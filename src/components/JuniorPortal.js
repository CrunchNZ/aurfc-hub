import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { uploadContent, awardBadge, getJuniorProgress, getJuniorBadges } from '../services/junior';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  Trophy, 
  Upload, 
  Calendar, 
  Star, 
  Target, 
  Award,
  FileText,
  Image,
  Video,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

function JuniorPortal() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState('assignment');
  const [uploadDescription, setUploadDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({});
  const [recentUploads, setRecentUploads] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadJuniorData(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadJuniorData = async (userId) => {
    try {
      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }

      // Load badges
      const badgesData = await getJuniorBadges(userId);
      setBadges(badgesData);

      // Load progress
      const progressData = await getJuniorProgress(userId);
      setProgress(progressData);

      // Load recent uploads
      const uploadsQuery = query(
        collection(db, 'juniorContent'),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc'),
        limit(5)
      );
      const uploadsSnapshot = await getDocs(uploadsQuery);
      const uploads = uploadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentUploads(uploads);

      // Load upcoming events
      const eventsQuery = query(
        collection(db, 'events'),
        where('targetAudience', 'array-contains', 'junior'),
        where('date', '>=', new Date()),
        orderBy('date'),
        limit(3)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(events);

      // Load goals and achievements
      const goalsQuery = query(
        collection(db, 'juniorGoals'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goalsData = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);

      const achievementsQuery = query(
        collection(db, 'juniorAchievements'),
        where('userId', '==', userId),
        orderBy('achievedAt', 'desc'),
        limit(5)
      );
      const achievementsSnapshot = await getDocs(achievementsQuery);
      const achievementsData = achievementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAchievements(achievementsData);

    } catch (error) {
      console.error('Error loading junior data:', error);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      await uploadContent(user.uid, {
        fileName: file.name,
        file: file,
        type: uploadType,
        description: uploadDescription,
        uploadedAt: new Date()
      });
      
      // Reset form
      setFile(null);
      setUploadDescription('');
      
      // Reload recent uploads
      await loadJuniorData(user.uid);
      
      alert('Content uploaded successfully!');
    } catch (error) {
      console.error('Error uploading content:', error);
      alert('Error uploading content. Please try again.');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <Image size={16} />;
    } else if (['mp4', 'avi', 'mov'].includes(extension)) {
      return <Video size={16} />;
    } else {
      return <FileText size={16} />;
    }
  };

  const calculateProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="junior-portal">
        <div className="page-header">
          <h1>Junior Portal</h1>
          <p>Please log in to access your junior portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="junior-portal">
      <div className="page-header">
        <h1>Welcome, {userProfile?.firstName || 'Junior'}! 🏈</h1>
        <p>Track your progress, upload content, and earn badges</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h3>{badges.length}</h3>
            <p>Badges Earned</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Upload size={24} />
          </div>
          <div className="stat-content">
            <h3>{recentUploads.length}</h3>
            <p>Content Uploaded</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{goals.filter(g => g.completed).length}/{goals.length}</h3>
            <p>Goals Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>{achievements.length}</h3>
            <p>Achievements</p>
          </div>
        </div>
      </div>

      <div className="junior-content">
        {/* Upload Section */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Upload size={20} />
              Upload Content
            </div>
          </div>
          <div className="card-content">
            <div className="upload-form">
              <div className="form-group">
                <label>Content Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="form-select"
                >
                  <option value="assignment">Assignment</option>
                  <option value="training-video">Training Video</option>
                  <option value="match-footage">Match Footage</option>
                  <option value="photo">Photo</option>
                  <option value="document">Document</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Describe your upload..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Choose File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="form-file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!file}
                className="btn btn-primary"
              >
                <Upload size={16} />
                Upload Content
              </button>
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} />
              My Progress
            </div>
          </div>
          <div className="card-content">
            <div className="progress-items">
              {Object.entries(progress).map(([key, value]) => (
                <div key={key} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <span className="progress-value">{value.current}/{value.target}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgressPercentage(value.current, value.target)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={20} />
              My Badges
            </div>
          </div>
          <div className="card-content">
            <div className="badges-grid">
              {badges.map(badge => (
                <div key={badge.id} className="badge-item">
                  <div className="badge-icon">
                    <Trophy size={24} />
                  </div>
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                    <small>Earned: {badge.earnedAt?.toDate().toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
              {badges.length === 0 && (
                <div className="empty-state">
                  <Trophy size={48} />
                  <p>No badges earned yet. Keep working towards your goals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Target size={20} />
              My Goals
            </div>
          </div>
          <div className="card-content">
            <div className="goals-list">
              {goals.map(goal => (
                <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                  <div className="goal-icon">
                    {goal.completed ? <CheckCircle size={20} /> : <Target size={20} />}
                  </div>
                  <div className="goal-info">
                    <h4>{goal.title}</h4>
                    <p>{goal.description}</p>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${calculateProgressPercentage(goal.currentValue, goal.targetValue)}%` }}
                        />
                      </div>
                      <span>{goal.currentValue}/{goal.targetValue}</span>
                    </div>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="empty-state">
                  <Target size={48} />
                  <p>No active goals. Talk to your coach about setting some goals!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={20} />
              Recent Uploads
            </div>
          </div>
          <div className="card-content">
            <div className="uploads-list">
              {recentUploads.map(upload => (
                <div key={upload.id} className="upload-item">
                  <div className="upload-icon">
                    {getFileIcon(upload.fileName)}
                  </div>
                  <div className="upload-info">
                    <h4>{upload.fileName}</h4>
                    <p>{upload.description}</p>
                    <div className="upload-meta">
                      <span className="upload-type">{upload.type}</span>
                      <span className="upload-date">
                        {upload.uploadedAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="upload-status">
                    {upload.reviewed ? (
                      <span className="status-reviewed">Reviewed</span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </div>
                </div>
              ))}
              {recentUploads.length === 0 && (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No uploads yet. Start by uploading your first assignment or training video!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={20} />
              Upcoming Events
            </div>
          </div>
          <div className="card-content">
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <div className="event-day">
                      {event.date?.toDate().getDate()}
                    </div>
                    <div className="event-month">
                      {event.date?.toDate().toLocaleDateString('en', { month: 'short' })}
                    </div>
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <div className="event-meta">
                      <span className="event-time">
                        <Clock size={14} />
                        {event.time}
                      </span>
                      <span className="event-location">
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JuniorPortal; 