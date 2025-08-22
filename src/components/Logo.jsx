import React, { useState } from 'react';

const Logo = ({ 
  size = 'default', 
  variant = 'full', 
  className = '',
  onClick = null 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32',
    '4xl': 'w-40 h-40',
    default: 'w-12 h-12'
  };

  // Use HD version for larger sizes
  const getLogoSrc = (size) => {
    if (size === '3xl' || size === '4xl') {
      return '/images/aurfc-logo-hd.svg';
    }
    return '/images/aurfc-logo.svg';
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load logo image:', getLogoSrc(size));
  };

  const variants = {
    full: (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Shield Icon */}
        <div className={`${sizeClasses[size]} relative`}>
          {imageError ? (
            <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
              AURFC
            </div>
          ) : (
            <img 
              src={getLogoSrc(size)} 
              alt="AURFC Logo" 
              className="w-full h-full"
              onError={handleImageError}
            />
          )}
        </div>
        
        {/* Text Logo */}
        <div className="hidden sm:block">
          <h1 className="text-2xl font-bold text-primary">AURFC Hub</h1>
          <p className="text-sm text-muted-foreground">Team Management & Communication</p>
        </div>
      </div>
    ),
    
    icon: (
      <div className={`${sizeClasses[size]} relative ${className}`}>
        {imageError ? (
          <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
            AURFC
          </div>
        ) : (
          <img 
            src={getLogoSrc(size)} 
            alt="AURFC Logo" 
            className="w-full h-full"
            onError={handleImageError}
          />
        )}
      </div>
    ),
    
    text: (
      <div className={`flex items-center space-x-3 ${className}`}>
        <h1 className="text-2xl font-bold text-primary">AURFC Hub</h1>
        <p className="text-sm text-muted-foreground">Team Management & Communication</p>
      </div>
    ),
    
    simple: (
      <div className={`flex items-center ${className}`}>
        <h1 className="text-xl font-bold text-primary">AURFC</h1>
      </div>
    )
  };

  const Component = variants[variant];
  
  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
        {Component}
      </button>
    );
  }

  return Component;
};

export default Logo;
