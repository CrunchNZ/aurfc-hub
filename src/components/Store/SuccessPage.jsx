import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order details from URL parameters
    const sessionId = searchParams.get('session_id');
    const paymentIntentId = searchParams.get('payment_intent');
    
    if (sessionId || paymentIntentId) {
      // In a real app, you'd fetch order details from your backend
      // For now, we'll simulate it
      setTimeout(() => {
        setOrderDetails({
          orderId: `ORD-${Date.now()}`,
          sessionId: sessionId || 'N/A',
          paymentIntentId: paymentIntentId || 'N/A',
          amount: searchParams.get('amount') || '0',
          currency: searchParams.get('currency') || 'NZD',
          customerEmail: searchParams.get('customer_email') || 'customer@example.com',
          items: JSON.parse(searchParams.get('items') || '[]'),
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Thank you for your order! Your payment has been processed successfully and we're preparing your items.
          </p>
        </motion.div>

        {/* Order Details */}
        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-card shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Order ID:</span>
                    <span className="font-medium text-text-primary">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Session ID:</span>
                    <span className="font-medium text-text-primary font-mono text-sm">
                      {orderDetails.sessionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Payment Intent:</span>
                    <span className="font-medium text-text-primary font-mono text-sm">
                      {orderDetails.paymentIntentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Amount:</span>
                    <span className="font-bold text-primary text-lg">
                      {new Intl.NumberFormat('en-NZ', {
                        style: 'currency',
                        currency: orderDetails.currency,
                      }).format(orderDetails.amount / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-text-secondary" />
                    <span className="text-text-primary">{orderDetails.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-text-secondary" />
                    <span className="text-text-primary">+64 21 123 4567</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {orderDetails.items.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium text-text-primary">{item.name}</span>
                        {item.selectedSize && (
                          <span className="text-sm text-text-secondary ml-2">({item.selectedSize})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-text-secondary">Qty: {item.quantity}</span>
                        <span className="font-medium text-text-primary ml-4">
                          {new Intl.NumberFormat('en-NZ', {
                            style: 'currency',
                            currency: orderDetails.currency,
                          }).format((item.price * item.quantity) / 100)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-blue-50 rounded-card p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">What Happens Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Package size={32} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Order Processing</h3>
              <p className="text-text-secondary text-sm">
                We're preparing your order and will send you a confirmation email shortly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Mail size={32} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Email Confirmation</h3>
              <p className="text-text-secondary text-sm">
                Check your email for order details, tracking information, and delivery updates.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Phone size={32} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Support Available</h3>
              <p className="text-text-secondary text-sm">
                Need help? Contact our support team for any questions about your order.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/store"
            className="btn-secondary flex items-center justify-center gap-2 px-8 py-3"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
          
          <button
            onClick={() => window.print()}
            className="btn-primary px-8 py-3"
          >
            Print Receipt
          </button>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12 text-text-secondary"
        >
          <p className="mb-2">
            Questions about your order? Contact us at{' '}
            <a href="mailto:support@aurfc.co.nz" className="text-primary hover:underline">
              support@aurfc.co.nz
            </a>
          </p>
          <p>
            Or call us at{' '}
            <a href="tel:+64211234567" className="text-primary hover:underline">
              +64 21 123 4567
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessPage;

