import { getFunctions, httpsCallable } from 'firebase/functions';
import { STRIPE_CONFIG, toStripeAmount, fromStripeAmount } from '../config/stripe';

// Initialize Firebase Functions
const functions = getFunctions();

// Stripe API Service using Firebase Functions
export class StripeService {
  static async createCheckoutSession(cart, customerInfo = {}) {
    try {
      // Prepare line items for Stripe
      const lineItems = cart.map(item => ({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: item.name,
            description: item.description || item.type,
            images: item.image ? [item.image] : [],
            metadata: {
              itemId: item.id,
              itemType: item.type,
              selectedSize: item.selectedSize || 'N/A',
            },
          },
          unit_amount: toStripeAmount(item.price),
        },
        quantity: item.quantity,
      }));

      // Call Firebase Function to create checkout session
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        line_items: lineItems,
        mode: 'payment',
        success_url: STRIPE_CONFIG.successUrl,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        currency: STRIPE_CONFIG.currency,
        locale: STRIPE_CONFIG.locale,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
        billing_address_collection: STRIPE_CONFIG.billingAddressCollection,
        shipping_address_collection: STRIPE_CONFIG.shippingAddressCollection,
        customer_email: customerInfo.email,
        metadata: {
          cartTotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: cart.length,
          customerName: customerInfo.name || 'Guest',
        },
      });

      return result.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  static async createPaymentIntent(amount, currency = STRIPE_CONFIG.currency) {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntent({
        amount: toStripeAmount(amount),
        currency: currency,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
      });

      return result.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  static async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const confirmPayment = httpsCallable(functions, 'confirmPayment');
      const result = await confirmPayment({
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
      });

      return result.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  static async getOrderBySessionId(sessionId) {
    try {
      const getOrderBySessionId = httpsCallable(functions, 'getOrderBySessionId');
      const result = await getOrderBySessionId({ sessionId });
      return result.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  // Validate card details (basic validation)
  static validateCard(cardNumber, expiryMonth, expiryYear, cvc) {
    const errors = [];

    // Card number validation (basic Luhn algorithm check)
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
  }

  // Get card brand from card number
  static getCardBrand(cardNumber) {
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
  }
}

// Export individual functions for convenience
export const createCheckoutSession = StripeService.createCheckoutSession.bind(StripeService);
export const createPaymentIntent = StripeService.createPaymentIntent.bind(StripeService);
export const confirmPayment = StripeService.confirmPayment.bind(StripeService);
export const getOrderBySessionId = StripeService.getOrderBySessionId.bind(StripeService);
export const validateCard = StripeService.validateCard.bind(StripeService);
export const getCardBrand = StripeService.getCardBrand.bind(StripeService);
