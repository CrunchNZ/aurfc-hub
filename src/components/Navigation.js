import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
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
  LogOut
} from 'lucide-react';

const Navigation = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('player');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd fetch the user role from Firestore
    // For now, we'll simulate based on email or other criteria
    if (user?.email?.includes('admin')) {
      setUserRole('admin');
    } else if (user?.email?.includes('coach')) {
      setUserRole('coach');
    } else if (user?.email?.includes('parent')) {
      setUserRole('parent');
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/team-management', label: 'Teams', icon: Users, roles: ['admin', 'coach'] },
    { path: '/calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/attendance', label: 'Attendance', icon: BarChart3, roles: ['admin', 'coach'] },
    { path: '/messaging', label: 'Messages', icon: MessageSquare, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/junior-portal', label: 'Junior Portal', icon: Baby, roles: ['admin', 'coach', 'parent'] },
    { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/merchandise', label: 'Shop', icon: ShoppingBag, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/profile', label: 'Profile', icon: User, roles: ['admin', 'coach', 'player', 'parent'] },
    { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="nav">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="nav-brand">
            🏉 AURFC Hub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex nav-links">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <button onClick={handleSignOut} className="nav-link flex items-center gap-2">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 py-2 ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="nav-link flex items-center gap-2 py-2 text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;