// Calendar Export Service for AURFC Hub
// Handles exporting events to external calendar systems (iCal, Google Calendar)

// ============================================================================
// ICAL EXPORT
// ============================================================================

/**
 * Generate iCal content for an event
 * @param {Object} event - Event object from Firestore
 * @returns {string} iCal formatted string
 */
export const generateICalEvent = (event) => {
  const formatDate = (date) => {
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.date);
  const endDate = event.endTime ? formatDate(event.endTime) : startDate;
  
  const description = event.description || '';
  const location = event.location || '';
  
  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@aurfc.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT'
  ].join('\r\n');
};

/**
 * Generate complete iCal file content
 * @param {Array} events - Array of event objects
 * @returns {string} Complete iCal file content
 */
export const generateICalFile = (events) => {
  const calendarHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AURFC Hub//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');

  const calendarFooter = 'END:VCALENDAR';
  
  const eventContent = events.map(generateICalEvent).join('\r\n');
  
  return `${calendarHeader}\r\n${eventContent}\r\n${calendarFooter}`;
};

/**
 * Download iCal file
 * @param {Array} events - Array of event objects
 * @param {string} filename - Filename for download
 */
export const downloadICalFile = (events, filename = 'aurfc-events.ics') => {
  const icalContent = generateICalFile(events);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// GOOGLE CALENDAR INTEGRATION
// ============================================================================

/**
 * Generate Google Calendar URL for an event
 * @param {Object} event - Event object from Firestore
 * @returns {string} Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event) => {
  const formatDate = (date) => {
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.date);
  const endDate = event.endTime ? formatDate(event.endTime) : startDate;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Open Google Calendar in new tab
 * @param {Object} event - Event object from Firestore
 */
export const openGoogleCalendar = (event) => {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank');
};

// ============================================================================
// APPLE CALENDAR INTEGRATION
// ============================================================================

/**
 * Generate Apple Calendar data URL for an event
 * @param {Object} event - Event object from Firestore
 * @returns {string} Apple Calendar data URL
 */
export const generateAppleCalendarDataUrl = (event) => {
  const icalContent = generateICalEvent(event);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
};

/**
 * Download Apple Calendar file
 * @param {Object} event - Event object from Firestore
 * @param {string} filename - Filename for download
 */
export const downloadAppleCalendarFile = (event, filename = 'aurfc-event.ics') => {
  const icalContent = generateICalEvent(event);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// BULK EXPORT UTILITIES
// ============================================================================

/**
 * Export all events for a specific time period
 * @param {Array} events - Array of event objects
 * @param {string} period - Export period ('week', 'month', 'all')
 * @param {string} format - Export format ('ical', 'google', 'apple')
 */
export const exportEvents = (events, period = 'all', format = 'ical') => {
  let filteredEvents = events;
  
  // Filter events by period
  if (period === 'week') {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    filteredEvents = events.filter(event => {
      const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
      return eventDate <= weekFromNow;
    });
  } else if (period === 'month') {
    const monthFromNow = new Date();
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    filteredEvents = events.filter(event => {
      const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
      return eventDate <= monthFromNow;
    });
  }
  
  // Export based on format
  switch (format) {
    case 'ical':
      downloadICalFile(filteredEvents, `aurfc-events-${period}.ics`);
      break;
    case 'google':
      // For Google Calendar, we'll open the first event and let user add others manually
      if (filteredEvents.length > 0) {
        openGoogleCalendar(filteredEvents[0]);
      }
      break;
    case 'apple':
      if (filteredEvents.length === 1) {
        downloadAppleCalendarFile(filteredEvents[0]);
      } else {
        downloadICalFile(filteredEvents, `aurfc-events-${period}.ics`);
      }
      break;
    default:
      downloadICalFile(filteredEvents, `aurfc-events-${period}.ics`);
  }
};
