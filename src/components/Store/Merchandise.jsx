import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Merchandise.css';

const Merchandise = ({ addToCart, user, cart }) => {
  const { user: authUser } = useAuth();
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMerchandise();
  }, []);

  const loadMerchandise = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockMerchandise = [
        {
          id: 'merch-1',
          name: 'AURFC Club Jersey',
          description: 'Official club jersey with team colors',
          price: 89.99,
          category: 'jerseys',
          image: 'https://via.placeholder.com/200x200?text=Jersey',
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          inStock: true,
          teamId: null // Available to all teams
        },
        {
          id: 'merch-2',
          name: 'Training Shorts',
          description: 'Comfortable training shorts with club logo',
          price: 45.00,
          category: 'shorts',
          image: 'https://via.placeholder.com/200x200?text=Shorts',
          sizes: ['S', 'M', 'L', 'XL'],
          inStock: true,
          teamId: null
        },
        {
          id: 'merch-3',
          name: 'Club Hoodie',
          description: 'Warm club hoodie perfect for cold weather',
          price: 65.00,
          category: 'hoodies',
          image: 'https://via.placeholder.com/200x200?text=Hoodie',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          inStock: true,
          teamId: null
        },
        {
          id: 'merch-4',
          name: 'Team Cap',
          description: 'Official team cap with embroidered logo',
          price: 25.00,
          category: 'accessories',
          image: 'https://via.placeholder.com/200x200?text=Cap',
          sizes: ['One Size'],
          inStock: true,
          teamId: null
        },
        {
          id: 'merch-5',
          name: 'Rugby Ball',
          description: 'Official match ball with club branding',
          price: 35.00,
          category: 'equipment',
          image: 'https://via.placeholder.com/200x200?text=Rugby+Ball',
          sizes: ['Size 5'],
          inStock: true,
          teamId: null
        }
      ];

      setMerchandise(mockMerchandise);
    } catch (err) {
      console.error('Error loading merchandise:', err);
      setError('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item, selectedSize) => {
    const cartItem = {
      ...item,
      type: 'merchandise',
      selectedSize,
      cartId: `${item.id}-${selectedSize}`
    };
    addToCart(cartItem);
  };

  const filteredMerchandise = merchandise.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = ['all', 'jerseys', 'shorts', 'hoodies', 'accessories', 'equipment'];

  if (loading) {
    return (
      <div className="merchandise-container">
        <div className="loading">Loading merchandise...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchandise-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="merchandise-container">
      <div className="merchandise-header">
        <h2>Club Merchandise</h2>
        <p>Show your team spirit with official AURFC gear!</p>
      </div>

      <div className="merchandise-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search merchandise..."
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

      <div className="merchandise-grid">
        {filteredMerchandise.map(item => (
          <div key={item.id} className="merchandise-item">
            <div className="item-image">
              <img src={item.image} alt={item.name} />
              {!item.inStock && <div className="out-of-stock">Out of Stock</div>}
            </div>
            
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <p className="item-price">${item.price.toFixed(2)}</p>
              
              <div className="item-sizes">
                <label>Size:</label>
                <select className="size-select" defaultValue="">
                  <option value="" disabled>Select Size</option>
                  {item.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <button
                className="add-to-cart-btn"
                onClick={() => {
                  const sizeSelect = document.querySelector(`[data-item-id="${item.id}"] .size-select`);
                  const selectedSize = sizeSelect ? sizeSelect.value : item.sizes[0];
                  if (selectedSize) {
                    handleAddToCart(item, selectedSize);
                  }
                }}
                disabled={!item.inStock}
                data-item-id={item.id}
              >
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMerchandise.length === 0 && (
        <div className="no-results">
          <p>No merchandise found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Merchandise;
