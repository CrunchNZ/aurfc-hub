import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import StoreNavigation from './StoreNavigation';
import Merchandise from './Merchandise';
import RegistrationPayments from './RegistrationPayments';
import ClubroomOrdering from './ClubroomOrdering';
import EventTicketing from './EventTicketing';
import Ordering from './Ordering';
import Fundraising from './Fundraising';
import Cart from './Cart';
import { ShoppingCart, Store as StoreIcon, CreditCard, Users, Calendar, Gift, Coffee } from 'lucide-react';

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
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="card-primary">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <StoreIcon size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-white/80">Please log in to access the AURFC Store.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Store Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="card-primary mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
              >
                <StoreIcon size={32} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">AURFC Store</h1>
              <p className="text-white/80">Official club merchandise, tickets, and more</p>
            </div>

            {/* Cart Summary */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCart(!showCart)}
                className="btn-accent flex items-center gap-2 px-6 py-3"
              >
                <ShoppingCart size={20} />
                Cart ({cart.length} items)
              </motion.button>
              
              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Total: ${getCartTotal().toFixed(2)}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Store Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <StoreNavigation 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </motion.div>

        {/* Store Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          {renderActiveSection()}
        </motion.div>
      </motion.div>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-card shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Cart
                cart={cart}
                removeFromCart={removeFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
                clearCart={clearCart}
                getCartTotal={getCartTotal}
                onClose={() => setShowCart(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
