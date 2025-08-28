// Stripe Configuration
export const STRIPE_CONFIG = {
  // Publishable key (safe to expose in frontend)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here',
  
  // API endpoints
  apiEndpoints: {
    createCheckoutSession: '/api/create-checkout-session',
    createPaymentIntent: '/api/create-payment-intent',
    confirmPayment: '/api/confirm-payment',
  },
  
  // Currency and locale settings
  currency: 'nzd', // New Zealand Dollar
  locale: 'en-NZ',
  
  // Success and cancel URLs
  successUrl: `${window.location.origin}/store/success`,
  cancelUrl: `${window.location.origin}/store`,
  
  // Payment method types
  paymentMethodTypes: ['card'],
  
  // Billing address collection
  billingAddressCollection: 'required',
  
  // Shipping address collection (for physical items)
  shippingAddressCollection: {
    allowedCountries: ['NZ', 'AU', 'US', 'GB', 'CA'],
  },
};

// Initialize Stripe
export const initializeStripe = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(STRIPE_CONFIG.publishableKey);
};

// Format price for display
export const formatPrice = (amount, currency = 'NZD') => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe uses cents
};

// Convert price to cents for Stripe
export const toStripeAmount = (amount) => {
  return Math.round(amount * 100);
};

// Convert price from cents from Stripe
export const fromStripeAmount = (amount) => {
  return amount / 100;
};

