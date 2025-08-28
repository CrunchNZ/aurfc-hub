// GameDay Service Tests
// Comprehensive testing for match management, statistics tracking, and real-time updates

import {
  createMatch,
  getMatch,
  updateMatchStatus,
  getTeamMatches,
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  endPeriod,
  recordSubstitution,
  recordEvent,
  togglePossession,
  toggleTerritory,
  calculateMatchDuration,
  formatMatchTime,
  getCurrentPeriodDescription,
  MATCH_STATUS,
  PERIODS,
  TIMER_STATES,
  EVENT_TYPES,
  SUBSTITUTION_REASONS
} from '../src/services/gameday';

// Mock Firebase
jest.mock('../src/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn()
  }
}));

// Mock Firestore functions
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockServerTimestamp = jest.fn();
const mockArrayUnion = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  getDocs: mockGetDocs,
  collection: jest.fn(),
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  serverTimestamp: mockServerTimestamp,
  arrayUnion: mockArrayUnion,
  onSnapshot: mockOnSnapshot
}));

describe('GameDay Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServerTimestamp.mockReturnValue(new Date());
    mockArrayUnion.mockReturnValue([]);
  });

  describe('Constants', () => {
    test('should export all required constants', () => {
      expect(MATCH_STATUS).toBeDefined();
      expect(PERIODS).toBeDefined();
      expect(TIMER_STATES).toBeDefined();
      expect(EVENT_TYPES).toBeDefined();
      expect(SUBSTITUTION_REASONS).toBeDefined();
    });

    test('should have correct match status values', () => {
      expect(MATCH_STATUS.SCHEDULED).toBe('scheduled');
      expect(MATCH_STATUS.IN_PROGRESS).toBe('in_progress');
      expect(MATCH_STATUS.HALF_TIME).toBe('half_time');
      expect(MATCH_STATUS.COMPLETED).toBe('completed');
      expect(MATCH_STATUS.CANCELLED).toBe('cancelled');
    });

    test('should have correct timer states', () => {
      expect(TIMER_STATES.STOPPED).toBe('stopped');
      expect(TIMER_STATES.RUNNING).toBe('running');
      expect(TIMER_STATES.PAUSED).toBe('paused');
      expect(TIMER_STATES.HALF_TIME).toBe('half_time');
    });
  });

  describe('createMatch', () => {
    test('should create a new match successfully', async () => {
      const matchData = {
        teamId: 'team-123',
        teamName: 'Test Team',
        opponent: 'Opponent Team',
        createdBy: 'user-123'
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockSetDoc.mockResolvedValue();

      const result = await createMatch(matchData);

      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
        teamId: 'team-123',
        teamName: 'Test Team',
        opponent: 'Opponent Team',
        status: MATCH_STATUS.SCHEDULED,
        currentPeriod: 1
      }));

      expect(result).toHaveProperty('id');
      expect(result.teamId).toBe('team-123');
    });

    test('should handle errors during match creation', async () => {
      const matchData = {
        teamId: 'team-123',
        teamName: 'Test Team',
        opponent: 'Opponent Team',
        createdBy: 'user-123'
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockSetDoc.mockRejectedValue(new Error('Database error'));

      await expect(createMatch(matchData)).rejects.toThrow('Failed to create match: Database error');
    });
  });

  describe('getMatch', () => {
    test('should retrieve a match successfully', async () => {
      const mockMatchData = {
        id: 'match-123',
        teamId: 'team-123',
        teamName: 'Test Team',
        opponent: 'Opponent Team'
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockMatchData
      });

      const result = await getMatch('match-123');

      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(result).toEqual(mockMatchData);
    });

    test('should return null for non-existent match', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });

      const result = await getMatch('match-123');

      expect(result).toBeNull();
    });

    test('should handle errors during match retrieval', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      await expect(getMatch('match-123')).rejects.toThrow('Failed to get match: Database error');
    });
  });

  describe('updateMatchStatus', () => {
    test('should update match status successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      await updateMatchStatus('match-123', MATCH_STATUS.IN_PROGRESS);

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        status: MATCH_STATUS.IN_PROGRESS,
        updatedAt: expect.any(Date)
      });
    });

    test('should handle errors during status update', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockRejectedValue(new Error('Database error'));

      await expect(updateMatchStatus('match-123', MATCH_STATUS.IN_PROGRESS))
        .rejects.toThrow('Failed to update match status: Database error');
    });
  });

  describe('Timer Management', () => {
    test('should start match timer successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      await startMatchTimer('match-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        'matchTimer.startTime': expect.any(Date),
        'matchTimer.state': TIMER_STATES.RUNNING,
        'matchTimer.pausedTime': null,
        updatedAt: expect.any(Date)
      });
    });

    test('should pause match timer successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      await pauseMatchTimer('match-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        'matchTimer.state': TIMER_STATES.PAUSED,
        'matchTimer.pausedTime': expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('should resume match timer successfully', async () => {
      const mockMatch = {
        matchTimer: {
          pausedTime: new Date(Date.now() - 60000) // 1 minute ago
        }
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockMatch
      });
      mockUpdateDoc.mockResolvedValue();

      await resumeMatchTimer('match-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        'matchTimer.state': TIMER_STATES.RUNNING,
        'matchTimer.pausedTime': null,
        'matchTimer.totalPaused': expect.any(Number),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('Statistics Tracking', () => {
    test('should record event successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      await recordEvent('match-123', EVENT_TYPES.TRY, {
        team: 'team',
        period: 1
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        events: [],
        'statistics.tries.team': 1,
        updatedAt: expect.any(Date)
      });
    });

    test('should toggle possession successfully', async () => {
      const mockMatch = {
        statistics: {
          possession: { team: 0, opponent: 0 }
        }
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockMatch
      });
      mockUpdateDoc.mockResolvedValue();

      await togglePossession('match-123', 'team');

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    test('should toggle territory successfully', async () => {
      const mockMatch = {
        statistics: {
          territory: { team: 0, opponent: 0 }
        }
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockMatch
      });
      mockUpdateDoc.mockResolvedValue();

      await toggleTerritory('match-123', 'team');

      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('Player Management', () => {
    test('should record substitution successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      const substitutionData = {
        type: 'on',
        playerId: 'player-123',
        playerName: 'John Smith',
        position: 1,
        reason: SUBSTITUTION_REASONS.TACTICAL
      };

      await recordSubstitution('match-123', substitutionData);

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        substitutions: [],
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('Utility Functions', () => {
    test('should format match time correctly', () => {
      const milliseconds = 125000; // 2 minutes 5 seconds
      const formatted = formatMatchTime(milliseconds);
      expect(formatted).toBe('02:05');
    });

    test('should format zero time correctly', () => {
      const formatted = formatMatchTime(0);
      expect(formatted).toBe('00:00');
    });

    test('should get correct period description', () => {
      const match1 = { currentPeriod: 1 };
      const match2 = { currentPeriod: 'half_time' };
      const match3 = { currentPeriod: 2 };

      expect(getCurrentPeriodDescription(match1)).toBe('1st Half');
      expect(getCurrentPeriodDescription(match2)).toBe('Half Time');
      expect(getCurrentPeriodDescription(match3)).toBe('2nd Half');
    });

    test('should calculate match duration correctly', () => {
      const match = {
        matchTimer: {
          startTime: { toDate: () => new Date(Date.now() - 120000) }, // 2 minutes ago
          totalPaused: 0
        }
      };

      const duration = calculateMatchDuration(match);
      expect(duration).toBeGreaterThan(100000); // Should be around 2 minutes
    });
  });

  describe('Real-time Updates', () => {
    test('should set up match listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockDoc.mockReturnValue('mock-doc-ref');
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = listenToMatch('match-123', mockCallback);

      expect(mockOnSnapshot).toHaveBeenCalledWith('mock-doc-ref', expect.any(Function));
      expect(typeof unsubscribe).toBe('function');
    });

    test('should set up team matches listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockQuery.mockReturnValue('mock-query');
      mockWhere.mockReturnValue('mock-where');
      mockOrderBy.mockReturnValue('mock-order-by');
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = listenToTeamMatches('team-123', mockCallback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
