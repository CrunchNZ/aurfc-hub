import { uploadContent, awardBadge, getParentDashboard } from '../src/services/junior';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

jest.mock('../src/firebase', () => ({
  db: jest.fn(),
  storage: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  arrayUnion: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

describe('Junior Service', () => {
  test('uploadContent uploads file and updates doc', async () => {
    const mockStorageRef = 'mockStorageRef';
    const mockDocRef = 'mockDocRef';
    ref.mockReturnValue(mockStorageRef);
    doc.mockReturnValue(mockDocRef);
    uploadBytes.mockResolvedValue();
    getDownloadURL.mockResolvedValue('mockUrl');
    updateDoc.mockResolvedValue();
    await uploadContent('junior1', 'file.txt', 'content');
    expect(ref).toHaveBeenCalledWith(storage, 'juniors/junior1/file.txt');
    expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, 'content');
    expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
    expect(doc).toHaveBeenCalledWith(db, 'juniors', 'junior1');
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { content: 'mockUrl' });
  });

  test('awardBadge updates badges', async () => {
    const mockDocRef = 'mockDocRef';
    const mockUnion = 'mockUnion';
    doc.mockReturnValue(mockDocRef);
    arrayUnion.mockReturnValue(mockUnion);
    updateDoc.mockResolvedValue();
    await awardBadge('junior1', 'badge1');
    expect(doc).toHaveBeenCalledWith(db, 'badges', 'junior1');
    expect(arrayUnion).toHaveBeenCalledWith('badge1');
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { badges: mockUnion });
  });

  test('getParentDashboard fetches data', async () => {
    const mockDocRef = 'mockDocRef';
    doc.mockReturnValue(mockDocRef);
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ notes: 'Note' }) });
    const data = await getParentDashboard('junior1');
    expect(doc).toHaveBeenCalledWith(db, 'juniors', 'junior1');
    expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    expect(data).toEqual({ notes: 'Note' });
  });
}); 