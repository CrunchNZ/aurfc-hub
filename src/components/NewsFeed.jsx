import React, { useState, useEffect, useContext } from 'react';
import { 
  getAnnouncementsForRole,
  addReactionToAnnouncement,
  removeReactionFromAnnouncement,
  incrementAnnouncementViewCount,
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_CATEGORIES
} from '../services/announcements';
import { AuthContext } from '../contexts/AuthContext';
import { getCurrentUserRole } from '../services/auth';

function NewsFeed() {
  const [announcements, setAnnouncements] = useState([]);
  const [userRole, setUserRole] = useState('player');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  
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
    if (user && userRole) {
      setLoading(true);
      
      const unsubscribe = getAnnouncementsForRole(
        userRole,
        (newAnnouncements) => {
          setAnnouncements(newAnnouncements);
          setLoading(false);
        }
      );

      return unsubscribe;
    }
  }, [user, userRole]);

  const handleReaction = async (announcementId, reactionType) => {
    if (!user) return;
    
    try {
      const announcement = announcements.find(a => a.id === announcementId);
      const userReactions = announcement?.userReactions || {};
      
      if (userReactions[user.uid] === reactionType) {
        // Remove reaction if clicking the same one
        await removeReactionFromAnnouncement(announcementId, user.uid);
      } else {
        // Add or change reaction
        await addReactionToAnnouncement(announcementId, reactionType, user.uid);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleViewAnnouncement = async (announcementId) => {
    try {
      await incrementAnnouncementViewCount(announcementId);
      setExpandedAnnouncements(prev => new Set([...prev, announcementId]));
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleExpanded = (announcementId) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
        handleViewAnnouncement(announcementId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case ANNOUNCEMENT_PRIORITIES.URGENT:
        return '#f44336';
      case ANNOUNCEMENT_PRIORITIES.HIGH:
        return '#ff9800';
      case ANNOUNCEMENT_PRIORITIES.NORMAL:
        return '#2196f3';
      case ANNOUNCEMENT_PRIORITIES.LOW:
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case ANNOUNCEMENT_CATEGORIES.MATCH:
        return '🏉';
      case ANNOUNCEMENT_CATEGORIES.TRAINING:
        return '🏃';
      case ANNOUNCEMENT_CATEGORIES.SOCIAL:
        return '🎉';
      case ANNOUNCEMENT_CATEGORIES.FINANCIAL:
        return '💰';
      case ANNOUNCEMENT_CATEGORIES.JUNIOR:
        return '👶';
      case ANNOUNCEMENT_CATEGORIES.COACHING:
        return '👨‍🏫';
      default:
        return '📢';
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
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.category === filter || announcement.priority === filter;
  });

  if (!user) {
    return (
      <div className="news-feed">
        <div className="login-message">
          Please log in to view announcements.
        </div>
      </div>
    );
  }

  return (
    <div className="news-feed">
      <div className="news-feed-header">
        <h2>Club News & Announcements</h2>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Announcements</option>
            <optgroup label="Priority">
              <option value={ANNOUNCEMENT_PRIORITIES.URGENT}>Urgent</option>
              <option value={ANNOUNCEMENT_PRIORITIES.HIGH}>High Priority</option>
              <option value={ANNOUNCEMENT_PRIORITIES.NORMAL}>Normal</option>
              <option value={ANNOUNCEMENT_PRIORITIES.LOW}>Low Priority</option>
            </optgroup>
            <optgroup label="Category">
              <option value={ANNOUNCEMENT_CATEGORIES.MATCH}>Matches</option>
              <option value={ANNOUNCEMENT_CATEGORIES.TRAINING}>Training</option>
              <option value={ANNOUNCEMENT_CATEGORIES.SOCIAL}>Social</option>
              <option value={ANNOUNCEMENT_CATEGORIES.FINANCIAL}>Financial</option>
              <option value={ANNOUNCEMENT_CATEGORIES.JUNIOR}>Junior</option>
              <option value={ANNOUNCEMENT_CATEGORIES.COACHING}>Coaching</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="announcements-list">
        {loading ? (
          <div className="loading">Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="no-announcements">
            No announcements found.
          </div>
        ) : (
          filteredAnnouncements.map(announcement => {
            const isExpanded = expandedAnnouncements.has(announcement.id);
            const userReactions = announcement.userReactions || {};
            const userReaction = userReactions[user.uid];
            const shouldTruncate = announcement.content.length > 200;
            const displayContent = isExpanded || !shouldTruncate 
              ? announcement.content 
              : announcement.content.substring(0, 200) + '...';

            return (
              <div key={announcement.id} className="announcement-card">
                <div className="announcement-header">
                  <div className="announcement-meta">
                    <span className="category-icon">
                      {getCategoryIcon(announcement.category)}
                    </span>
                    <div className="announcement-info">
                      <h3 className="announcement-title">
                        {announcement.title}
                      </h3>
                      <div className="announcement-details">
                        <span className="author">By {announcement.authorName}</span>
                        <span className="time">{formatTime(announcement.createdAt)}</span>
                        <span 
                          className="priority"
                          style={{ color: getPriorityColor(announcement.priority) }}
                        >
                          {announcement.priority?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="view-count">
                    👁️ {announcement.viewCount || 0}
                  </div>
                </div>

                <div className="announcement-content">
                  <p>{displayContent}</p>
                  {shouldTruncate && (
                    <button 
                      onClick={() => toggleExpanded(announcement.id)}
                      className="read-more-btn"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                <div className="announcement-actions">
                  <div className="reactions">
                    <button 
                      onClick={() => handleReaction(announcement.id, 'likes')}
                      className={`reaction-btn ${userReaction === 'likes' ? 'active' : ''}`}
                    >
                      👍 {announcement.reactions?.likes || 0}
                    </button>
                    <button 
                      onClick={() => handleReaction(announcement.id, 'hearts')}
                      className={`reaction-btn ${userReaction === 'hearts' ? 'active' : ''}`}
                    >
                      ❤️ {announcement.reactions?.hearts || 0}
                    </button>
                    <button 
                      onClick={() => handleReaction(announcement.id, 'thumbsUp')}
                      className={`reaction-btn ${userReaction === 'thumbsUp' ? 'active' : ''}`}
                    >
                      👏 {announcement.reactions?.thumbsUp || 0}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .news-feed {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }

        .news-feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }

        .news-feed-header h2 {
          margin: 0;
          color: #333;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 0.875rem;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .announcement-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #2196f3;
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .announcement-meta {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .category-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .announcement-info {
          flex: 1;
        }

        .announcement-title {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .announcement-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #666;
        }

        .author {
          font-weight: 600;
        }

        .priority {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .view-count {
          font-size: 0.875rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .announcement-content {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #333;
        }

        .announcement-content p {
          margin: 0;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #2196f3;
          cursor: pointer;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          text-decoration: underline;
        }

        .read-more-btn:hover {
          color: #1976d2;
        }

        .announcement-actions {
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }

        .reactions {
          display: flex;
          gap: 0.5rem;
        }

        .reaction-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .reaction-btn:hover {
          background: #e0e0e0;
        }

        .reaction-btn.active {
          background: #e3f2fd;
          border-color: #2196f3;
          color: #1976d2;
        }

        .loading, .no-announcements, .login-message {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .news-feed {
            padding: 0.5rem;
          }

          .news-feed-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .announcement-header {
            flex-direction: column;
            gap: 1rem;
          }

          .announcement-details {
            flex-direction: column;
            gap: 0.25rem;
          }

          .reactions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default NewsFeed;
