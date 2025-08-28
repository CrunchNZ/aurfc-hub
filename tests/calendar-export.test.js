import { 
  generateICalEvent, 
  generateICalFile, 
  downloadICalFile,
  generateGoogleCalendarUrl,
  openGoogleCalendar,
  generateAppleCalendarDataUrl,
  downloadAppleCalendarFile,
  exportEvents,
  getOptimalDirectionsUrl,
  openOptimalDirections
} from '../src/services/calendar-export';

// Mock window.open for testing
global.window = {
  open: jest.fn()
};

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and appendChild
global.document = {
  createElement: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn()
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

describe('Calendar Export Service', () => {
  const mockEvent = {
    id: 'test-event-123',
    title: 'Test Rugby Match',
    description: 'Important match against rivals',
    date: { toDate: () => new Date('2024-01-15T14:00:00Z') },
    endTime: { toDate: () => new Date('2024-01-15T16:00:00Z') },
    location: 'AURFC Home Ground, 123 Rugby Lane'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iCal Export Functions', () => {
    test('generateICalEvent should create valid iCal event string', () => {
      const icalEvent = generateICalEvent(mockEvent);
      
      expect(icalEvent).toContain('BEGIN:VEVENT');
      expect(icalEvent).toContain('END:VEVENT');
      expect(icalEvent).toContain('UID:test-event-123@aurfc.com');
      expect(icalEvent).toContain('SUMMARY:Test Rugby Match');
      expect(icalEvent).toContain('DESCRIPTION:Important match against rivals');
      expect(icalEvent).toContain('LOCATION:AURFC Home Ground, 123 Rugby Lane');
      expect(icalEvent).toContain('STATUS:CONFIRMED');
    });

    test('generateICalEvent should handle events without endTime', () => {
      const eventWithoutEndTime = { ...mockEvent };
      delete eventWithoutEndTime.endTime;
      
      const icalEvent = generateICalEvent(eventWithoutEndTime);
      
      expect(icalEvent).toContain('DTSTART:');
      expect(icalEvent).toContain('DTEND:');
    });

    test('generateICalFile should create complete iCal file', () => {
      const icalFile = generateICalFile([mockEvent]);
      
      expect(icalFile).toContain('BEGIN:VCALENDAR');
      expect(icalFile).toContain('VERSION:2.0');
      expect(icalFile).toContain('PRODID:-//AURFC Hub//Calendar Export//EN');
      expect(icalFile).toContain('CALSCALE:GREGORIAN');
      expect(icalFile).toContain('METHOD:PUBLISH');
      expect(icalFile).toContain('END:VCALENDAR');
      expect(icalFile).toContain('BEGIN:VEVENT');
      expect(icalFile).toContain('END:VEVENT');
    });

    test('downloadICalFile should create and trigger download', () => {
      downloadICalFile([mockEvent], 'test-events.ics');
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Google Calendar Integration', () => {
    test('generateGoogleCalendarUrl should create valid Google Calendar URL', () => {
      const url = generateGoogleCalendarUrl(mockEvent);
      
      expect(url).toContain('https://calendar.google.com/calendar/render?');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain('text=Test%20Rugby%20Match');
      expect(url).toContain('details=Important%20match%20against%20rivals');
      expect(url).toContain('location=AURFC%20Home%20Ground%2C%20123%20Rugby%20Lane');
    });

    test('openGoogleCalendar should open URL in new tab', () => {
      openGoogleCalendar(mockEvent);
      
      expect(global.window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://calendar.google.com/calendar/render?'),
        '_blank'
      );
    });
  });

  describe('Apple Calendar Integration', () => {
    test('generateAppleCalendarDataUrl should create blob URL', () => {
      const dataUrl = generateAppleCalendarDataUrl(mockEvent);
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(dataUrl).toBe('mock-url');
    });

    test('downloadAppleCalendarFile should create and trigger download', () => {
      downloadAppleCalendarFile(mockEvent, 'test-event.ics');
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Bulk Export Functions', () => {
    const mockEvents = [
      mockEvent,
      {
        id: 'test-event-456',
        title: 'Training Session',
        description: 'Weekly training',
        date: { toDate: () => new Date('2024-01-16T18:00:00Z') },
        location: 'Training Field'
      }
    ];

    test('exportEvents should handle different periods correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Test week export
      exportEvents(mockEvents, 'week', 'ical');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // Test month export
      exportEvents(mockEvents, 'month', 'ical');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // Test all export
      exportEvents(mockEvents, 'all', 'ical');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('exportEvents should handle different formats correctly', () => {
      // Test iCal format
      exportEvents(mockEvents, 'all', 'ical');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // Test Google format
      exportEvents(mockEvents, 'all', 'google');
      expect(global.window.open).toHaveBeenCalled();
      
      // Test Apple format
      exportEvents(mockEvents, 'all', 'apple');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Date Handling', () => {
    test('should handle Firestore timestamp objects', () => {
      const firestoreEvent = {
        ...mockEvent,
        date: { toDate: () => new Date('2024-01-15T14:00:00Z') }
      };
      
      const icalEvent = generateICalEvent(firestoreEvent);
      expect(icalEvent).toContain('DTSTART:20240115T140000Z');
    });

    test('should handle regular Date objects', () => {
      const regularEvent = {
        ...mockEvent,
        date: new Date('2024-01-15T14:00:00Z')
      };
      
      const icalEvent = generateICalEvent(regularEvent);
      expect(icalEvent).toContain('DTSTART:20240115T140000Z');
    });
  });

  describe('Error Handling', () => {
    test('should handle events with missing optional fields', () => {
      const minimalEvent = {
        id: 'minimal-event',
        title: 'Minimal Event',
        date: new Date('2024-01-15T14:00:00Z')
      };
      
      const icalEvent = generateICalEvent(minimalEvent);
      
      expect(icalEvent).toContain('BEGIN:VEVENT');
      expect(icalEvent).toContain('END:VEVENT');
      expect(icalEvent).toContain('SUMMARY:Minimal Event');
      expect(icalEvent).toContain('DESCRIPTION:');
      expect(icalEvent).toContain('LOCATION:');
    });

    test('should handle events with special characters in description', () => {
      const specialCharEvent = {
        ...mockEvent,
        description: 'Event with\nnewlines and special chars: & < > "'
      };
      
      const icalEvent = generateICalEvent(specialCharEvent);
      
      expect(icalEvent).toContain('DESCRIPTION:Event with\\nnewlines and special chars: & < > "');
    });
  });
});

describe('Directions Service Integration', () => {
  // Mock the directions service functions
  const mockDirectionsService = {
    getOptimalDirectionsUrl: jest.fn(),
    openOptimalDirections: jest.fn()
  };

  test('should integrate with directions service', () => {
    // This test ensures the calendar export service can work with directions
    const eventWithLocation = {
      id: 'test-event',
      title: 'Test Event',
      location: 'AURFC Ground, 123 Rugby Lane',
      date: new Date('2024-01-15T14:00:00Z')
    };

    // Verify that events with locations can be processed
    const icalEvent = generateICalEvent(eventWithLocation);
    expect(icalEvent).toContain('LOCATION:AURFC Ground, 123 Rugby Lane');
  });
});
