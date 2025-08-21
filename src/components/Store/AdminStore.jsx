import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminStore.css';

const AdminStore = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('merchandise');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from Firestore
      // For now, we'll use mock data
      const mockItems = {
        merchandise: [
          { id: 'merch-1', name: 'AURFC Club Jersey', price: 89.99, category: 'jerseys', inStock: true },
          { id: 'merch-2', name: 'Training Shorts', price: 45.00, category: 'shorts', inStock: true },
          { id: 'merch-3', name: 'Club Hoodie', price: 65.00, category: 'hoodies', inStock: true }
        ],
        clubroom: [
          { id: 'coffee-1', name: 'Flat White', price: 4.50, category: 'coffee', inStock: true },
          { id: 'snack-1', name: 'Chips', price: 2.50, category: 'snacks', inStock: true }
        ],
        events: [
          { id: 'event-1', name: 'Away Game Bus Trip', price: 15.00, category: 'transport', inStock: true },
          { id: 'event-2', name: 'Quiz Night', price: 10.00, category: 'social', inStock: true }
        ]
      };

      setItems(mockItems[activeTab] || []);
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (itemData) => {
    const newItem = {
      id: `item-${Date.now()}`,
      ...itemData
    };
    setItems([...items, newItem]);
    setShowAddForm(false);
  };

  const handleEditItem = (itemId, updatedData) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...updatedData } : item
    ));
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const toggleStock = (itemId) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, inStock: !item.inStock } : item
    ));
  };

  if (!user || !['admin', 'coach'].includes(user.role)) {
    return (
      <div className="admin-store-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-store-container">
      <div className="admin-header">
        <h2>Store Administration</h2>
        <p>Manage store items, pricing, and inventory</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'merchandise' ? 'active' : ''}`}
          onClick={() => setActiveTab('merchandise')}
        >
          Merchandise
        </button>
        <button 
          className={`admin-tab ${activeTab === 'clubroom' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubroom')}
        >
          Clubroom
        </button>
        <button 
          className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
      </div>

      <div className="admin-actions">
        <button 
          className="add-item-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Item
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => setEditingItem(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="toggle-stock-btn"
                        onClick={() => toggleStock(item.id)}
                      >
                        {item.inStock ? 'Mark Out' : 'Mark In'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddItemForm 
          onAdd={handleAddItem}
          onCancel={() => setShowAddForm(false)}
          category={activeTab}
        />
      )}

      {editingItem && (
        <EditItemForm 
          item={editingItem}
          onSave={handleEditItem}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

// Add Item Form Component
const AddItemForm = ({ onAdd, onCancel, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: category,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price) {
      onAdd({
        ...formData,
        price: parseFloat(formData.price),
        inStock: true
      });
    }
  };

  return (
    <div className="form-modal">
      <div className="form-content">
        <h3>Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Item Form Component
const EditItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    price: item.price.toString(),
    category: item.category,
    description: item.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price) {
      onSave(item.id, {
        ...formData,
        price: parseFloat(formData.price)
      });
    }
  };

  return (
    <div className="form-modal">
      <div className="form-content">
        <h3>Edit Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStore;
