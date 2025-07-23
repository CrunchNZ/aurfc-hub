import { createRoster, trackPerformance, createDrill } from '../src/services/team';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

jest.mock('../src/firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe('Team Service', () => {
  test('createRoster sets team data in Firestore', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    setDoc.mockResolvedValue();
    await createRoster('team1', { name: 'Team A' });
    expect(doc).toHaveBeenCalledWith(db, 'teams', 'team1');
    expect(setDoc).toHaveBeenCalledWith(mockRef, { name: 'Team A' });
  });

  test('trackPerformance updates performance data', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    updateDoc.mockResolvedValue();
    await trackPerformance('player1', { stats: { goals: 5 } });
    expect(doc).toHaveBeenCalledWith(db, 'performances', 'player1');
    expect(updateDoc).toHaveBeenCalledWith(mockRef, { stats: { goals: 5 } });
  });

  test('createDrill adds drill to Firestore', async () => {
    const mockRef = 'mockDocRef';
    doc.mockReturnValue(mockRef);
    setDoc.mockResolvedValue();
    await createDrill('drill1', { description: 'Drill desc' });
    expect(doc).toHaveBeenCalledWith(db, 'drills', 'drill1');
    expect(setDoc).toHaveBeenCalledWith(mockRef, { description: 'Drill desc' });
  });
}); 