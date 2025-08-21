import React from 'react';
import './StoreNavigation.css';

const StoreNavigation = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'merchandise', label: 'Merchandise', icon: '👕' },
    { id: 'registration', label: 'Registration', icon: '📝' },
    { id: 'clubroom', label: 'Clubroom', icon: '☕' },
    { id: 'events', label: 'Events', icon: '🎫' },
    { id: 'ordering', label: 'Group Orders', icon: '🍕' },
    { id: 'fundraising', label: 'Fundraising', icon: '💝' }
  ];

  return (
    <nav className="store-navigation">
      <div className="nav-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default StoreNavigation;
