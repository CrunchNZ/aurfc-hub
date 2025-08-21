import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getParentDashboard, getJuniorProgress, getJuniorBadges } from '../services/junior';
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
  User, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Star, 
  Target,
  Clock,
  MapPin,
  Phone,
  Mail,
  Alert,
  CheckCircle,
  Upload,
  Award
} from 'lucide-react';

function ParentDashboard() {
  const { juniorId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [juniorData, setJuniorData] = useState(null);
  const [progress, setProgress] = useState({});
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [communications, setCommunications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user && juniorId) {
        await loadParentDashboardData(user.uid, juniorId);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [juniorId]);

  const loadParentDashboardData = async (parentId, juniorId) => {
    try {
      // Load junior profile
      const juniorDoc = await getDoc(doc(db, 'users', juniorId));
      if (juniorDoc.exists()) {
        const juniorInfo = juniorDoc.data();
        // Verify parent access
        if (juniorInfo.parentEmail !== user?.email && juniorInfo.parentId !== parentId) {
          throw new Error('Unauthorized access to junior data');
        }
        setJuniorData(juniorInfo);
      }

      // Load progress data
      const progressData = await getJuniorProgress(juniorId);
      setProgress(progressData);

      // Load badges
      const badgesData = await getJuniorBadges(juniorId);
      setBadges(badgesData);

      // Load recent uploads
      const uploadsQuery = query(
        collection(db, 'juniorContent'),
        where('userId', '==', juniorId),
        orderBy('uploadedAt', 'desc'),
        limit(10)
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
        limit(5)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(events);

      // Load goals
      const goalsQuery = query(
        collection(db, 'juniorGoals'),
        where('userId', '==', juniorId),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const goalsData = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);

      // Load attendance data
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', juniorId),
        orderBy('date', 'desc'),
        limit(10)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendance = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendanceData(attendance);

      // Load communications
      const communicationsQuery = query(
        collection(db, 'parentCommunications'),
        where('juniorId', '==', juniorId),
        orderBy('sentAt', 'desc'),
        limit(5)
      );
      const communicationsSnapshot = await getDocs(communicationsQuery);
      const comms = communicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCommunications(comms);

      // Load recent activity
      const activityQuery = query(
        collection(db, 'juniorActivity'),
        where('userId', '==', juniorId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const activities = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading parent dashboard data:', error);
      alert('Error loading dashboard data. You may not have access to this junior\'s information.');
    }
  };

  const calculateProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getAttendanceRate = () => {
    if (attendanceData.length === 0) return 0;
    const attended = attendanceData.filter(a => a.status === 'present').length;
    return Math.round((attended / attendanceData.length) * 100);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return <Upload size={16} />;
      case 'badge': return <Trophy size={16} />;
      case 'goal': return <Target size={16} />;
      case 'attendance': return <CheckCircle size={16} />;
      default: return <Star size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!juniorData) {
    return (
      <div className="parent-dashboard">
        <div className="page-header">
          <h1>Parent Dashboard</h1>
          <p>Junior not found or you don't have access to this information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      <div className="page-header">
        <div className="header-content">
          <h1>{juniorData.firstName} {juniorData.lastName}'s Progress</h1>
          <p>Monitor your child's rugby development and achievements</p>
        </div>
        <div className="junior-info">
          <div className="junior-avatar">
            <User size={40} />
          </div>
          <div className="junior-details">
            <h3>{juniorData.firstName} {juniorData.lastName}</h3>
            <p>Team: {juniorData.teamPreference || 'Not assigned'}</p>
            <p>Position: {juniorData.position || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
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
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{goals.filter(g => g.completed).length}/{goals.length}</h3>
            <p>Goals Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{getAttendanceRate()}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{recentUploads.length}</h3>
            <p>Content Uploads</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Progress Overview */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} />
              Progress Overview
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

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={20} />
              Recent Activity
            </div>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-info">
                    <p>{activity.description}</p>
                    <small>{activity.timestamp?.toDate().toLocaleString()}</small>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="empty-state">
                  <Clock size={48} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals & Achievements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Target size={20} />
              Goals & Achievements
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
                  <div className="goal-status">
                    {goal.completed && <span className="status-completed">Completed</span>}
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
              Badges Earned
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
                  <p>No badges earned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={20} />
              Attendance Record
            </div>
          </div>
          <div className="card-content">
            <div className="attendance-list">
              {attendanceData.map(attendance => (
                <div key={attendance.id} className="attendance-item">
                  <div className="attendance-date">
                    <div className="date-day">
                      {attendance.date?.toDate().getDate()}
                    </div>
                    <div className="date-month">
                      {attendance.date?.toDate().toLocaleDateString('en', { month: 'short' })}
                    </div>
                  </div>
                  <div className="attendance-info">
                    <h4>{attendance.eventTitle}</h4>
                    <p>{attendance.eventType}</p>
                    <div className="attendance-meta">
                      <span className="attendance-location">
                        <MapPin size={14} />
                        {attendance.location}
                      </span>
                    </div>
                  </div>
                  <div className="attendance-status">
                    <span className={`status-badge status-${attendance.status}`}>
                      {attendance.status === 'present' ? 'Present' : 
                       attendance.status === 'absent' ? 'Absent' : 'Late'}
                    </span>
                  </div>
                </div>
              ))}
              {attendanceData.length === 0 && (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No attendance records</p>
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
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MessageSquare size={20} />
              Communications from Coaches
            </div>
          </div>
          <div className="card-content">
            <div className="communications-list">
              {communications.map(comm => (
                <div key={comm.id} className="communication-item">
                  <div className="communication-header">
                    <h4>{comm.subject}</h4>
                    <small>{comm.sentAt?.toDate().toLocaleDateString()}</small>
                  </div>
                  <p>{comm.message}</p>
                  <div className="communication-from">
                    <strong>From: {comm.senderName}</strong>
                  </div>
                </div>
              ))}
              {communications.length === 0 && (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>No recent communications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard; 