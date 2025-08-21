import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './EventTicketing.css';

const EventTicketing = ({ addToCart, user, cart }) => {
  const { user: authUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockEvents = [
        {
          id: 'event-1',
          name: 'Away Game Bus Trip',
          description: 'Transport to away game vs. Local Rivals',
          price: 15.00,
          category: 'transport',
          image: 'https://via.placeholder.com/300x200?text=Bus+Trip',
          date: '2024-03-15',
          time: '14:00',
          location: 'Club Grounds',
          capacity: 50,
          sold: 32,
          maxTicketsPerPerson: 2,
          inStock: true,
          teamId: null, // Available to all teams
          includes: ['Return transport', 'Match entry', 'Refreshments']
        },
        {
          id: 'event-2',
          name: 'Quiz Night',
          description: 'Monthly quiz night with prizes',
          price: 10.00,
          category: 'social',
          image: 'https://via.placeholder.com/300x200?text=Quiz+Night',
          date: '2024-03-20',
          time: '19:00',
          location: 'Clubhouse',
          capacity: 80,
          sold: 45,
          maxTicketsPerPerson: 4,
          inStock: true,
          teamId: null,
          includes: ['Entry', 'Quiz participation', 'Light refreshments', 'Prize pool entry']
        },
        {
          id: 'event-3',
          name: 'End of Season Awards',
          description: 'Annual awards ceremony and dinner',
          price: 45.00,
          category: 'formal',
          image: 'https://via.placeholder.com/300x200?text=Awards+Dinner',
          date: '2024-04-10',
          time: '18:30',
          location: 'Grand Hotel',
          capacity: 120,
          sold: 98,
          maxTicketsPerPerson: 2,
          inStock: true,
          teamId: null,
          includes: ['Three-course dinner', 'Awards ceremony', 'Live entertainment', 'Drinks package']
        },
        {
          id: 'event-4',
          name: 'Training Camp Weekend',
          description: 'Intensive training weekend for senior players',
          price: 75.00,
          category: 'training',
          image: 'https://via.placeholder.com/300x200?text=Training+Camp',
          date: '2024-03-30',
          time: '09:00',
          location: 'Training Grounds',
          capacity: 40,
          sold: 28,
          maxTicketsPerPerson: 1,
          inStock: true,
          teamId: 'senior-team',
          includes: ['Accommodation', 'All meals', 'Training sessions', 'Equipment', 'Coaching']
        },
        {
          id: 'event-5',
          name: 'Junior Tournament',
          description: 'Annual junior rugby tournament',
          price: 25.00,
          category: 'tournament',
          image: 'https://via.placeholder.com/300x200?text=Junior+Tournament',
          date: '2024-04-05',
          time: '08:00',
          location: 'Club Grounds',
          capacity: 100,
          sold: 75,
          maxTicketsPerPerson: 1,
          inStock: true,
          teamId: 'junior-team',
          includes: ['Tournament entry', 'Lunch', 'Medal', 'Photos']
        }
      ];

      setEvents(mockEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (event, quantity = 1) => {
    const cartItem = {
      ...event,
      type: 'event',
      quantity,
      cartId: `event-${event.id}`
    };
    addToCart(cartItem);
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'transport', 'social', 'formal', 'training', 'tournament'];

  const getEventStatus = (event) => {
    if (event.sold >= event.capacity) return 'sold-out';
    if (event.sold >= event.capacity * 0.8) return 'selling-fast';
    return 'available';
  };

  const getEventStatusText = (event) => {
    const status = getEventStatus(event);
    switch (status) {
      case 'sold-out':
        return 'Sold Out';
      case 'selling-fast':
        return 'Selling Fast!';
      default:
        return `${event.capacity - event.sold} tickets left`;
    }
  };

  const checkEligibility = (event) => {
    if (!authUser) return false;
    
    // Check team restrictions
    if (event.teamId && authUser.teamId !== event.teamId) {
      return false;
    }

    // Check if user already has tickets
    const existingTickets = cart.find(item => 
      item.type === 'event' && item.id === event.id
    );
    
    if (existingTickets && existingTickets.quantity >= event.maxTicketsPerPerson) {
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <div className="event-ticketing-container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-ticketing-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="event-ticketing-container">
      <div className="event-header">
        <h2>Event Tickets</h2>
        <p>Book your spot at upcoming AURFC events!</p>
      </div>

      <div className="event-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => {
          const status = getEventStatus(event);
          const statusText = getEventStatusText(event);
          const isEligible = checkEligibility(event);
          const isInCart = cart.some(item => 
            item.type === 'event' && item.id === event.id
          );

          return (
            <div key={event.id} className={`event-card ${status} ${!isEligible ? 'ineligible' : ''}`}>
              <div className="event-image">
                <img src={event.image} alt={event.name} />
                <div className={`event-status ${status}`}>
                  {statusText}
                </div>
              </div>
              
              <div className="event-details">
                <h3 className="event-name">{event.name}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className="event-meta">
                  <div className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="event-time">
                    🕐 {event.time}
                  </div>
                  <div className="event-location">
                    📍 {event.location}
                  </div>
                </div>
                
                <div className="event-capacity">
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                  <span className="capacity-text">
                    {event.sold} / {event.capacity} sold
                  </span>
                </div>
                
                <div className="event-includes">
                  <h4>Includes:</h4>
                  <ul>
                    {event.includes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="event-price">
                  <span className="price">${event.price.toFixed(2)}</span>
                  <span className="per-ticket">per ticket</span>
                </div>
                
                <div className="event-actions">
                  {!isEligible ? (
                    <div className="ineligible-message">
                      {event.teamId && authUser?.teamId !== event.teamId && (
                        <p>This event is restricted to {event.teamId} members</p>
                      )}
                      {isInCart && (
                        <p>Maximum tickets already in cart</p>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`ticket-btn ${isInCart ? 'in-cart' : ''}`}
                      onClick={() => handleAddToCart(event)}
                      disabled={!event.inStock || status === 'sold-out'}
                    >
                      {status === 'sold-out' ? 'Sold Out' : 
                       isInCart ? 'In Cart' : 'Get Tickets'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="no-results">
          <p>No events found matching your criteria.</p>
        </div>
      )}

      <div className="event-info">
        <h3>Event Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🎫 Ticket Policies</h4>
            <p>All sales are final - no refunds</p>
            <p>Maximum tickets per person varies by event</p>
            <p>Team restrictions may apply</p>
          </div>
          
          <div className="info-item">
            <h4>📱 Digital Tickets</h4>
            <p>QR codes sent to your email</p>
            <p>Present at event entry</p>
            <p>No physical tickets issued</p>
          </div>
          
          <div className="info-item">
            <h4>⏰ Event Times</h4>
            <p>Arrive 15 minutes before start time</p>
            <p>Late arrivals may not be accommodated</p>
            <p>Check event details for specific requirements</p>
          </div>
          
          <div className="info-item">
            <h4>❓ Questions?</h4>
            <p>Contact the events coordinator</p>
            <p>Email: events@aurfc.co.nz</p>
            <p>Phone: (09) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTicketing;
