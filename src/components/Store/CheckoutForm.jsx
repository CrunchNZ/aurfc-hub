import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { formatPrice } from '../../config/stripe';

const CheckoutForm = ({ cart, total, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState('demo'); // 'demo' or 'manual'
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Manual payment form (fallback)
  const [manualPayment, setManualPayment] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Validate customer information
  const validateCustomerInfo = () => {
    const errors = {};
    
    if (!customerInfo.name.trim()) errors.name = 'Name is required';
    if (!customerInfo.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) errors.email = 'Invalid email format';
    if (!customerInfo.phone.trim()) errors.phone = 'Phone is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle demo checkout (simulates Stripe redirect)
  const handleDemoCheckout = async () => {
    if (!validateCustomerInfo()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate Stripe checkout redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, redirect to success page with order details
      const orderData = {
        sessionId: `cs_demo_${Date.now()}`,
        amount: total,
        currency: 'NZD',
        customerEmail: customerInfo.email,
        items: cart,
      };
      
      const params = new URLSearchParams({
        session_id: orderData.sessionId,
        amount: orderData.amount * 100, // Convert to cents
        currency: orderData.currency,
        customer_email: orderData.customerEmail,
        items: JSON.stringify(orderData.items),
      });
      
      // Redirect to success page
      window.location.href = `/store/success?${params.toString()}`;
      
    } catch (err) {
      console.error('Demo checkout error:', err);
      setError('Checkout failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual payment
  const handleManualPayment = async () => {
    if (!validateCustomerInfo()) return;
    
    // Validate card details
    const cardValidation = validateCard(
      manualPayment.cardNumber,
      parseInt(manualPayment.expiryMonth),
      parseInt(manualPayment.expiryYear),
      manualPayment.cvc
    );
    
    if (!cardValidation.isValid) {
      setError('Invalid card details: ' + cardValidation.errors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate payment processing (replace with actual payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      onComplete();
      
    } catch (err) {
      setError('Payment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (checkoutMethod === 'demo') {
      handleDemoCheckout();
    } else {
      handleManualPayment();
    }
  };

  // Basic card validation
  const validateCard = (cardNumber, expiryMonth, expiryYear, cvc) => {
    const errors = [];

    // Card number validation
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      errors.push('Invalid card number');
    }

    // Expiry validation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.push('Card has expired');
    }

    // CVC validation
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      errors.push('Invalid CVC');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Get card brand icon
  const getCardBrandIcon = () => {
    const brand = getCardBrand(manualPayment.cardNumber);
    const brandColors = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600',
      diners: 'text-purple-600',
      jcb: 'text-blue-800',
      unknown: 'text-gray-400',
    };
    
    return (
      <div className={`text-sm font-semibold ${brandColors[brand] || brandColors.unknown}`}>
        {brand.toUpperCase()}
      </div>
    );
  };

  // Get card brand from card number
  const getCardBrand = (cardNumber) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35\d{3})/,
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }

    return 'unknown';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
        >
          <CreditCard size={32} className="text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Complete Your Order</h2>
        <p className="text-text-secondary">Secure checkout powered by Stripe</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-text-primary mb-3">Order Summary</h3>
        <div className="space-y-2">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {item.quantity}x {item.name}
                {item.selectedSize && ` (${item.selectedSize})`}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Method Selection */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setCheckoutMethod('demo')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              checkoutMethod === 'demo'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield size={20} />
              <span>Demo Checkout</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setCheckoutMethod('manual')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              checkoutMethod === 'manual'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard size={20} />
              <span>Manual Payment</span>
            </div>
          </button>
        </div>
        
        {checkoutMethod === 'demo' && (
          <div className="text-sm text-text-secondary bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-600" />
              <span>Demo checkout - simulates Stripe redirect and shows success page.</span>
            </div>
          </div>
        )}
        
        {checkoutMethod === 'manual' && (
          <div className="text-sm text-text-secondary bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-600" />
              <span>Manual payment processing. For demo purposes only.</span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Information Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className={`form-input w-full ${formErrors.name ? 'border-red-500' : ''}`}
              placeholder="John Doe"
              required
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className={`form-input w-full ${formErrors.email ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
              required
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            className={`form-input w-full ${formErrors.phone ? 'border-red-500' : ''}`}
            placeholder="+64 21 123 4567"
            required
          />
          {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
        </div>

        {/* Manual Payment Form (only show if manual method selected) */}
        {checkoutMethod === 'manual' && (
          <div className="border-t pt-6 mt-6">
            <h4 className="font-semibold text-text-primary mb-4">Payment Details</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualPayment.cardNumber}
                    onChange={(e) => setManualPayment({ ...manualPayment, cardNumber: e.target.value })}
                    className="form-input w-full pr-20"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getCardBrandIcon()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Month *
                  </label>
                  <select
                    value={manualPayment.expiryMonth}
                    onChange={(e) => setManualPayment({ ...manualPayment, expiryMonth: e.target.value })}
                    className="form-select w-full"
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Year *
                  </label>
                  <select
                    value={manualPayment.expiryYear}
                    onChange={(e) => setManualPayment({ ...manualPayment, expiryYear: e.target.value })}
                    className="form-select w-full"
                    required
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    CVC *
                  </label>
                  <input
                    type="text"
                    value={manualPayment.cvc}
                    onChange={(e) => setManualPayment({ ...manualPayment, cvc: e.target.value })}
                    className="form-input w-full"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={manualPayment.cardholderName}
                  onChange={(e) => setManualPayment({ ...manualPayment, cardholderName: e.target.value })}
                  className="form-input w-full"
                  placeholder="JOHN DOE"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span>Your payment information is secure and encrypted. We never store your card details.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                {checkoutMethod === 'demo' ? 'Proceed to Demo Checkout' : 'Complete Payment'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
