import React, { useState, useEffect } from 'react';


const Ordering = ({ addToCart, cart }) => {
  const [orderingItems, setOrderingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGroupOrders();
  }, []);

  const loadGroupOrders = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockGroupOrders = [
        {
          id: 'order-1',
          name: 'Friday Pizza Night',
          description: 'Group pizza order for team dinner',
          price: 12.50,
          category: 'food',
          image: 'https://via.placeholder.com/300x200?text=Pizza+Night',
          date: '2024-03-22',
          time: '18:00',
          location: 'Clubhouse',
          deadline: '2024-03-21',
          deadlineTime: '17:00',
          capacity: 40,
          ordered: 28,
          maxItemsPerPerson: 3,
          inStock: true,
          teamId: null, // Available to all teams
          options: [
            'Margherita',
            'Pepperoni',
            'Hawaiian',
            'Vegetarian',
            'BBQ Chicken'
          ],
          includes: ['Pizza', 'Soft drinks', 'Dessert']
        },
        {
          id: 'order-2',
          name: 'BBQ Lunch',
          description: 'Post-match BBQ for senior team',
          price: 15.00,
          category: 'food',
          image: 'https://via.placeholder.com/300x200?text=BBQ+Lunch',
          date: '2024-03-16',
          time: '13:00',
          location: 'Club Grounds',
          deadline: '2024-03-15',
          deadlineTime: '17:00',
          capacity: 60,
          ordered: 45,
          maxItemsPerPerson: 2,
          inStock: true,
          teamId: 'senior-team',
          options: [
            'Beef burger',
            'Chicken burger',
            'Veggie burger',
            'Sausage in bread'
          ],
          includes: ['BBQ meal', 'Salad', 'Drinks', 'Dessert']
        },
        {
          id: 'order-3',
          name: 'Team Breakfast',
          description: 'Pre-match breakfast for junior team',
          price: 8.50,
          category: 'food',
          image: 'https://via.placeholder.com/300x200?text=Team+Breakfast',
          date: '2024-03-17',
          time: '07:30',
          location: 'Clubhouse',
          deadline: '2024-03-16',
          deadlineTime: '17:00',
          capacity: 80,
          ordered: 65,
          maxItemsPerPerson: 1,
          inStock: true,
          teamId: 'junior-team',
          options: [
            'Full breakfast',
            'Continental breakfast',
            'Bacon roll',
            'Veggie option'
          ],
          includes: ['Breakfast', 'Juice', 'Coffee/Tea']
        },
        {
          id: 'order-4',
          name: 'End of Season Dinner',
          description: 'Celebratory dinner for all members',
          price: 35.00,
          category: 'formal',
          image: 'https://via.placeholder.com/300x200?text=End+of+Season',
          date: '2024-04-15',
          time: '19:00',
          location: 'Grand Hotel',
          deadline: '2024-04-10',
          deadlineTime: '17:00',
          capacity: 150,
          ordered: 120,
          maxItemsPerPerson: 2,
          inStock: true,
          teamId: null,
          options: [
            'Beef main',
            'Chicken main',
            'Fish main',
            'Vegetarian main'
          ],
          includes: ['Three-course meal', 'Drinks package', 'Entertainment', 'Awards']
        }
      ];

      setOrderingItems(mockGroupOrders);
    } catch (err) {
      console.error('Error loading group orders:', err);
      setError('Failed to load group orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (order, selectedOptions = []) => {
    const cartItem = {
      ...order,
      type: 'group-order',
      selectedOptions,
      cartId: `group-order-${order.id}`
    };
    addToCart(cartItem);
  };

  const filteredOrders = orderingItems.filter(order => {
    const matchesFilter = filter === 'all' || order.category === filter;
    const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'food', 'formal'];

  const getOrderStatus = (order) => {
    const now = new Date();
    const deadline = new Date(`${order.deadline}T${order.deadlineTime}`);
    
    if (now > deadline) return 'closed';
    if (order.ordered >= order.capacity) return 'full';
    if (order.ordered >= order.capacity * 0.8) return 'filling-up';
    return 'open';
  };

  const getOrderStatusText = (order) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'closed':
        return 'Ordering Closed';
      case 'full':
        return 'Order Full';
      case 'filling-up':
        return 'Filling Up!';
      default:
        return 'Open for Orders';
    }
  };

  const checkEligibility = (order) => {
    // Removed authUser check as it's no longer needed
    
    // Check team restrictions
    if (order.teamId && order.teamId !== 'all-teams') { // Assuming 'all-teams' is the default or no team restriction
      return false;
    }

    // Check if ordering is still open
    if (getOrderStatus(order) === 'closed') {
      return false;
    }

    // Check if user already has items
    const existingItems = cart.find(item => 
      item.type === 'group-order' && item.id === order.id
    );
    
    if (existingItems && existingItems.quantity >= order.maxItemsPerPerson) {
      return false;
    }

    return true;
  };

  const formatDeadline = (date, time) => {
    const deadline = new Date(`${date}T${time}`);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Closed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="ordering-container">
        <div className="loading">Loading group orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ordering-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="ordering-container">
      <div className="ordering-header">
        <h2>Group Orders</h2>
        <p>Join team meals and group dining events!</p>
        <div className="ordering-info">
          <p>🍕 Perfect for team bonding and social events</p>
          <p>⏰ Orders close before the event date</p>
          <p>👥 Great value for group dining</p>
        </div>
      </div>

      <div className="ordering-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search group orders..."
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

      <div className="orders-grid">
        {filteredOrders.map(order => {
          const status = getOrderStatus(order);
          const statusText = getOrderStatusText(order);
          const isEligible = checkEligibility(order);
          const isInCart = cart.some(item => 
            item.type === 'group-order' && item.id === order.id
          );
          const deadlineText = formatDeadline(order.deadline, order.deadlineTime);

          return (
            <div key={order.id} className={`order-card ${status} ${!isEligible ? 'ineligible' : ''}`}>
              <div className="order-image">
                <img src={order.image} alt={order.name} />
                <div className={`order-status ${status}`}>
                  {statusText}
                </div>
              </div>
              
              <div className="order-details">
                <h3 className="order-name">{order.name}</h3>
                <p className="order-description">{order.description}</p>
                
                <div className="order-meta">
                  <div className="order-date">
                    📅 {new Date(order.date).toLocaleDateString()}
                  </div>
                  <div className="order-time">
                    🕐 {order.time}
                  </div>
                  <div className="order-location">
                    📍 {order.location}
                  </div>
                </div>
                
                <div className="order-deadline">
                  <span className="deadline-label">Order Deadline:</span>
                  <span className={`deadline-text ${status === 'closed' ? 'closed' : ''}`}>
                    {deadlineText}
                  </span>
                </div>
                
                <div className="order-capacity">
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ width: `${(order.ordered / order.capacity) * 100}%` }}
                    ></div>
                  </div>
                  <span className="capacity-text">
                    {order.ordered} / {order.capacity} ordered
                  </span>
                </div>
                
                <div className="order-options">
                  <h4>Available Options:</h4>
                  <div className="options-list">
                    {order.options.map((option, index) => (
                      <span key={index} className="option-tag">{option}</span>
                    ))}
                  </div>
                </div>
                
                <div className="order-includes">
                  <h4>Includes:</h4>
                  <ul>
                    {order.includes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="order-price">
                  <span className="price">${order.price.toFixed(2)}</span>
                  <span className="per-person">per person</span>
                </div>
                
                <div className="order-actions">
                  {!isEligible ? (
                    <div className="ineligible-message">
                      {order.teamId && order.teamId !== 'all-teams' && (
                        <p>This order is restricted to {order.teamId} members</p>
                      )}
                      {status === 'closed' && (
                        <p>Ordering has closed</p>
                      )}
                      {isInCart && (
                        <p>Maximum items already in cart</p>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`order-btn ${isInCart ? 'in-cart' : ''}`}
                      onClick={() => handleAddToCart(order)}
                      disabled={!order.inStock || status === 'closed' || status === 'full'}
                    >
                      {status === 'closed' ? 'Ordering Closed' : 
                       status === 'full' ? 'Order Full' :
                       isInCart ? 'In Cart' : 'Join Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-results">
          <p>No group orders found matching your criteria.</p>
        </div>
      )}

      <div className="ordering-info">
        <h3>Group Order Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>📅 Ordering Deadlines</h4>
            <p>Orders close 24-48 hours before events</p>
            <p>Late orders cannot be accommodated</p>
            <p>Check individual order deadlines</p>
          </div>
          
          <div className="info-item">
            <h4>🍽️ Dietary Requirements</h4>
            <p>Vegetarian options available</p>
            <p>Contact organizers for special diets</p>
            <p>Allergies noted in order details</p>
          </div>
          
          <div className="info-item">
            <h4>💰 Payment & Cancellation</h4>
            <p>Pay when joining the order</p>
            <p>No refunds after deadline</p>
            <p>Contact organizers for issues</p>
          </div>
          
          <div className="info-item">
            <h4>❓ Questions?</h4>
            <p>Contact the social committee</p>
            <p>Email: social@aurfc.co.nz</p>
            <p>Phone: (09) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ordering;
