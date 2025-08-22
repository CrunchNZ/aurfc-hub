import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('aurfc-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      setIsSystemTheme(false);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      setIsSystemTheme(false);
    } else {
      setIsDarkMode(systemPrefersDark);
      setIsSystemTheme(true);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.setProperty('--background', '#121212');
      document.body.style.setProperty('--text-primary', '#FFFFFF');
      document.body.style.setProperty('--text-secondary', '#E5E5E5');
      document.body.style.setProperty('--primary', '#66A3FF');
      document.body.style.setProperty('--primary-light', '#99CCFF');
      document.body.style.setProperty('--primary-dark', '#3366CC');
      document.body.style.setProperty('--secondary', '#404040');
      document.body.style.setProperty('--secondary-light', '#606060');
      document.body.style.setProperty('--secondary-dark', '#202020');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.setProperty('--background', '#FFFFFF');
      document.body.style.setProperty('--text-primary', '#000000');
      document.body.style.setProperty('--text-secondary', '#333333');
      document.body.style.setProperty('--primary', '#003366');
      document.body.style.setProperty('--primary-light', '#007FFF');
      document.body.style.setProperty('--primary-dark', '#001F3F');
      document.body.style.setProperty('--secondary', '#C0C0C0');
      document.body.style.setProperty('--secondary-light', '#E5E5E5');
      document.body.style.setProperty('--secondary-dark', '#A9A9A9');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystemTheme]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    setIsSystemTheme(false);
    localStorage.setItem('aurfc-theme', newTheme ? 'dark' : 'light');
  };

  const setLightTheme = () => {
    setIsDarkMode(false);
    setIsSystemTheme(false);
    localStorage.setItem('aurfc-theme', 'light');
  };

  const setDarkTheme = () => {
    setIsDarkMode(true);
    setIsSystemTheme(false);
    localStorage.setItem('aurfc-theme', 'dark');
  };

  const setSystemTheme = () => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(systemPrefersDark);
    setIsSystemTheme(true);
    localStorage.removeItem('aurfc-theme');
  };

  const value = {
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
