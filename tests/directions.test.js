import {
  generateGoogleMapsDirectionsUrl,
  openGoogleMapsDirections,
  generateAppleMapsDirectionsUrl,
  openAppleMapsDirections,
  detectUserOS,
  getOptimalDirectionsUrl,
  openOptimalDirections,
  formatLocationForDirections,
  getCurrentLocation,
  getTravelModeOptions,
  getTravelModeIcon
} from '../src/services/directions';

// Mock window.open for testing
global.window = {
  open: jest.fn()
};

// Mock navigator.geolocation
global.navigator = {
  geolocation: {
    getCurrentPosition: jest.fn()
  }
};

// Mock navigator.userAgent
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  writable: true
});

describe('Directions Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Google Maps Integration', () => {
    test('generateGoogleMapsDirectionsUrl should create valid URL with destination only', () => {
      const url = generateGoogleMapsDirectionsUrl('AURFC Ground, 123 Rugby Lane');
      
      expect(url).toContain('https://www.google.com/maps/dir/?api=1');
      expect(url).toContain('destination=AURFC%20Ground%2C%20123%20Rugby%20Lane');
      expect(url).toContain('travelmode=driving');
    });

    test('generateGoogleMapsDirectionsUrl should include origin when provided', () => {
      const url = generateGoogleMapsDirectionsUrl(
        'AURFC Ground, 123 Rugby Lane',
        'Home, 456 Main St',
        'walking'
      );
      
      expect(url).toContain('origin=Home%2C%20456%20Main%20St');
      expect(url).toContain('travelmode=walking');
    });

    test('generateGoogleMapsDirectionsUrl should handle different travel modes', () => {
      const modes = ['driving', 'walking', 'bicycling', 'transit'];
      
      modes.forEach(mode => {
        const url = generateGoogleMapsDirectionsUrl('Destination', '', mode);
        expect(url).toContain(`travelmode=${mode}`);
      });
    });

    test('openGoogleMapsDirections should open URL in new tab', () => {
      openGoogleMapsDirections('AURFC Ground', 'Home', 'driving');
      
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://www.google.com/maps/dir/?api=1'),
        '_blank'
      );
    });
  });

  describe('Apple Maps Integration', () => {
    test('generateAppleMapsDirectionsUrl should create valid URL with destination only', () => {
      const url = generateAppleMapsDirectionsUrl('AURFC Ground, 123 Rugby Lane');
      
      expect(url).toContain('http://maps.apple.com/?daddr=');
      expect(url).toContain('daddr=AURFC%20Ground%2C%20123%20Rugby%20Lane');
    });

    test('generateAppleMapsDirectionsUrl should include origin when provided', () => {
      const url = generateAppleMapsDirectionsUrl(
        'AURFC Ground, 123 Rugby Lane',
        'Home, 456 Main St'
      );
      
      expect(url).toContain('saddr=Home%2C%20456%20Main%20St');
    });

    test('generateAppleMapsDirectionsUrl should handle different travel modes', () => {
      const drivingUrl = generateAppleMapsDirectionsUrl('Destination', '', 'd');
      const walkingUrl = generateAppleMapsDirectionsUrl('Destination', '', 'w');
      const transitUrl = generateAppleMapsDirectionsUrl('Destination', '', 'r');
      
      expect(drivingUrl).not.toContain('dirflg=');
      expect(walkingUrl).toContain('dirflg=w');
      expect(transitUrl).toContain('dirflg=r');
    });

    test('openAppleMapsDirections should open URL in new tab', () => {
      openAppleMapsDirections('AURFC Ground', 'Home', 'd');
      
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('http://maps.apple.com/?daddr='),
        '_blank'
      );
    });
  });

  describe('OS Detection', () => {
    test('detectUserOS should detect macOS correctly', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectUserOS()).toBe('macos');
    });

    test('detectUserOS should detect iOS correctly', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });
      
      expect(detectUserOS()).toBe('ios');
    });

    test('detectUserOS should detect Android correctly', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectUserOS()).toBe('android');
    });

    test('detectUserOS should detect Windows correctly', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(detectUserOS()).toBe('windows');
    });

    test('detectUserOS should return other for unknown OS', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Unknown User Agent',
        writable: true
      });
      
      expect(detectUserOS()).toBe('other');
    });
  });

  describe('Optimal Directions', () => {
    test('getOptimalDirectionsUrl should return Apple Maps for iOS/macOS', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      const result = getOptimalDirectionsUrl('Destination', '', 'driving');
      
      expect(result.provider).toBe('Apple Maps');
      expect(result.icon).toBe('🍎');
      expect(result.url).toContain('maps.apple.com');
    });

    test('getOptimalDirectionsUrl should return Google Maps for other OS', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        writable: true
      });
      
      const result = getOptimalDirectionsUrl('Destination', '', 'driving');
      
      expect(result.provider).toBe('Google Maps');
      expect(result.icon).toBe('🗺️');
      expect(result.url).toContain('google.com/maps');
    });

    test('openOptimalDirections should open optimal maps app', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true
      });
      
      openOptimalDirections('AURFC Ground', '', 'driving');
      
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('maps.apple.com'),
        '_blank'
      );
    });
  });

  describe('Location Utilities', () => {
    test('formatLocationForDirections should handle string locations', () => {
      const result = formatLocationForDirections('AURFC Ground, 123 Rugby Lane');
      expect(result).toBe('AURFC Ground, 123 Rugby Lane');
    });

    test('formatLocationForDirections should handle object locations with address', () => {
      const locationObj = {
        address: 'AURFC Ground, 123 Rugby Lane'
      };
      
      const result = formatLocationForDirections(locationObj);
      expect(result).toBe('AURFC Ground, 123 Rugby Lane');
    });

    test('formatLocationForDirections should handle object locations with name and address', () => {
      const locationObj = {
        name: 'AURFC Ground',
        address: '123 Rugby Lane'
      };
      
      const result = formatLocationForDirections(locationObj);
      expect(result).toBe('AURFC Ground, 123 Rugby Lane');
    });

    test('formatLocationForDirections should handle object locations with coordinates', () => {
      const locationObj = {
        coordinates: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };
      
      const result = formatLocationForDirections(locationObj);
      expect(result).toBe('51.5074,-0.1278');
    });

    test('formatLocationForDirections should return empty string for invalid locations', () => {
      const result = formatLocationForDirections(null);
      expect(result).toBe('');
    });
  });

  describe('Geolocation', () => {
    test('getCurrentLocation should resolve with coordinates on success', () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };
      
      global.navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });
      
      return getCurrentLocation().then(result => {
        expect(result).toEqual({
          latitude: 51.5074,
          longitude: -0.1278
        });
      });
    });

    test('getCurrentLocation should reject on error', () => {
      const mockError = new Error('Geolocation error');
      
      global.navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError);
      });
      
      return getCurrentLocation().catch(error => {
        expect(error).toBe(mockError);
      });
    });

    test('getCurrentLocation should reject if geolocation not supported', () => {
      const originalGeolocation = global.navigator.geolocation;
      delete global.navigator.geolocation;
      
      return getCurrentLocation().catch(error => {
        expect(error.message).toBe('Geolocation not supported');
      }).finally(() => {
        global.navigator.geolocation = originalGeolocation;
      });
    });
  });

  describe('Travel Mode Helpers', () => {
    test('getTravelModeOptions should return all travel modes', () => {
      const options = getTravelModeOptions();
      
      expect(options).toHaveLength(4);
      expect(options).toEqual([
        { value: 'driving', label: 'Driving', icon: '🚗' },
        { value: 'walking', label: 'Walking', icon: '🚶' },
        { value: 'bicycling', label: 'Bicycling', icon: '🚴' },
        { value: 'transit', label: 'Public Transit', icon: '🚌' }
      ]);
    });

    test('getTravelModeIcon should return correct icon for valid mode', () => {
      expect(getTravelModeIcon('driving')).toBe('🚗');
      expect(getTravelModeIcon('walking')).toBe('🚶');
      expect(getTravelModeIcon('bicycling')).toBe('🚴');
      expect(getTravelModeIcon('transit')).toBe('🚌');
    });

    test('getTravelModeIcon should return default icon for invalid mode', () => {
      expect(getTravelModeIcon('invalid')).toBe('📍');
      expect(getTravelModeIcon('')).toBe('📍');
      expect(getTravelModeIcon(null)).toBe('📍');
    });
  });

  describe('URL Encoding', () => {
    test('should properly encode special characters in URLs', () => {
      const specialLocation = 'AURFC Ground & Field, 123 Rugby Lane, London, UK';
      
      const googleUrl = generateGoogleMapsDirectionsUrl(specialLocation);
      const appleUrl = generateAppleMapsDirectionsUrl(specialLocation);
      
      expect(googleUrl).toContain('destination=AURFC%20Ground%20%26%20Field%2C%20123%20Rugby%20Lane%2C%20London%2C%20UK');
      expect(appleUrl).toContain('daddr=AURFC%20Ground%20%26%20Field%2C%20123%20Rugby%20Lane%2C%20London%2C%20UK');
    });

    test('should handle empty and null values gracefully', () => {
      const googleUrl = generateGoogleMapsDirectionsUrl('', '', 'driving');
      const appleUrl = generateAppleMapsDirectionsUrl('', '', 'd');
      
      expect(googleUrl).toContain('destination=');
      expect(appleUrl).toContain('daddr=');
    });
  });

  describe('Integration Scenarios', () => {
    test('should work with calendar events that have location data', () => {
      const calendarEvent = {
        title: 'Rugby Match',
        location: {
          name: 'AURFC Home Ground',
          address: '123 Rugby Lane, London'
        }
      };
      
      const formattedLocation = formatLocationForDirections(calendarEvent.location);
      const googleUrl = generateGoogleMapsDirectionsUrl(formattedLocation);
      
      expect(formattedLocation).toBe('AURFC Home Ground, 123 Rugby Lane, London');
      expect(googleUrl).toContain('destination=AURFC%20Home%20Ground%2C%20123%20Rugby%20Lane%2C%20London');
    });

    test('should handle different coordinate formats', () => {
      const locationWithCoords = {
        coordinates: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };
      
      const formattedLocation = formatLocationForDirections(locationWithCoords);
      const googleUrl = generateGoogleMapsDirectionsUrl(formattedLocation);
      
      expect(formattedLocation).toBe('51.5074,-0.1278');
      expect(googleUrl).toContain('destination=51.5074%2C-0.1278');
    });
  });
});
