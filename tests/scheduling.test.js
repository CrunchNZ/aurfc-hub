import { createEvent, rsvpEvent, trackAttendance } from '../src/services/scheduling';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

jest.mock('../src/firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
}));

describe('Scheduling Service', () => {
  test('createEvent sets event data', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    setDoc.mockResolvedValue();
    await createEvent('event1', { title: 'Training' });
    expect(doc).toHaveBeenCalledWith(db, 'events', 'event1');
    expect(setDoc).toHaveBeenCalledWith(mockRef, { title: 'Training' });
  });

  test('rsvpEvent adds user to RSVPs', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    arrayUnion.mockReturnValue('mockUnion');
    updateDoc.mockResolvedValue();
    await rsvpEvent('event1', 'user123');
    expect(doc).toHaveBeenCalledWith(db, 'events', 'event1');
    expect(updateDoc).toHaveBeenCalledWith(mockRef, { rsvps: 'mockUnion' });
  });

  test('trackAttendance updates attendance', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    updateDoc.mockResolvedValue();
    await trackAttendance('event1', { attended: ['user123'] });
    expect(doc).toHaveBeenCalledWith(db, 'events', 'event1');
    expect(updateDoc).toHaveBeenCalledWith(mockRef, { attended: ['user123'] });
  });
}); 