import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shirt, 
  FileText, 
  Coffee, 
  Ticket, 
  Users, 
  Gift,
  ShoppingBag,
  CreditCard,
  Calendar,
  Pizza
} from 'lucide-react';

const StoreNavigation = ({ activeSection, setActiveSection }) => {
  const sections = [
    { 
      id: 'merchandise', 
      label: 'Merchandise', 
      icon: ShoppingBag,
      description: 'Club gear and apparel'
    },
    { 
      id: 'registration', 
      label: 'Registration', 
      icon: CreditCard,
      description: 'Membership fees'
    },
    { 
      id: 'clubroom', 
      label: 'Clubroom', 
      icon: Coffee,
      description: 'Food & beverages'
    },
    { 
      id: 'events', 
      label: 'Events', 
      icon: Ticket,
      description: 'Match tickets'
    },
    { 
      id: 'ordering', 
      label: 'Group Orders', 
      icon: Users,
      description: 'Team meals'
    },
    { 
      id: 'fundraising', 
      label: 'Fundraising', 
      icon: Gift,
      description: 'Support the club'
    }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-card shadow-md p-2"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg transform scale-105'
                  : 'bg-secondary-light text-text-secondary hover:bg-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <Icon 
                size={24} 
                className={`mb-2 ${
                  isActive ? 'text-white' : 'text-primary'
                }`}
              />
              <span className="text-sm font-medium text-center mb-1">
                {section.label}
              </span>
              <span className={`text-xs text-center ${
                isActive ? 'text-white/80' : 'text-text-secondary'
              }`}>
                {section.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default StoreNavigation;
