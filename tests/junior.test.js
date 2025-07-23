import { uploadContent, awardBadge, getParentDashboard } from '../src/services/junior';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

jest.mock('../src/firebase', () => ({
  db: jest.fn(),
  storage: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
}));

describe('Junior Service', () => {
  test('uploadContent uploads file and updates doc', async () => {
    const mockRef = 'mockStorageRef';
    const mockDocRef = 'mockDocRef';
    ref.mockReturnValue(mockRef);
    doc.mockReturnValue(mockDocRef);
    uploadBytes.mockResolvedValue();
    updateDoc.mockResolvedValue();
    await uploadContent('junior1', 'file.txt', 'content');
    expect(ref).toHaveBeenCalledWith(storage, 'juniors/junior1/file.txt');
    expect(uploadBytes).toHaveBeenCalledWith(mockRef, 'content');
    expect(doc).toHaveBeenCalledWith(db, 'juniors', 'junior1');
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { content: expect.any(String) });
  });

  test('awardBadge updates badges', async () => {
    const mockDocRef = 'mockDocRef';
    doc.mockReturnValue(mockDocRef);
    updateDoc.mockResolvedValue();
    await awardBadge('junior1', 'badge1');
    expect(doc).toHaveBeenCalledWith(db, 'badges', 'junior1');
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { badges: expect.any(Array) });
  });

  test('getParentDashboard fetches data', async () => {
    const mockDocRef = 'mockDocRef';
    doc.mockReturnValue(mockDocRef);
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ notes: 'Note' }) });
    const data = await getParentDashboard('junior1');
    expect(doc).toHaveBeenCalledWith(db, 'juniors', 'junior1');
    expect(data).toEqual({ notes: 'Note' });
  });
}); 