import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  MapPin,
  Trophy,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    attendanceRate: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadDashboardData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming events
      const eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', new Date()),
        orderBy('date'),
        limit(5)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
      setUpcomingEvents(events);

      // Simulate stats (in real app, these would be calculated from Firestore)
      setStats({
        totalMembers: 687,
        upcomingEvents: events.length,
        unreadMessages: 12,
        attendanceRate: 85
      });

      // Simulate recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'training',
          message: 'Senior A Team training completed',
          time: '2 hours ago',
          icon: CheckCircle,
          color: 'text-success'
        },
        {
          id: 2,
          type: 'registration',
          message: '3 new junior registrations received',
          time: '4 hours ago',
          icon: Users,
          color: 'text-primary'
        },
        {
          id: 3,
          type: 'match',
          message: 'Match vs Victoria University scheduled',
          time: '6 hours ago',
          icon: Calendar,
          color: 'text-warning'
        },
        {
          id: 4,
          type: 'injury',
          message: 'Injury report submitted for John Smith',
          time: '1 day ago',
          icon: AlertCircle,
          color: 'text-danger'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (date) => {
    return new Intl.DateTimeFormat('en-NZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'match': return 'badge-danger';
      case 'training': return 'badge-primary';
      case 'meeting': return 'badge-warning';
      case 'social': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Welcome Section */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Team Member'}! 🏉
          </h1>
          <p className="text-gray">Here's what's happening at AURFC today</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary">{stats.totalMembers}</h3>
              <p className="text-gray">Total Members</p>
            </div>
            <Users className="text-primary" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-warning">{stats.upcomingEvents}</h3>
              <p className="text-gray">Upcoming Events</p>
            </div>
            <Calendar className="text-warning" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-info">{stats.unreadMessages}</h3>
              <p className="text-gray">Unread Messages</p>
            </div>
            <MessageSquare className="text-info" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-success">{stats.attendanceRate}%</h3>
              <p className="text-gray">Attendance Rate</p>
            </div>
            <TrendingUp className="text-success" size={32} />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <Calendar size={20} />
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-light rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <span className={`badge ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatEventDate(event.date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {event.attendees && (
                      <div className="text-sm text-gray">
                        {event.attendees.length} attending
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray">
                <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                <p>No upcoming events scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <Icon size={16} className={activity.color} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <button className="btn btn-primary">
            <Calendar size={16} />
            Schedule Event
          </button>
          <button className="btn btn-secondary">
            <Users size={16} />
            Manage Teams
          </button>
          <button className="btn btn-outline">
            <MessageSquare size={16} />
            Send Message
          </button>
          <button className="btn btn-outline">
            <Trophy size={16} />
            View Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;