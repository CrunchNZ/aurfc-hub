import { sendMessage, getMessages } from '../src/services/chat';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../src/firebase';

jest.mock('../src/firebase', () => ({
  db: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

describe('Chat Service', () => {
  test('sendMessage adds message to Firestore', async () => {
    const mockRef = 'mockCollectionRef';
    collection.mockReturnValue(mockRef);
    addDoc.mockResolvedValue({ id: 'msg123' });
    const msgId = await sendMessage('chatRoom1', { text: 'Hello', userId: '123' });
    expect(collection).toHaveBeenCalledWith(db, 'chats', 'chatRoom1', 'messages');
    expect(addDoc).toHaveBeenCalledWith(mockRef, { text: 'Hello', userId: '123', timestamp: expect.any(Date) });
    expect(msgId).toBe('msg123');
  });

  test('getMessages subscribes to real-time updates', () => {
    const mockUnsubscribe = jest.fn();
    const mockRef = 'mockCollectionRef';
    const mockQuery = 'mockQuery';
    collection.mockReturnValue(mockRef);
    orderBy.mockReturnValue('mockOrderBy');
    query.mockReturnValue(mockQuery);
    onSnapshot.mockImplementation((q, callback) => {
      callback({ docs: [{ id: 'msg1', data: () => ({ text: 'Hi' }) }] });
      return mockUnsubscribe;
    });
    const callback = jest.fn();
    const unsubscribe = getMessages('chatRoom1', callback);
    expect(collection).toHaveBeenCalledWith(db, 'chats', 'chatRoom1', 'messages');
    expect(orderBy).toHaveBeenCalledWith('timestamp', 'asc');
    expect(query).toHaveBeenCalledWith(mockRef, 'mockOrderBy');
    expect(onSnapshot).toHaveBeenCalledWith(mockQuery, expect.any(Function));
    expect(callback).toHaveBeenCalledWith([{ id: 'msg1', text: 'Hi' }]);
    unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
}); 