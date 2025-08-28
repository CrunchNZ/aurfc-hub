import {
  createParentAccount,
  getParentAccount,
  updateParentAccount,
  addChildToParent,
  removeChildFromParent,
  updateChildPermissions,
  getFamilyOverview,
  getFamilyCalendarEvents,
  updateFamilyNotifications,
  getFamilyNotificationPreferences,
  addEmergencyContact,
  removeEmergencyContact,
  isUserParent,
  getAllParents
} from '../src/services/parent';

// Mock Firebase services
jest.mock('../src/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockGetDocs = jest.fn();
const mockServerTimestamp = jest.fn(() => 'mock-timestamp');
const mockArrayUnion = jest.fn((item) => item);
const mockArrayRemove = jest.fn((item) => item);

jest.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  getDocs: mockGetDocs,
  serverTimestamp: mockServerTimestamp,
  arrayUnion: mockArrayUnion,
  arrayRemove: mockArrayRemove
}));

describe('Parent Service', () => {
  const mockParentId = 'parent-123';
  const mockChildId = 'child-456';
  const mockParentData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890'
  };
  const mockChildData = {
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'junior',
    dateOfBirth: { toDate: () => new Date('2010-01-01') },
    teamPreference: 'Under 16'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue('mock-doc-ref');
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockParentData
    });
    mockSetDoc.mockResolvedValue();
    mockUpdateDoc.mockResolvedValue();
  });

  describe('Parent Account Management', () => {
    test('createParentAccount should create parent account with default settings', async () => {
      const result = await createParentAccount(mockParentId, mockParentData);

      expect(mockDoc).toHaveBeenCalledWith({}, 'parents', mockParentId);
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        ...mockParentData,
        children: [],
        familySettings: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            showFamilyInfo: true,
            allowChildContact: false
          },
          calendar: {
            syncWithPersonal: true,
            defaultReminders: [60, 1440]
          }
        },
        emergencyContacts: [],
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
      expect(result).toEqual({
        id: mockParentId,
        ...mockParentData,
        children: [],
        familySettings: expect.any(Object),
        emergencyContacts: [],
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });

    test('getParentAccount should return parent data when exists', async () => {
      const result = await getParentAccount(mockParentId);

      expect(mockDoc).toHaveBeenCalledWith({}, 'parents', mockParentId);
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(result).toEqual({
        id: mockParentId,
        ...mockParentData
      });
    });

    test('getParentAccount should return null when parent does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getParentAccount(mockParentId);

      expect(result).toBeNull();
    });

    test('updateParentAccount should update parent data with timestamp', async () => {
      const updates = { phone: '+0987654321' };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockParentData, ...updates })
      });

      const result = await updateParentAccount(mockParentId, updates);

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        ...updates,
        updatedAt: 'mock-timestamp'
      });
      expect(result).toEqual({
        id: mockParentId,
        ...mockParentData,
        ...updates
      });
    });
  });

  describe('Child Management', () => {
    beforeEach(() => {
      mockDoc.mockImplementation((db, collection, id) => {
        if (collection === 'users') {
          return `user-doc-${id}`;
        }
        return `doc-${id}`;
      });
    });

    test('addChildToParent should add child to parent account', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockChildData
      });

      const childData = { relationship: 'child' };
      await addChildToParent(mockParentId, mockChildId, childData);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        children: expect.arrayContaining([
          expect.objectContaining({
            childId: mockChildId,
            firstName: mockChildData.firstName,
            lastName: mockChildData.lastName,
            relationship: 'child'
          })
        ])
      });
    });

    test('addChildToParent should throw error if child does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(addChildToParent(mockParentId, mockChildId, {}))
        .rejects.toThrow('Child user not found');
    });

    test('addChildToParent should throw error if user is not a junior', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockChildData, role: 'player' })
      });

      await expect(addChildToParent(mockParentId, mockChildId, {}))
        .rejects.toThrow('User is not a junior player');
    });

    test('removeChildFromParent should remove child from parent account', async () => {
      const existingChildren = [
        { childId: 'child-123', firstName: 'Child 1' },
        { childId: mockChildId, firstName: 'Child 2' }
      ];

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockParentData, children: existingChildren })
      });

      await removeChildFromParent(mockParentId, mockChildId);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        children: [{ childId: 'child-123', firstName: 'Child 1' }],
        updatedAt: 'mock-timestamp'
      });
    });

    test('updateChildPermissions should update child permissions', async () => {
      const existingChildren = [
        {
          childId: mockChildId,
          permissions: {
            viewSchedule: true,
            viewPerformance: false
          }
        }
      ];

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockParentData, children: existingChildren })
      });

      const newPermissions = { viewPerformance: true };
      await updateChildPermissions(mockParentId, mockChildId, newPermissions);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        children: [
          {
            childId: mockChildId,
            permissions: {
              viewSchedule: true,
              viewPerformance: true
            }
          }
        ],
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('Family Overview & Coordination', () => {
    test('getFamilyOverview should return family overview data', async () => {
      const mockParentWithChildren = {
        ...mockParentData,
        children: [
          {
            childId: mockChildId,
            firstName: 'Jane',
            lastName: 'Doe',
            relationship: 'child'
          }
        ],
        familySettings: { notifications: { email: true } },
        emergencyContacts: []
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockParentWithChildren
      });

      const result = await getFamilyOverview(mockParentId);

      expect(result).toEqual({
        children: expect.arrayContaining([
          expect.objectContaining({
            childId: mockChildId,
            firstName: 'Jane',
            lastName: 'Doe',
            relationship: 'child'
          })
        ]),
        familySettings: { notifications: { email: true } },
        emergencyContacts: []
      });
    });

    test('getFamilyOverview should return empty data when no children', async () => {
      const mockParentWithoutChildren = {
        ...mockParentData,
        children: [],
        familySettings: {},
        emergencyContacts: []
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockParentWithoutChildren
      });

      const result = await getFamilyOverview(mockParentId);

      expect(result).toEqual({
        children: [],
        familySettings: {},
        emergencyContacts: []
      });
    });

    test('getFamilyCalendarEvents should query events for family', async () => {
      const mockEvents = [
        { id: 'event-1', title: 'Training' },
        { id: 'event-2', title: 'Match' }
      ];

      mockCollection.mockReturnValue('events-collection');
      mockQuery.mockReturnValue('query-result');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('order-result');
      mockGetDocs.mockResolvedValue({
        docs: mockEvents.map(event => ({
          id: event.id,
          data: () => event
        }))
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await getFamilyCalendarEvents(mockParentId, startDate, endDate);

      expect(mockCollection).toHaveBeenCalledWith({}, 'events');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('targetRoles', 'array-contains-any', ['junior', 'all']);
      expect(result).toEqual(mockEvents);
    });
  });

  describe('Notification Management', () => {
    test('updateFamilyNotifications should update notification settings', async () => {
      const newSettings = { email: false, push: true, sms: true };
      await updateFamilyNotifications(mockParentId, newSettings);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        'familySettings.notifications': newSettings,
        updatedAt: 'mock-timestamp'
      });
    });

    test('getFamilyNotificationPreferences should return notification preferences', async () => {
      const mockParentWithNotifications = {
        familySettings: {
          notifications: {
            email: true,
            push: false,
            sms: true
          }
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockParentWithNotifications
      });

      const result = await getFamilyNotificationPreferences(mockParentId);

      expect(result).toEqual({
        email: true,
        push: false,
        sms: true
      });
    });

    test('getFamilyNotificationPreferences should return defaults when not set', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({})
      });

      const result = await getFamilyNotificationPreferences(mockParentId);

      expect(result).toEqual({
        email: true,
        push: true,
        sms: false
      });
    });
  });

  describe('Emergency Contacts', () => {
    test('addEmergencyContact should add emergency contact', async () => {
      const contactData = {
        name: 'Emergency Contact',
        phone: '+1234567890',
        relationship: 'Parent'
      };

      await addEmergencyContact(mockParentId, contactData);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        emergencyContacts: expect.arrayContaining([
          expect.objectContaining({
            ...contactData,
            id: expect.any(String),
            addedAt: 'mock-timestamp'
          })
        ])
      });
    });

    test('removeEmergencyContact should remove emergency contact', async () => {
      const existingContacts = [
        { id: 'contact-1', name: 'Contact 1' },
        { id: 'contact-2', name: 'Contact 2' }
      ];

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockParentData, emergencyContacts: existingContacts })
      });

      await removeEmergencyContact(mockParentId, 'contact-1');

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-parent-123', {
        emergencyContacts: [{ id: 'contact-2', name: 'Contact 2' }],
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('Utility Functions', () => {
    test('isUserParent should return true for existing parent', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockParentData
      });

      const result = await isUserParent(mockParentId);

      expect(result).toBe(true);
    });

    test('isUserParent should return false for non-parent user', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await isUserParent(mockParentId);

      expect(result).toBe(false);
    });

    test('getAllParents should return all parent accounts', async () => {
      const mockParents = [
        { id: 'parent-1', firstName: 'Parent 1' },
        { id: 'parent-2', firstName: 'Parent 2' }
      ];

      mockCollection.mockReturnValue('parents-collection');
      mockGetDocs.mockResolvedValue({
        docs: mockParents.map(parent => ({
          id: parent.id,
          data: () => parent
        }))
      });

      const result = await getAllParents();

      expect(mockCollection).toHaveBeenCalledWith({}, 'parents');
      expect(result).toEqual(mockParents);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockSetDoc.mockRejectedValue(new Error('Database error'));

      await expect(createParentAccount(mockParentId, mockParentData))
        .rejects.toThrow('Database error');
    });

    test('should handle missing parent data gracefully', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getParentAccount(mockParentId);
      expect(result).toBeNull();
    });
  });

  describe('Data Validation', () => {
    test('should validate child role before adding to parent', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockChildData, role: 'admin' })
      });

      await expect(addChildToParent(mockParentId, mockChildId, {}))
        .rejects.toThrow('User is not a junior player');
    });

    test('should handle missing child data gracefully', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => null
      });

      const result = await getFamilyOverview(mockParentId);
      expect(result.children).toEqual([]);
    });
  });
});
