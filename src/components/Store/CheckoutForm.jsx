import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import './CheckoutForm.css';

// Initialize Stripe (this should be moved to environment variables)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key');

const CheckoutForm = ({ cart, total, user, onComplete, onCancel }) => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);

  useEffect(() => {
    // Create checkout session when component mounts
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically call a Firebase Function to create a Stripe checkout session
      // For now, we'll simulate the process
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart,
          total,
          userId: authUser.uid,
          userEmail: authUser.email,
          successUrl: `${window.location.origin}/store/success`,
          cancelUrl: `${window.location.origin}/store`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      setCheckoutSession(session);

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // For development/testing, we'll simulate a successful payment
      // In production, this would be handled by Stripe webhooks
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Simulate successful payment
      onComplete();
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-modal">
          <div className="checkout-loading">
            <div className="spinner"></div>
            <p>Setting up checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-modal">
          <div className="checkout-error">
            <h3>Checkout Error</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={onCancel}>
                Go Back
              </button>
              <button className="btn-primary" onClick={createCheckoutSession}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h3>Checkout</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <div className="checkout-content">
          <div className="order-summary">
            <h4>Order Summary</h4>
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.type}-${index}`} className="summary-item">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
          </div>
          
          <div className="payment-section">
            <h4>Payment Information</h4>
            <p>You will be redirected to our secure payment processor (Stripe) to complete your purchase.</p>
            
            <div className="payment-methods">
              <div className="payment-method">
                <span className="method-icon">💳</span>
                <span>Credit/Debit Cards</span>
              </div>
              <div className="payment-method">
                <span className="method-icon">🏦</span>
                <span>Bank Transfer</span>
              </div>
            </div>
          </div>
          
          <div className="checkout-actions">
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleManualCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
