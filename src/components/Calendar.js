import React, { useState } from 'react';
import { createEvent, rsvpEvent, trackAttendance } from '../services/scheduling';
import { auth } from '../firebase';

function Calendar() {
  const [eventData, setEventData] = useState('');
  const user = auth.currentUser;

  const handleCreateEvent = async () => {
    await createEvent('event1', JSON.parse(eventData));
  };

  const handleRSVP = async () => {
    await rsvpEvent('event1', user.uid);
  };

  const handleTrack = async () => {
    await trackAttendance('event1', { attended: [user.uid] });
  };

  return (
    <div>
      <h2>Calendar</h2>
      <textarea value={eventData} onChange={(e) => setEventData(e.target.value)} placeholder="Event JSON" />
      <button onClick={handleCreateEvent}>Create Event</button>
      <button onClick={handleRSVP}>RSVP</button>
      <button onClick={handleTrack}>Mark Attendance</button>
    </div>
  );
}

export default Calendar; 