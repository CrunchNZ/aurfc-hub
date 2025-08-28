// Rugby Positions Service Tests for AURFC Hub

import {
  RUGBY_POSITIONS,
  getAllPositionNames,
  getPositionsByCategory,
  getForwardPositions,
  getBackPositions,
  getPositionInfo,
  getPositionDescription,
  getPositionSkills,
  getPositionNumber,
  isForwardPosition,
  isBackPosition,
  validatePositionCombination
} from '../src/services/rugby-positions';

describe('Rugby Positions Service', () => {
  describe('RUGBY_POSITIONS constant', () => {
    it('should contain all expected positions', () => {
      const expectedPositions = [
        'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8',
        'Half-Back', '1st-Five', '2nd-Five', 'Centre', 'Wing', 'Fullback'
      ];
      
      expect(Object.keys(RUGBY_POSITIONS)).toEqual(expect.arrayContaining(expectedPositions));
      expect(Object.keys(RUGBY_POSITIONS)).toHaveLength(11);
    });

    it('should have correct structure for each position', () => {
      Object.entries(RUGBY_POSITIONS).forEach(([name, info]) => {
        expect(info).toHaveProperty('category');
        expect(info).toHaveProperty('description');
        expect(info).toHaveProperty('skills');
        expect(info).toHaveProperty('number');
        
        expect(['Forward', 'Back']).toContain(info.category);
        expect(typeof info.description).toBe('string');
        expect(Array.isArray(info.skills)).toBe(true);
        expect(typeof info.number).toBe('string');
      });
    });
  });

  describe('getAllPositionNames', () => {
    it('should return all position names', () => {
      const result = getAllPositionNames();
      expect(result).toHaveLength(11);
      expect(result).toEqual(Object.keys(RUGBY_POSITIONS));
    });
  });

  describe('getPositionsByCategory', () => {
    it('should return forward positions', () => {
      const result = getPositionsByCategory('Forward');
      expect(result).toEqual(['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8']);
    });

    it('should return back positions', () => {
      const result = getPositionsByCategory('Back');
      expect(result).toEqual(['Half-Back', '1st-Five', '2nd-Five', 'Centre', 'Wing', 'Fullback']);
    });

    it('should return empty array for invalid category', () => {
      const result = getPositionsByCategory('Invalid');
      expect(result).toEqual([]);
    });
  });

  describe('getForwardPositions', () => {
    it('should return all forward positions', () => {
      const result = getForwardPositions();
      expect(result).toEqual(['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8']);
    });
  });

  describe('getBackPositions', () => {
    it('should return all back positions', () => {
      const result = getBackPositions();
      expect(result).toEqual(['Half-Back', '1st-Five', '2nd-Five', 'Centre', 'Wing', 'Fullback']);
    });
  });

  describe('getPositionInfo', () => {
    it('should return position info for valid position', () => {
      const result = getPositionInfo('Prop');
      expect(result).toEqual(RUGBY_POSITIONS['Prop']);
    });

    it('should return null for invalid position', () => {
      const result = getPositionInfo('InvalidPosition');
      expect(result).toBeNull();
    });
  });

  describe('getPositionDescription', () => {
    it('should return description for valid position', () => {
      const result = getPositionDescription('Hooker');
      expect(result).toBe('Front row forward, throws into lineouts and hooks in scrums');
    });

    it('should return empty string for invalid position', () => {
      const result = getPositionDescription('InvalidPosition');
      expect(result).toBe('');
    });
  });

  describe('getPositionSkills', () => {
    it('should return skills array for valid position', () => {
      const result = getPositionSkills('Lock');
      expect(result).toEqual(['Lineout jumping', 'Scrummaging', 'Physical presence']);
    });

    it('should return empty array for invalid position', () => {
      const result = getPositionSkills('InvalidPosition');
      expect(result).toEqual([]);
    });
  });

  describe('getPositionNumber', () => {
    it('should return position number for valid position', () => {
      const result = getPositionNumber('1st-Five');
      expect(result).toBe('10');
    });

    it('should return empty string for invalid position', () => {
      const result = getPositionNumber('InvalidPosition');
      expect(result).toBe('');
    });
  });

  describe('isForwardPosition', () => {
    it('should return true for forward positions', () => {
      expect(isForwardPosition('Prop')).toBe(true);
      expect(isForwardPosition('Hooker')).toBe(true);
      expect(isForwardPosition('Lock')).toBe(true);
      expect(isForwardPosition('Flanker')).toBe(true);
      expect(isForwardPosition('Number 8')).toBe(true);
    });

    it('should return false for back positions', () => {
      expect(isForwardPosition('Half-Back')).toBe(false);
      expect(isForwardPosition('1st-Five')).toBe(false);
      expect(isForwardPosition('Wing')).toBe(false);
    });

    it('should return false for invalid position', () => {
      expect(isForwardPosition('InvalidPosition')).toBe(false);
    });
  });

  describe('isBackPosition', () => {
    it('should return true for back positions', () => {
      expect(isBackPosition('Half-Back')).toBe(true);
      expect(isBackPosition('1st-Five')).toBe(true);
      expect(isBackPosition('2nd-Five')).toBe(true);
      expect(isBackPosition('Centre')).toBe(true);
      expect(isBackPosition('Wing')).toBe(true);
      expect(isBackPosition('Fullback')).toBe(true);
    });

    it('should return false for forward positions', () => {
      expect(isBackPosition('Prop')).toBe(false);
      expect(isBackPosition('Hooker')).toBe(false);
      expect(isBackPosition('Lock')).toBe(false);
    });

    it('should return false for invalid position', () => {
      expect(isBackPosition('InvalidPosition')).toBe(false);
    });
  });

  describe('validatePositionCombination', () => {
    it('should validate empty positions', () => {
      const result = validatePositionCombination(['', '']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('No positions selected');
    });

    it('should validate single position', () => {
      const result = validatePositionCombination(['Prop', '']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('One position selected');
    });

    it('should validate two different positions', () => {
      const result = validatePositionCombination(['Prop', 'Hooker']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Two forward positions selected');
    });

    it('should reject duplicate positions', () => {
      const result = validatePositionCombination(['Prop', 'Prop']);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Cannot select the same position twice');
    });

    it('should validate two forward positions', () => {
      const result = validatePositionCombination(['Prop', 'Lock']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Two forward positions selected');
    });

    it('should validate two back positions', () => {
      const result = validatePositionCombination(['1st-Five', 'Wing']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Two back positions selected');
    });

    it('should validate mixed positions', () => {
      const result = validatePositionCombination(['Prop', '1st-Five']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Mixed forward and back positions selected');
    });

    it('should handle positions with whitespace', () => {
      const result = validatePositionCombination([' Prop ', 'Hooker']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Two forward positions selected');
    });
  });
});
