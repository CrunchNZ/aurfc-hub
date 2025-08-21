import { 
  sendMessage, 
  getMessages, 
  createChatRoom, 
  getUserChatRooms,
  initializeDefaultChatRooms 
} from '../src/services/chat';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  where
} from 'firebase/firestore';
import { db } from '../src/firebase';

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    collection.mockReturnValue('mockCollectionRef');
    addDoc.mockResolvedValue({ id: 'mockMessageId' });
    doc.mockReturnValue('mockDocRef');
    setDoc.mockResolvedValue();
    getDoc.mockResolvedValue({ 
      exists: () => false,
      data: () => ({})
    });
    updateDoc.mockResolvedValue();
    query.mockReturnValue('mockQuery');
    orderBy.mockReturnValue('mockOrderBy');
    limit.mockReturnValue('mockLimit');
    where.mockReturnValue('mockWhere');
    onSnapshot.mockReturnValue(() => {});
    arrayUnion.mockImplementation((...args) => args);
  });

  test('sendMessage adds enhanced message to Firestore', async () => {
    const user = { uid: 'user1', displayName: 'Test User' };
    const message = { text: 'Hello', userRole: 'player' };
    
    const result = await sendMessage('room1', message, user);
    
    expect(collection).toHaveBeenCalledWith(db, 'chats', 'room1', 'messages');
    expect(addDoc).toHaveBeenCalledWith('mockCollectionRef', {
      text: 'Hello',
      userId: 'user1',
      userName: 'Test User',
      userRole: 'player',
      timestamp: expect.any(Date),
      edited: false,
      editedAt: null
    });
    expect(result).toBe('mockMessageId');
  });

  test('getMessages sets up real-time listener with limit', () => {
    const callback = jest.fn();
    
    getMessages('room1', callback, 25);
    
    expect(collection).toHaveBeenCalledWith(db, 'chats', 'room1', 'messages');
    expect(query).toHaveBeenCalledWith('mockCollectionRef', 'mockOrderBy', 'mockLimit');
    expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
    expect(limit).toHaveBeenCalledWith(25);
    expect(onSnapshot).toHaveBeenCalledWith('mockQuery', expect.any(Function));
  });

  test('createChatRoom creates new room if not exists', async () => {
    const roomData = {
      name: 'Test Room',
      description: 'A test room',
      allowedRoles: ['player', 'coach']
    };
    
    const result = await createChatRoom('test-room', roomData);
    
    expect(doc).toHaveBeenCalledWith(db, 'chats', 'test-room');
    expect(getDoc).toHaveBeenCalledWith('mockDocRef');
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', {
      ...roomData,
      createdAt: expect.any(Date),
      lastActivity: expect.any(Date),
      messageCount: 0,
      isActive: true
    });
    expect(result).toBe('mockDocRef');
  });

  test('getUserChatRooms filters rooms by user role', () => {
    const callback = jest.fn();
    
    getUserChatRooms('player', callback);
    
    expect(collection).toHaveBeenCalledWith(db, 'chats');
    expect(query).toHaveBeenCalledWith('mockCollectionRef', 'mockWhere', 'mockWhere');
    expect(where).toHaveBeenCalledWith('allowedRoles', 'array-contains', 'player');
    expect(where).toHaveBeenCalledWith('isActive', '==', true);
    expect(onSnapshot).toHaveBeenCalledWith('mockQuery', expect.any(Function));
  });

  test('initializeDefaultChatRooms creates all default rooms', async () => {
    await initializeDefaultChatRooms();
    
    expect(setDoc).toHaveBeenCalledTimes(4); // 4 default rooms
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', expect.objectContaining({
      name: 'General Chat',
      allowedRoles: ['coach', 'player', 'junior', 'parent', 'admin']
    }));
  });
});