import React, { useState, useEffect } from 'react';


const ClubroomOrdering = ({ addToCart, cart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockMenuItems = [
        {
          id: 'coffee-1',
          name: 'Flat White',
          description: 'Rich espresso with velvety microfoam',
          price: 4.50,
          category: 'coffee',
          image: 'https://via.placeholder.com/150x150?text=Coffee',
          available: true,
          preparationTime: '5 minutes',
          allergens: ['milk'],
          inStock: true
        },
        {
          id: 'coffee-2',
          name: 'Long Black',
          description: 'Double shot of espresso with hot water',
          price: 4.00,
          category: 'coffee',
          image: 'https://via.placeholder.com/150x150?text=Coffee',
          available: true,
          preparationTime: '3 minutes',
          allergens: [],
          inStock: true
        },
        {
          id: 'coffee-3',
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and foam',
          price: 4.50,
          category: 'coffee',
          image: 'https://via.placeholder.com/150x150?text=Coffee',
          available: true,
          preparationTime: '5 minutes',
          allergens: ['milk'],
          inStock: true
        },
        {
          id: 'snack-1',
          name: 'Chips',
          description: 'Salt and vinegar potato chips',
          price: 2.50,
          category: 'snacks',
          image: 'https://via.placeholder.com/150x150?text=Chips',
          available: true,
          preparationTime: 'Immediate',
          allergens: [],
          inStock: true
        },
        {
          id: 'snack-2',
          name: 'Chocolate Bar',
          description: 'Milk chocolate bar',
          price: 3.00,
          category: 'snacks',
          image: 'https://via.placeholder.com/150x150?text=Chocolate',
          available: true,
          preparationTime: 'Immediate',
          allergens: ['milk', 'nuts'],
          inStock: true
        },
        {
          id: 'snack-3',
          name: 'Protein Bar',
          description: 'High protein energy bar',
          price: 4.50,
          category: 'snacks',
          image: 'https://via.placeholder.com/150x150?text=Protein+Bar',
          available: true,
          preparationTime: 'Immediate',
          allergens: ['nuts', 'soy'],
          inStock: true
        },
        {
          id: 'beverage-1',
          name: 'Sports Drink',
          description: 'Electrolyte sports drink',
          price: 3.50,
          category: 'beverages',
          image: 'https://via.placeholder.com/150x150?text=Sports+Drink',
          available: true,
          preparationTime: 'Immediate',
          allergens: [],
          inStock: true
        },
        {
          id: 'beverage-2',
          name: 'Water',
          description: '500ml bottled water',
          price: 2.00,
          category: 'beverages',
          image: 'https://via.placeholder.com/150x150?text=Water',
          available: true,
          preparationTime: 'Immediate',
          allergens: [],
          inStock: true
        },
        {
          id: 'beverage-3',
          name: 'Orange Juice',
          description: 'Fresh squeezed orange juice',
          price: 4.00,
          category: 'beverages',
          image: 'https://via.placeholder.com/150x150?text=Orange+Juice',
          available: true,
          preparationTime: '5 minutes',
          allergens: [],
          inStock: true
        }
      ];

      setMenuItems(mockMenuItems);
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    const cartItem = {
      ...item,
      type: 'clubroom',
      cartId: `clubroom-${item.id}`
    };
    addToCart(cartItem);
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'coffee', 'snacks', 'beverages'];

  if (loading) {
    return (
      <div className="clubroom-container">
        <div className="loading">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clubroom-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="clubroom-container">
      <div className="clubroom-header">
        <h2>Clubroom Menu</h2>
        <p>Refreshments and snacks available at the club</p>
        <div className="pickup-info">
          <p>📍 Orders can be picked up at the clubroom</p>
          <p>⏱️ Most items ready in 5 minutes or less</p>
        </div>
      </div>

      <div className="clubroom-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search menu items..."
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

      <div className="menu-grid">
        {filteredMenuItems.map(item => (
          <div key={item.id} className="menu-item">
            <div className="item-image">
              <img src={item.image} alt={item.name} />
              {!item.inStock && <div className="out-of-stock">Out of Stock</div>}
            </div>
            
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <p className="item-price">${item.price.toFixed(2)}</p>
              
              <div className="item-info">
                <span className="prep-time">⏱️ {item.preparationTime}</span>
                {item.allergens.length > 0 && (
                  <span className="allergens">⚠️ Contains: {item.allergens.join(', ')}</span>
                )}
              </div>
              
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(item)}
                disabled={!item.inStock}
              >
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMenuItems.length === 0 && (
        <div className="no-results">
          <p>No menu items found matching your criteria.</p>
        </div>
      )}

      <div className="clubroom-info">
        <h3>Ordering Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🕐 Operating Hours</h4>
            <p>Monday - Friday: 7:00 AM - 9:00 PM</p>
            <p>Saturday - Sunday: 8:00 AM - 6:00 PM</p>
          </div>
          
          <div className="info-item">
            <h4>📍 Pickup Location</h4>
            <p>Main clubroom counter</p>
            <p>Please have your order number ready</p>
          </div>
          
          <div className="info-item">
            <h4>💳 Payment</h4>
            <p>Pay online when ordering</p>
            <p>Cash not accepted for pre-orders</p>
          </div>
          
          <div className="info-item">
            <h4>📱 Notifications</h4>
            <p>You'll receive a notification when your order is ready</p>
            <p>Orders held for 30 minutes after completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubroomOrdering;
