import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Logo from './Logo';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User, 
  Settings,
  Baby,
  CreditCard,
  ShoppingBag,
  BarChart3,
  LogOut,
  Building2,
  DollarSign,
  Trophy
} from 'lucide-react';

const Navigation = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('player');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user role from Firestore profile
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { getCurrentUserRole } = await import('../services/auth');
          const role = await getCurrentUserRole();
          setUserRole(role || 'player'); // Default to player if no role found
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('player'); // Default fallback
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Role-based navigation items
  const getNavItems = (role) => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'coach', 'manager', 'player', 'parent'] },
      { path: '/profile', label: 'Profile', icon: User, roles: ['admin', 'coach', 'manager', 'player', 'parent'] },
      { path: '/store', label: 'Store', icon: ShoppingBag, roles: ['admin', 'coach', 'manager', 'player', 'parent'] },
    ];

    const roleSpecificItems = {
      player: [
        { path: '/player-schedule', label: 'My Schedule', icon: Calendar, roles: ['player'] },
        { path: '/chat', label: 'Team Messages', icon: MessageSquare, roles: ['player'] },
      ],
      coach: [
        { path: '/team-management', label: 'Team Management', icon: Users, roles: ['coach', 'manager'] },
        { path: '/calendar', label: 'Update Team Schedule', icon: Calendar, roles: ['coach', 'manager'] },
        { path: '/chat', label: 'Messaging', icon: MessageSquare, roles: ['coach', 'manager'] },
        { path: '/junior-portal', label: 'Junior Portal', icon: Baby, roles: ['coach', 'manager'] },
      ],
      manager: [
        { path: '/team-management', label: 'Team Management', icon: Users, roles: ['coach', 'manager'] },
        { path: '/calendar', label: 'Update Team Schedule', icon: Calendar, roles: ['coach', 'manager'] },
        { path: '/chat', label: 'Messaging', icon: MessageSquare, roles: ['coach', 'manager'] },
        { path: '/junior-portal', label: 'Junior Portal', icon: Baby, roles: ['coach', 'manager'] },
      ],
      admin: [
        { path: '/club-management', label: 'Club Management', icon: Building2, roles: ['admin'] },
        { path: '/financial-management', label: 'Financial Management', icon: DollarSign, roles: ['admin'] },
        { path: '/member-management', label: 'Member Management', icon: Users, roles: ['admin'] },
        { path: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin'] },
        { path: '/system-admin', label: 'System Settings', icon: Settings, roles: ['admin'] },
      ],
      parent: [
        { path: '/calendar', label: 'Family Schedule', icon: Calendar, roles: ['parent'] },
        { path: '/chat', label: 'Family Messages', icon: MessageSquare, roles: ['parent'] },
        { path: '/junior-portal', label: 'Junior Portal', icon: Baby, roles: ['parent'] },
      ]
    };

    return [...baseItems, ...(roleSpecificItems[role] || [])];
  };

  const navItems = getNavItems(userRole);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    // Show demo navigation for testing purposes
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-rugby-gradient shadow-lg border-b border-primary-dark/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <div className="flex items-center space-x-3 text-white">
                <Logo variant="icon" size="sm" className="text-white" />
                <div>
                  <span className="text-xl font-bold">AURFC Hub</span>
                  <span className="block text-xs text-white/60">Demo Mode</span>
                </div>
              </div>
            </motion.div>

            {/* Demo Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              <span className="text-white/80 text-sm px-3 py-2">Dashboard</span>
              <span className="text-white/80 text-sm px-3 py-2">Teams</span>
              <span className="text-white/80 text-sm px-3 py-2">Calendar</span>
              <span className="text-white/80 text-sm px-3 py-2">Profile</span>
            </div>

            {/* Demo User Info */}
            <div className="text-white/80 text-sm">
              Demo User (Not Logged In)
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-rugby-gradient shadow-lg border-b border-primary-dark/20 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Link to="/dashboard" className="flex items-center space-x-3 text-white hover:text-white/80 transition-colors duration-200">
              <Logo variant="icon" size="sm" className="text-white" />
              <div>
                <span className="text-xl font-bold">AURFC Hub</span>
                <span className="block text-xs text-white/60">Est. 1888</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
            
            {/* Sign Out Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 ml-4 border-l border-white/20 pl-4"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-white/20"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Mobile Sign Out */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: navItems.length * 0.05 }}
                  className="border-t border-white/20 pt-4 mt-4"
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;