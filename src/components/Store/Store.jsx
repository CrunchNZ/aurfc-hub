import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StoreNavigation from './StoreNavigation';
import Merchandise from './Merchandise';
import RegistrationPayments from './RegistrationPayments';
import ClubroomOrdering from './ClubroomOrdering';
import EventTicketing from './EventTicketing';
import Ordering from './Ordering';
import Fundraising from './Fundraising';
import Cart from './Cart';
import './Store.css';

const Store = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('merchandise');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('aurfc-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aurfc-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type
      );
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId, itemType) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === itemId && item.type === itemType)
    ));
  };

  const updateCartItemQuantity = (itemId, itemType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, itemType);
      return;
    }
    
    setCart(prevCart => prevCart.map(item =>
      item.id === itemId && item.type === itemType
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderActiveSection = () => {
    const commonProps = {
      addToCart,
      user,
      cart
    };

    switch (activeSection) {
      case 'merchandise':
        return <Merchandise {...commonProps} />;
      case 'registration':
        return <RegistrationPayments {...commonProps} />;
      case 'clubroom':
        return <ClubroomOrdering {...commonProps} />;
      case 'events':
        return <EventTicketing {...commonProps} />;
      case 'ordering':
        return <Ordering {...commonProps} />;
      case 'fundraising':
        return <Fundraising {...commonProps} />;
      default:
        return <Merchandise {...commonProps} />;
    }
  };

  if (!user) {
    return (
      <div className="store-container">
        <div className="store-error">
          <h2>Access Denied</h2>
          <p>Please log in to access the store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <div className="store-header">
        <h1>AURFC Store</h1>
        <div className="cart-summary">
          <button 
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cart.length} items)
          </button>
          {cart.length > 0 && (
            <span className="cart-total">
              Total: ${getCartTotal().toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <StoreNavigation 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="store-content">
        {renderActiveSection()}
      </div>

      {showCart && (
        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartItemQuantity={updateCartItemQuantity}
          clearCart={clearCart}
          getCartTotal={getCartTotal}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  );
};

export default Store;
