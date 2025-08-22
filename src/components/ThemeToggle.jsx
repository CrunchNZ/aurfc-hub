import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { isDarkMode, isSystemTheme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    {
      id: 'light',
      label: 'Light',
      icon: '☀️',
      action: setLightTheme,
      active: !isDarkMode && !isSystemTheme,
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: '🌙',
      action: setDarkTheme,
      active: isDarkMode && !isSystemTheme,
    },
    {
      id: 'system',
      label: 'System',
      icon: '💻',
      action: setSystemTheme,
      active: isSystemTheme,
    },
  ];

  const handleThemeChange = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="relative p-3 rounded-full bg-secondary-light hover:bg-secondary transition-colors duration-200 shadow-md hover:shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ rotate: isDarkMode ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.div>
      </motion.button>

      {/* Theme Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-secondary-light dark:border-gray-600 z-50"
          >
            <div className="p-2">
              {themeOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleThemeChange(option.action)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    option.active
                      ? 'bg-primary text-white'
                      : 'text-text-primary hover:bg-secondary-light dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-3 text-base">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                  {option.active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-white text-xs shadow-md hover:shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Theme settings"
      >
        ⚙️
      </motion.button>
    </div>
  );
};

export default ThemeToggle;
