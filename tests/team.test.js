// Team Service Tests for AURFC Hub

import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  toggleTeamStatus,
  getTeamsByAgeGroup,
  getActiveTeams,
  getTeamsForDropdown
} from '../src/services/team';

// Mock Firebase Firestore
jest.mock('../src/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockOrderBy = jest.fn();
const mockServerTimestamp = jest.fn(() => new Date());

jest.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  collection: mockCollection,
  query: mockQuery,
  orderBy: mockOrderBy,
  serverTimestamp: mockServerTimestamp
}));

describe('Team Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a new team successfully', async () => {
      const teamData = {
        name: 'Test Team',
        ageGroup: 'Under 12',
        type: 'open',
        createdBy: 'user123'
      };

      const mockTeamId = 'team-123';
      mockDoc.mockReturnValue('doc-ref');
      mockSetDoc.mockResolvedValue();

      const result = await createTeam(teamData);

      expect(mockSetDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
        id: mockTeamId,
        name: teamData.name,
        ageGroup: teamData.ageGroup,
        type: teamData.type,
        isActive: true
      }));
      expect(result).toHaveProperty('id', mockTeamId);
    });

    it('should handle errors when creating team', async () => {
      const teamData = { name: 'Test Team', ageGroup: 'Under 12', type: 'open', createdBy: 'user123' };
      const error = new Error('Firestore error');
      
      mockDoc.mockReturnValue('doc-ref');
      mockSetDoc.mockRejectedValue(error);

      await expect(createTeam(teamData)).rejects.toThrow('Failed to create team: Firestore error');
    });
  });

  describe('getAllTeams', () => {
    it('should retrieve all teams successfully', async () => {
      const mockTeams = [
        { id: 'team1', name: 'Team 1', ageGroup: 'Under 12' },
        { id: 'team2', name: 'Team 2', ageGroup: 'Under 14' }
      ];

      mockCollection.mockReturnValue('collection-ref');
      mockQuery.mockReturnValue('query-ref');
      mockOrderBy.mockReturnValue('ordered-query');
      mockGetDocs.mockResolvedValue({
        forEach: (callback) => mockTeams.forEach(callback)
      });

      const result = await getAllTeams();

      expect(result).toEqual(mockTeams);
      expect(mockCollection).toHaveBeenCalledWith({}, 'teams');
      expect(mockOrderBy).toHaveBeenCalledWith('ordered-query', 'ageGroup', 'asc');
    });
  });

  describe('getTeamById', () => {
    it('should retrieve a team by ID successfully', async () => {
      const mockTeam = { id: 'team123', name: 'Test Team' };
      
      mockDoc.mockReturnValue('doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockTeam
      });

      const result = await getTeamById('team123');

      expect(result).toEqual({ id: 'team123', ...mockTeam });
      expect(mockDoc).toHaveBeenCalledWith({}, 'teams', 'team123');
    });

    it('should return null for non-existent team', async () => {
      mockDoc.mockReturnValue('doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getTeamById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateTeam', () => {
    it('should update a team successfully', async () => {
      const updates = { name: 'Updated Team Name' };
      const mockUpdatedTeam = { id: 'team123', name: 'Updated Team Name' };

      mockDoc.mockReturnValue('doc-ref');
      mockUpdateDoc.mockResolvedValue();
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUpdatedTeam
      });

      const result = await updateTeam('team123', updates);

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        ...updates,
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual({ id: 'team123', ...mockUpdatedTeam });
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team successfully', async () => {
      mockDoc.mockReturnValue('doc-ref');
      mockDeleteDoc.mockResolvedValue();

      await deleteTeam('team123');

      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });
  });

  describe('toggleTeamStatus', () => {
    it('should toggle team status successfully', async () => {
      const mockTeam = { id: 'team123', isActive: true };
      const mockUpdatedTeam = { id: 'team123', isActive: false };

      mockDoc.mockReturnValue('doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUpdatedTeam
      });
      mockUpdateDoc.mockResolvedValue();

      const result = await toggleTeamStatus('team123');

      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        isActive: false,
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual({ id: 'team123', isActive: false });
    });
  });

  describe('getTeamsByAgeGroup', () => {
    it('should filter teams by age group', async () => {
      const mockTeams = [
        { id: 'team1', ageGroup: 'Under 12', isActive: true },
        { id: 'team2', ageGroup: 'Under 14', isActive: true },
        { id: 'team3', ageGroup: 'Under 12', isActive: false }
      ];

      jest.spyOn(require('../src/services/team'), 'getAllTeams').mockResolvedValue(mockTeams);

      const result = await getTeamsByAgeGroup('Under 12');

      expect(result).toHaveLength(1);
      expect(result[0].ageGroup).toBe('Under 12');
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('getActiveTeams', () => {
    it('should return only active teams', async () => {
      const mockTeams = [
        { id: 'team1', isActive: true },
        { id: 'team2', isActive: false },
        { id: 'team3', isActive: true }
      ];

      jest.spyOn(require('../src/services/team'), 'getAllTeams').mockResolvedValue(mockTeams);

      const result = await getActiveTeams();

      expect(result).toHaveLength(2);
      expect(result.every(team => team.isActive)).toBe(true);
    });
  });

  describe('getTeamsForDropdown', () => {
    it('should format teams for dropdown', async () => {
      const mockTeams = [
        { id: 'team1', name: 'Team 1', ageGroup: 'Under 12', type: 'open', isActive: true },
        { id: 'team2', name: 'Team 2', ageGroup: 'Under 14', type: 'restricted', isActive: true }
      ];

      jest.spyOn(require('../src/services/team'), 'getActiveTeams').mockResolvedValue(mockTeams);

      const result = await getTeamsForDropdown();

      expect(result).toEqual([
        { value: 'team1', label: 'Team 1', ageGroup: 'Under 12', type: 'open' },
        { value: 'team2', label: 'Team 2', ageGroup: 'Under 14', type: 'restricted' }
      ]);
    });
  });
}); 