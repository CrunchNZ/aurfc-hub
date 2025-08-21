import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CheckoutForm from './CheckoutForm';
import './Cart.css';

const Cart = ({ 
  cart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart, 
  getCartTotal, 
  onClose 
}) => {
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="cart-overlay">
        <div className="cart-modal">
          <div className="cart-header">
            <h3>Shopping Cart</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <button className="btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    clearCart();
    setShowCheckout(false);
    onClose();
  };

  if (showCheckout) {
    return (
      <CheckoutForm
        cart={cart}
        total={getCartTotal()}
        user={user}
        onComplete={handleCheckoutComplete}
        onCancel={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h3>Shopping Cart ({cart.length} items)</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={`${item.id}-${item.type}-${index}`} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="item-type">{item.type}</p>
                <p className="item-price">${item.price.toFixed(2)}</p>
              </div>
              
              <div className="item-controls">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateCartItemQuantity(item.id, item.type, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateCartItemQuantity(item.id, item.type, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id, item.type)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-footer">
          <div className="cart-total">
            <strong>Total: ${getCartTotal().toFixed(2)}</strong>
          </div>
          
          <div className="cart-actions">
            <button className="btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
            <button className="btn-primary" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
