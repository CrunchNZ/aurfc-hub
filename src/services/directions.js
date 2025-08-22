// Directions Service for AURFC Hub
// Handles getting directions to event locations using Google Maps and Apple Maps

// ============================================================================
// GOOGLE MAPS INTEGRATION
// ============================================================================

/**
 * Generate Google Maps directions URL
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional, defaults to user's location)
 * @param {string} travelMode - Travel mode ('driving', 'walking', 'bicycling', 'transit')
 * @returns {string} Google Maps directions URL
 */
export const generateGoogleMapsDirectionsUrl = (destination, origin = '', travelMode = 'driving') => {
  const params = new URLSearchParams({
    destination: destination,
    travelmode: travelMode
  });
  
  if (origin) {
    params.append('origin', origin);
  }
  
  return `https://www.google.com/maps/dir/?api=1&${params.toString()}`;
};

/**
 * Open Google Maps directions in new tab
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional)
 * @param {string} travelMode - Travel mode
 */
export const openGoogleMapsDirections = (destination, origin = '', travelMode = 'driving') => {
  const url = generateGoogleMapsDirectionsUrl(destination, origin, travelMode);
  window.open(url, '_blank');
};

// ============================================================================
// APPLE MAPS INTEGRATION
// ============================================================================

/**
 * Generate Apple Maps directions URL
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional)
 * @param {string} travelMode - Travel mode ('d', 'w', 'r') - driving, walking, transit
 * @returns {string} Apple Maps directions URL
 */
export const generateAppleMapsDirectionsUrl = (destination, origin = '', travelMode = 'd') => {
  let url = `http://maps.apple.com/?daddr=${encodeURIComponent(destination)}`;
  
  if (origin) {
    url += `&saddr=${encodeURIComponent(origin)}`;
  }
  
  if (travelMode !== 'd') {
    url += `&dirflg=${travelMode}`;
  }
  
  return url;
};

/**
 * Open Apple Maps directions
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional)
 * @param {string} travelMode - Travel mode
 */
export const openAppleMapsDirections = (destination, origin = '', travelMode = 'd') => {
  const url = generateAppleMapsDirectionsUrl(destination, origin, travelMode);
  window.open(url, '_blank');
};

// ============================================================================
// SMART DIRECTIONS DETECTION
// ============================================================================

/**
 * Detect user's operating system to suggest appropriate maps app
 * @returns {string} 'ios', 'macos', 'android', 'windows', 'other'
 */
export const detectUserOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/macintosh|mac os x/.test(userAgent)) {
    return 'macos';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else if (/windows/.test(userAgent)) {
    return 'windows';
  }
  
  return 'other';
};

/**
 * Get optimal directions URL based on user's OS
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional)
 * @param {string} travelMode - Travel mode
 * @returns {Object} Object with url and provider information
 */
export const getOptimalDirectionsUrl = (destination, origin = '', travelMode = 'driving') => {
  const userOS = detectUserOS();
  
  if (userOS === 'ios' || userOS === 'macos') {
    return {
      url: generateAppleMapsDirectionsUrl(destination, origin, travelMode === 'driving' ? 'd' : travelMode === 'walking' ? 'w' : 'r'),
      provider: 'Apple Maps',
      icon: '🍎'
    };
  } else {
    return {
      url: generateGoogleMapsDirectionsUrl(destination, origin, travelMode),
      provider: 'Google Maps',
      icon: '🗺️'
    };
  }
};

/**
 * Open directions using the optimal maps app for the user's OS
 * @param {string} destination - Destination address or coordinates
 * @param {string} origin - Origin address (optional)
 * @param {string} travelMode - Travel mode
 */
export const openOptimalDirections = (destination, origin = '', travelMode = 'driving') => {
  const directionsInfo = getOptimalDirectionsUrl(destination, origin, travelMode);
  window.open(directionsInfo.url, '_blank');
};

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

/**
 * Format location for directions
 * @param {Object|string} location - Location object or string
 * @returns {string} Formatted location string
 */
export const formatLocationForDirections = (location) => {
  if (typeof location === 'string') {
    return location;
  }
  
  if (location && typeof location === 'object') {
    if (location.address) {
      return location.address;
    }
    
    if (location.name && location.address) {
      return `${location.name}, ${location.address}`;
    }
    
    if (location.coordinates && location.coordinates.latitude && location.coordinates.longitude) {
      return `${location.coordinates.latitude},${location.coordinates.longitude}`;
    }
  }
  
  return '';
};

/**
 * Get user's current location (if permission granted)
 * @returns {Promise<Object>} Promise resolving to coordinates object
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// ============================================================================
// DIRECTIONS COMPONENT HELPERS
// ============================================================================

/**
 * Generate travel mode options for directions
 * @returns {Array} Array of travel mode objects
 */
export const getTravelModeOptions = () => [
  { value: 'driving', label: 'Driving', icon: '🚗' },
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'bicycling', label: 'Bicycling', icon: '🚴' },
  { value: 'transit', label: 'Public Transit', icon: '🚌' }
];

/**
 * Get travel mode icon
 * @param {string} mode - Travel mode
 * @returns {string} Emoji icon
 */
export const getTravelModeIcon = (mode) => {
  const options = getTravelModeOptions();
  const option = options.find(opt => opt.value === mode);
  return option ? option.icon : '📍';
};
