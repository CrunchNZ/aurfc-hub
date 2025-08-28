import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, UserMinus, Users, X, Star, ArrowLeft, Trophy, AlertCircle, UserCheck } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';
import { getTeamById } from '../services/team';
import RugbyPitch from './RugbyPitch';
import Bench from './Bench';

// ============================================================================
// LINEUP FORMATION COMPONENT - STANDALONE PAGE
// ============================================================================

const LineupFormation = () => {
  const { currentUser: user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [team, setTeam] = useState(null);
  const [lineup, setLineup] = useState({ 
    players: [],
    positions: {},
    originalPositions: {} // To track changes
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  // Unified positions array with grid coordinates for responsive layout
  const ALL_POSITIONS = [
    // Forwards
    { number: 1, name: 'Loosehead Prop', shortName: '1. Prop', gridRow: 1, gridCol: 2 },
    { number: 2, name: 'Hooker', shortName: '2. Hooker', gridRow: 1, gridCol: 4 },
    { number: 3, name: 'Tighthead Prop', shortName: '3. Prop', gridRow: 1, gridCol: 6 },
    { number: 4, name: 'Lock', shortName: '4. Lock', gridRow: 2, gridCol: 3 },
    { number: 5, name: 'Lock', shortName: '5. Lock', gridRow: 2, gridCol: 5 },
    { number: 6, name: 'Blindside Flanker', shortName: '6. Flanker', gridRow: 3, gridCol: 1 },
    { number: 7, name: 'Openside Flanker', shortName: '7. Flanker', gridRow: 3, gridCol: 7 },
    { number: 8, name: 'Number 8', shortName: '8. No 8', gridRow: 3, gridCol: 4 },
    // Backs
    { number: 9, name: 'Scrum Half', shortName: '9. Half Back', gridRow: 4, gridCol: 3 },
    { number: 10, name: 'Fly Half', shortName: '10. 1st Five', gridRow: 4, gridCol: 5 },
    { number: 12, name: 'Inside Centre', shortName: '12. 2nd Five', gridRow: 5, gridCol: 2 },
    { number: 13, name: 'Outside Centre', shortName: '13. Centre', gridRow: 5, gridCol: 6 },
    { number: 11, name: 'Left Wing', shortName: '11. L Wing', gridRow: 6, gridCol: 1 },
    { number: 14, name: 'Right Wing', shortName: '14. R Wing', gridRow: 6, gridCol: 7 },
    { number: 15, name: 'Fullback', shortName: '15. Fullback', gridRow: 7, gridCol: 4 },
  ];

  // Load team data and initialize lineup
  useEffect(() => {
    console.log('LineupFormation useEffect triggered');
    console.log('User:', user);
    console.log('Auth loading:', authLoading);
    console.log('Search params:', searchParams.get('team'));

    if (user && user.uid && !authLoading) {
      console.log('User authenticated, loading team data...');
      loadTeamData();
    } else {
      console.log('User not authenticated or still loading auth');
    }
  }, [user, authLoading]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError('');

      const teamId = searchParams.get('team');
      if (!teamId) {
        setError('No team selected. Please select a team first.');
        return;
      }

      console.log('Loading team data for ID:', teamId);
      const teamData = await getTeamById(teamId);

      if (!teamData) {
        setError('Team not found. Please check the team ID and try again.');
        return;
      }

      console.log('Team data loaded:', teamData);
      setTeam(teamData);

      // Initialize lineup with existing players or empty positions
      const initialLineup = {
        teamId: teamId,
        teamName: teamData.name,
        players: teamData.players?.map(player => ({
          ...player,
          assignedPosition: null, // Will be set when player is assigned to position
          isInStartingLineup: false
        })) || []
      };

      setLineup(initialLineup);
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if lineup has changes
  const hasLineupChanges = () => {
    const currentPositions = JSON.stringify(lineup.positions);
    const originalPositions = JSON.stringify(lineup.originalPositions);
    return currentPositions !== originalPositions;
  };

  // Handle position click
  const handlePositionClick = (position) => {
    setSelectedPosition(position.number);
  };

  // Handle player drag start
  const handlePlayerDragStart = (e, player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', player.id);
  };

  // Handle position drop
  const handlePositionDrop = (e, positionNumber) => {
    e.preventDefault();
    if (draggedPlayer) {
      handleAssignPlayer(draggedPlayer, positionNumber);
      setDraggedPlayer(null);
    }
  };

  // Assign player to position
  const handleAssignPlayer = (player, positionNumber) => {
    // Check if player is already assigned to another position
    const currentPositions = { ...lineup.positions };
    const positionToRemove = Object.keys(currentPositions).find(
      pos => currentPositions[pos].id === player.id
    );
    
    if (positionToRemove) {
      delete currentPositions[positionToRemove];
    }
    
    // Assign player to new position
    currentPositions[positionNumber] = player;
    
    setLineup(prev => ({
      ...prev,
      positions: currentPositions
    }));
    
    setSelectedPosition(positionNumber);
  };

  // Remove player from position
  const handleRemovePlayer = (positionNumber) => {
    const currentPositions = { ...lineup.positions };
    delete currentPositions[positionNumber];
    
    setLineup(prev => ({
      ...prev,
      positions: currentPositions
    }));
  };

  // Get players suitable for a specific position based on their preferences
  const getPlayersForPosition = (positionNumber) => {
    const position = ALL_POSITIONS.find(p => p.number === positionNumber);
    if (!position) return [];
    
    // Filter players who are not already assigned
    const unassignedPlayers = lineup.players.filter(player => 
      !Object.values(lineup.positions || {}).some(
        assignedPlayer => assignedPlayer.id === player.id
      )
    );
    
    if (!unassignedPlayers.length) return [];
    
    // Position mapping for intelligent suggestions
    const positionMapping = {
      // Props (1 & 3) - can be filled by players with "Prop" preference
      1: ['Prop'], // Loosehead Prop
      3: ['Prop'], // Tighthead Prop
      
      // Hooker (2)
      2: ['Hooker'],
      
      // Locks (4 & 5)
      4: ['Lock'],
      5: ['Lock'],
      
      // Flankers (6 & 7) - can be filled by players with "Flanker" preference
      6: ['Flanker'], // Blindside Flanker
      7: ['Flanker'], // Openside Flanker
      
      // Number 8 (8)
      8: ['Number 8'],
      
      // Half Backs (9 & 10)
      9: ['Half Back'], // Scrum Half
      10: ['1st-Five'], // Fly Half
      
      // Centres (12 & 13)
      12: ['2nd-Five'], // Inside Centre
      13: ['Centre'], // Outside Centre
      
      // Wings (11 & 14) - can be filled by players with "Wing" preference
      11: ['Wing'], // Left Wing
      14: ['Wing'], // Right Wing
      
      // Fullback (15)
      15: ['Fullback']
    };
    
    const targetPositions = positionMapping[positionNumber] || [];
    
    // Score players based on position preference match
    const scoredPlayers = unassignedPlayers.map(player => {
      let score = 0;
      let bestMatch = '';
      
      // Check position1 (highest priority)
      if (player.position1 && targetPositions.includes(player.position1)) {
        score += 10;
        bestMatch = player.position1;
      }
      // Check position2 (medium priority)
      else if (player.position2 && targetPositions.includes(player.position2)) {
        score += 6;
        bestMatch = player.position2;
      }
      // Check position3 (lowest priority)
      else if (player.position3 && targetPositions.includes(player.position3)) {
        score += 3;
        bestMatch = player.position3;
      }
      
      return {
        ...player,
        positionScore: score,
        bestMatch,
        isPreferred: score > 0
      };
    });
    
    // Sort by score (highest first) and then by name
    return scoredPlayers
      .sort((a, b) => {
        if (b.positionScore !== a.positionScore) {
          return b.positionScore - a.positionScore;
        }
        return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
      });
  };

  // Save lineup
  const handleSaveLineup = async () => {
    try {
      // Here you would typically save to Firestore
      // For now, we'll just update the original positions
      setLineup(prev => ({
        ...prev,
        originalPositions: { ...prev.positions }
      }));
      
      // Show success message
      alert('Lineup saved successfully!');
    } catch (error) {
      console.error('Error saving lineup:', error);
      setError('Failed to save lineup: ' + error.message);
    }
  };

  // Reset lineup
  const handleResetLineup = () => {
    setLineup(prev => ({
      ...prev,
      positions: { ...prev.originalPositions }
    }));
  };

  // Remove old unused functions - these are now handled by the new implementation above

  // Remove duplicate functions - these are now handled by the new implementation above

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="card-primary">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <UserCheck size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-white/80">Please log in to access lineup formation.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card border-red-200 bg-red-50 mb-6">
            <div className="p-6 flex items-center gap-3">
              <AlertCircle size={24} className="text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Team</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => navigate('/team-builder')}
                className="btn-secondary"
              >
                Back to Teams
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/team-builder')}
              className="p-2 bg-secondary-light/20 hover:bg-secondary-light/30 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-text-secondary" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Lineup Formation</h1>
                {team && <p className="text-text-secondary">{team.name} - Game Day Roster</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Lineup Formation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Rugby Pitch Formation - Left Side */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Rugby Pitch Formation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLineup}
                    className="btn-primary btn-sm"
                    disabled={!hasLineupChanges}
                  >
                    Save Lineup
                  </button>
                  <button
                    onClick={handleResetLineup}
                    className="btn-secondary btn-sm"
                    disabled={!hasLineupChanges}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Rugby Pitch Grid */}
              <div className="relative bg-green-800 rounded-lg p-4 overflow-hidden">
                {/* Field Lines */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/30 transform -translate-y-1/2"></div>
                <div className="absolute top-4 bottom-4 left-1/2 w-0.5 bg-white/30 transform -translate-x-1/2"></div>
                
                {/* Try Lines */}
                <div className="absolute top-2 left-4 right-4 h-1 bg-white/50"></div>
                <div className="absolute bottom-2 left-4 right-4 h-1 bg-white/50"></div>

                {/* Position Grid */}
                <div className="relative h-96">
                  {ALL_POSITIONS.map((position) => {
                    const assignedPlayer = lineup.positions?.[position.number];
                    const isPositionSelected = selectedPosition === position.number;
                    
                    return (
                      <div
                        key={position.number}
                        className={`absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                          isPositionSelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          left: `${(position.gridCol / 8) * 100}%`,
                          top: `${(position.gridRow / 8) * 100}%`
                        }}
                        onClick={() => handlePositionClick(position)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handlePositionDrop(e, position.number)}
                      >
                        {/* Position Card */}
                        <div className={`w-full h-full rounded-lg border-2 transition-all duration-200 ${
                          assignedPlayer 
                            ? 'border-green-400 bg-green-100 shadow-lg' 
                            : 'border-white/50 bg-white/20 hover:border-white/70'
                        } ${isPositionSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}>
                          
                          {/* Position Number */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {position.number}
                          </div>
                          
                          {/* Position Name */}
                          <div className="absolute top-1 left-1 right-1 text-center">
                            <div className="text-xs font-medium text-white">
                              {position.shortName}
                            </div>
                          </div>
                          
                          {/* Assigned Player */}
                          {assignedPlayer && (
                            <div className="absolute bottom-1 left-1 right-1 text-center">
                              <div className="text-xs font-medium text-green-800 bg-green-200 px-1 py-0.5 rounded">
                                {assignedPlayer.firstName}
                              </div>
                            </div>
                          )}
                          
                          {/* Drop Zone Indicator */}
                          {!assignedPlayer && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white/50 text-xs text-center">
                                Drop<br/>Player
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Player Management - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Available Players */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Available Players</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {lineup.players && lineup.players.length > 0 ? (
                  lineup.players.map((player) => {
                    const isAssigned = Object.values(lineup.positions || {}).some(
                      assignedPlayer => assignedPlayer.id === player.id
                    );
                    
                    // Get position compatibility for this player
                    const getPositionCompatibility = (player) => {
                      const compatiblePositions = [];
                      const playerPositions = [player.position1, player.position2, player.position3].filter(Boolean);
                      
                      ALL_POSITIONS.forEach(pos => {
                        const positionMapping = {
                          1: ['Prop'], 3: ['Prop'], // Props
                          2: ['Hooker'], // Hooker
                          4: ['Lock'], 5: ['Lock'], // Locks
                          6: ['Flanker'], 7: ['Flanker'], // Flankers
                          8: ['Number 8'], // Number 8
                          9: ['Half Back'], // Scrum Half
                          10: ['1st-Five'], // Fly Half
                          12: ['2nd-Five'], // Inside Centre
                          13: ['Centre'], // Outside Centre
                          11: ['Wing'], 14: ['Wing'], // Wings
                          15: ['Fullback'] // Fullback
                        };
                        
                        const targetPositions = positionMapping[pos.number] || [];
                        if (playerPositions.some(pref => targetPositions.includes(pref))) {
                          compatiblePositions.push(pos.number);
                        }
                      });
                      
                      return compatiblePositions;
                    };
                    
                    const compatiblePositions = getPositionCompatibility(player);
                    
                    return (
                      <div
                        key={player.id}
                        draggable={!isAssigned}
                        onDragStart={(e) => handlePlayerDragStart(e, player)}
                        className={`p-3 rounded-lg cursor-grab transition-all duration-200 ${
                          isAssigned 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border border-gray-200 hover:border-primary hover:shadow-md'
                        } ${isAssigned ? '' : 'hover:scale-105'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {player.firstName?.[0]}{player.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {player.firstName} {player.lastName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {player.position1 || 'Position not set'}
                            </div>
                            {compatiblePositions.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                Compatible: {compatiblePositions.join(', ')}
                              </div>
                            )}
                          </div>
                          {isAssigned && (
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center">No players available</p>
                )}
              </div>
            </div>

            {/* Position Details */}
            {selectedPosition && (
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">
                  Position {selectedPosition} Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position Name
                    </label>
                    <p className="text-gray-900">
                      {ALL_POSITIONS.find(p => p.number === selectedPosition)?.name}
                    </p>
                  </div>
                  
                  {lineup.positions?.[selectedPosition] ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Player
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-800">
                            {lineup.positions[selectedPosition].firstName?.[0]}
                            {lineup.positions[selectedPosition].lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {lineup.positions[selectedPosition].firstName} {lineup.positions[selectedPosition].lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {lineup.positions[selectedPosition].position1}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(selectedPosition)}
                          className="ml-auto text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Available Players for this Position
                       </label>
                       <div className="space-y-2 max-h-32 overflow-y-auto">
                         {getPlayersForPosition(selectedPosition).map((player) => (
                           <div
                             key={player.id}
                             className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                               player.isPreferred 
                                 ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                                 : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                             }`}
                             onClick={() => handleAssignPlayer(player, selectedPosition)}
                           >
                             <div className="flex items-center justify-between mb-1">
                               <div className="text-sm font-medium">
                                 {player.firstName} {player.lastName}
                               </div>
                               {player.isPreferred && (
                                 <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                   Preferred
                                 </div>
                               )}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-gray-600">
                               <span>Pref: {player.position1 || 'None'}</span>
                               {player.positionScore > 0 && (
                                 <span className={`px-2 py-0.5 rounded ${
                                   player.positionScore >= 10 ? 'bg-green-100 text-green-800' :
                                   player.positionScore >= 6 ? 'bg-blue-100 text-blue-800' :
                                   'bg-yellow-100 text-yellow-800'
                                 }`}>
                                   Score: {player.positionScore}
                                 </span>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Lineup Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Lineup Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Positions Filled:</span>
                  <span className="font-medium">
                    {Object.keys(lineup.positions || {}).length} / {ALL_POSITIONS.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Players Assigned:</span>
                  <span className="font-medium">
                    {Object.keys(lineup.positions || {}).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Players Available:</span>
                  <span className="font-medium">
                    {lineup.players?.filter(p => !Object.values(lineup.positions || {}).some(
                      assignedPlayer => assignedPlayer.id === p.id
                    )).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default LineupFormation;