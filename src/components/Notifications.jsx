import React, { useState, useEffect, useContext } from 'react';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  NOTIFICATION_TYPES 
} from '../services/notifications';
import { AuthContext } from '../contexts/AuthContext';
import { getCurrentUserRole } from '../services/auth';

function Notifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState('player');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const role = await getCurrentUserRole();
          setUserRole(role || 'player');
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (user && userRole && isOpen) {
      setLoading(true);
      
      const unsubscribe = getUserNotifications(
        user.uid,
        userRole,
        (newNotifications) => {
          setNotifications(newNotifications);
          setLoading(false);
        }
      );

      return unsubscribe;
    }
  }, [user, userRole, isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsAsRead(user.uid, userRole);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.MESSAGE:
        return '💬';
      case NOTIFICATION_TYPES.EVENT:
        return '📅';
      case NOTIFICATION_TYPES.TEAM_UPDATE:
        return '👥';
      case NOTIFICATION_TYPES.ANNOUNCEMENT:
        return '📢';
      case NOTIFICATION_TYPES.PAYMENT:
        return '💳';
      case NOTIFICATION_TYPES.SYSTEM:
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay">
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="mark-all-read-btn"
                disabled={loading}
              >
                Mark all read ({unreadCount})
              </button>
            )}
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value={NOTIFICATION_TYPES.MESSAGE}>Messages</option>
            <option value={NOTIFICATION_TYPES.EVENT}>Events</option>
            <option value={NOTIFICATION_TYPES.TEAM_UPDATE}>Team Updates</option>
            <option value={NOTIFICATION_TYPES.ANNOUNCEMENT}>Announcements</option>
          </select>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="loading">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="mark-read-btn"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="delete-btn"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .notifications-overlay {
          position: fixed;
          top: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .notifications-panel {
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .notifications-header h3 {
          margin: 0;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .mark-all-read-btn {
          padding: 0.25rem 0.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .mark-all-read-btn:hover {
          background: #1976d2;
        }

        .mark-all-read-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .close-btn {
          padding: 0.25rem 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          color: #666;
        }

        .close-btn:hover {
          color: #333;
        }

        .notifications-filters {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .filter-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .notification-item {
          display: flex;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: #e3f2fd;
          border-left: 3px solid #2196f3;
        }

        .notification-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .notification-message {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 0.25rem;
          word-wrap: break-word;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #999;
        }

        .notification-actions {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-left: 0.5rem;
        }

        .mark-read-btn, .delete-btn {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          border-radius: 3px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .mark-read-btn:hover, .delete-btn:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.1);
        }

        .loading, .no-notifications {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .notifications-panel {
            width: 100vw;
          }
        }
      `}</style>
    </div>
  );
}

export default Notifications;
