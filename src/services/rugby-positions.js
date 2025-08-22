// Rugby Positions Service for AURFC Hub
// Provides information about rugby positions and their characteristics

// ============================================================================
// POSITION DEFINITIONS
// ============================================================================

export const RUGBY_POSITIONS = {
  // Forward Positions
  'Prop': {
    category: 'Forward',
    description: 'Front row forward, provides power in scrums and rucks',
    skills: ['Scrummaging', 'Rucking', 'Physical strength'],
    number: '1 & 3'
  },
  'Hooker': {
    category: 'Forward',
    description: 'Front row forward, throws into lineouts and hooks in scrums',
    skills: ['Lineout throwing', 'Scrummaging', 'Rucking'],
    number: '2'
  },
  'Lock': {
    category: 'Forward',
    description: 'Second row forward, provides height in lineouts and power in scrums',
    skills: ['Lineout jumping', 'Scrummaging', 'Physical presence'],
    number: '4 & 5'
  },
  'Flanker': {
    category: 'Forward',
    description: 'Back row forward, provides mobility and breakdown work',
    skills: ['Breakdown work', 'Tackling', 'Ball carrying'],
    number: '6 & 7'
  },
  'Number 8': {
    category: 'Forward',
    description: 'Back row forward, controls ball from scrum and provides power',
    skills: ['Ball control', 'Power running', 'Leadership'],
    number: '8'
  },
  
  // Back Positions
  'Half-Back': {
    category: 'Back',
    description: 'Scrum half, distributes ball from breakdowns and scrums',
    skills: ['Passing', 'Decision making', 'Quick thinking'],
    number: '9'
  },
  '1st-Five': {
    category: 'Back',
    description: 'Fly half, tactical leader and playmaker',
    skills: ['Kicking', 'Tactical play', 'Decision making'],
    number: '10'
  },
  '2nd-Five': {
    category: 'Back',
    description: 'Inside centre, provides power and distribution',
    skills: ['Power running', 'Passing', 'Tackling'],
    number: '12'
  },
  'Centre': {
    category: 'Back',
    description: 'Outside centre, provides pace and finishing ability',
    skills: ['Pace', 'Finishing', 'Defensive organization'],
    number: '13'
  },
  'Wing': {
    category: 'Back',
    description: 'Wide player, provides pace and finishing ability',
    skills: ['Pace', 'Finishing', 'Positional play'],
    number: '11 & 14'
  },
  'Fullback': {
    category: 'Back',
    description: 'Last line of defense, provides counter-attacking ability',
    skills: ['Catching', 'Kicking', 'Positional play'],
    number: '15'
  }
};

// ============================================================================
// POSITION UTILITIES
// ============================================================================

/**
 * Get all position names
 * @returns {Array} Array of position names
 */
export const getAllPositionNames = () => {
  return Object.keys(RUGBY_POSITIONS);
};

/**
 * Get positions by category
 * @param {string} category - 'Forward' or 'Back'
 * @returns {Array} Array of position names in that category
 */
export const getPositionsByCategory = (category) => {
  return Object.entries(RUGBY_POSITIONS)
    .filter(([_, pos]) => pos.category === category)
    .map(([name, _]) => name);
};

/**
 * Get forward positions
 * @returns {Array} Array of forward position names
 */
export const getForwardPositions = () => {
  return getPositionsByCategory('Forward');
};

/**
 * Get back positions
 * @returns {Array} Array of back position names
 */
export const getBackPositions = () => {
  return getPositionsByCategory('Back');
};

/**
 * Get position information
 * @param {string} positionName - Name of the position
 * @returns {Object|null} Position information object or null if not found
 */
export const getPositionInfo = (positionName) => {
  return RUGBY_POSITIONS[positionName] || null;
};

/**
 * Get position description
 * @param {string} positionName - Name of the position
 * @returns {string} Position description or empty string if not found
 */
export const getPositionDescription = (positionName) => {
  const info = getPositionInfo(positionName);
  return info ? info.description : '';
};

/**
 * Get position skills
 * @param {string} positionName - Name of the position
 * @returns {Array} Array of skills or empty array if not found
 */
export const getPositionSkills = (positionName) => {
  const info = getPositionInfo(positionName);
  return info ? info.skills : [];
};

/**
 * Get position number
 * @param {string} positionName - Name of the position
 * @returns {string} Position number or empty string if not found
 */
export const getPositionNumber = (positionName) => {
  const info = getPositionInfo(positionName);
  return info ? info.number : '';
};

/**
 * Check if position is forward
 * @param {string} positionName - Name of the position
 * @returns {boolean} True if forward position
 */
export const isForwardPosition = (positionName) => {
  const info = getPositionInfo(positionName);
  return info ? info.category === 'Forward' : false;
};

/**
 * Check if position is back
 * @param {string} positionName - Name of the position
 * @returns {boolean} True if back position
 */
export const isBackPosition = (positionName) => {
  const info = getPositionInfo(positionName);
  return info ? info.category === 'Back' : false;
};

// ============================================================================
// POSITION VALIDATION
// ============================================================================

/**
 * Validate position combination
 * @param {Array} positions - Array of position names
 * @returns {Object} Validation result with isValid and message
 */
export const validatePositionCombination = (positions) => {
  const validPositions = positions.filter(pos => pos && pos.trim() !== '');
  
  if (validPositions.length === 0) {
    return { isValid: true, message: 'No positions selected' };
  }
  
  if (validPositions.length === 1) {
    return { isValid: true, message: 'One position selected' };
  }
  
  // Check for duplicates (case-insensitive and trim whitespace)
  const normalizedPositions = validPositions.map(pos => pos.trim());
  if (new Set(normalizedPositions).size !== normalizedPositions.length) {
    return { isValid: false, message: 'Cannot select the same position twice' };
  }
  
  // Check for valid combinations (optional - could add more rules)
  const forwardCount = normalizedPositions.filter(pos => isForwardPosition(pos)).length;
  const backCount = normalizedPositions.filter(pos => isBackPosition(pos)).length;
  
  if (forwardCount === 2) {
    return { isValid: true, message: 'Two forward positions selected' };
  }
  
  if (backCount === 2) {
    return { isValid: true, message: 'Two back positions selected' };
  }
  
  return { isValid: true, message: 'Mixed forward and back positions selected' };
};
