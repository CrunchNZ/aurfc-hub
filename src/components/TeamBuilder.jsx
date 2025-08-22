import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

import { 
  createTeamLineup,
  getTeamLineups,
  updateTeamLineup,
  deleteTeamLineup,
  addPlayerToPosition,
  removePlayerFromPosition,
  addPlayerToSubstitutes,
  removePlayerFromSubstitutes,
  setTeamCaptain,
  setTeamViceCaptain,
  getFormationLayout,
  validateLineup,
  LINEUP_SET_TYPES
} from '../services/team-builder';
import { getAllTeams } from '../services/team';

import { 
  Users, 
  Trophy, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  Eye,
  EyeOff,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Calendar,
  MapPin,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const TeamBuilder = () => {
  console.log('TeamBuilder component initializing...');
  
  const { currentUser: user } = useAuth();
  console.log('Auth context loaded, user:', !!user);
  
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [lineups, setLineups] = useState([]);
  const [selectedLineup, setSelectedLineup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateLineup, setShowCreateLineup] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  
  // Form states
  const [lineupForm, setLineupForm] = useState({
    name: '',
    type: 'Starting Lineup',
    matchDate: '',
    opponent: '',
    isHome: true,
    notes: ''
  });

  useEffect(() => {
    console.log('useEffect triggered for user:', !!user);
    if (user) {
      console.log('User authenticated, loading teams...');
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    console.log('useEffect triggered for selectedTeam:', !!selectedTeam);
    if (selectedTeam) {
      console.log('Team selected, loading lineups...');
      loadLineups();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      console.log('loadTeams function called');
      setLoading(true);
      
      console.log('Calling getAllTeams service...');
      const teamsData = await getAllTeams();
      console.log('getAllTeams returned:', teamsData);
      
      if (!teamsData || !Array.isArray(teamsData)) {
        console.error('getAllTeams returned invalid data:', teamsData);
        setError('Invalid teams data received');
        return;
      }
      
      const activeTeams = teamsData.filter(team => team.active);
      console.log('Filtered active teams:', activeTeams);
      
      setTeams(activeTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Failed to load teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLineups = async () => {
    if (!selectedTeam) return;
    
    try {
      console.log('loadLineups called for team:', selectedTeam.id);
      setLoading(true);
      setError(''); // Clear any previous errors
      
      const lineupsData = await getTeamLineups(selectedTeam.id);
      console.log('Lineups data received:', lineupsData);
      
      setLineups(lineupsData);
      
      if (lineupsData && lineupsData.length > 0) {
        console.log('Setting selected lineup to first lineup');
        setSelectedLineup(lineupsData[0]);
      } else {
        console.log('No lineups found, setting selectedLineup to null');
        // No lineups yet - this is normal for a new team
        setSelectedLineup(null);
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error loading lineups:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Failed to load lineups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLineup = async (e) => {
    e.preventDefault();
    try {
      setError(''); // Clear any previous errors
      console.log('Starting lineup creation...');
      
      if (!selectedTeam) {
        setError('Please select a team first');
        return;
      }
      
      if (!lineupForm.name || !lineupForm.matchDate || !lineupForm.opponent) {
        setError('Lineup name, match date, and opponent are required');
        return;
      }
      
      console.log('Form validation passed, creating lineup with data:', {
        ...lineupForm,
        teamId: selectedTeam.id,
        createdBy: user.uid
      });
      
      const newLineup = await createTeamLineup({
        ...lineupForm,
        teamId: selectedTeam.id,
        createdBy: user.uid
      });
      
      console.log('Lineup created successfully:', newLineup);
      
      // Update state safely
      setLineups(prevLineups => [newLineup, ...(prevLineups || [])]);
      setSelectedLineup(newLineup);
      setShowCreateLineup(false);
      setLineupForm({
        name: '',
        type: 'Starting Lineup',
        matchDate: '',
        opponent: '',
        isHome: true,
        notes: ''
      });
      
      // Show success message
      console.log('Lineup created and state updated successfully');
    } catch (error) {
      console.error('Error creating lineup:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Failed to create lineup: ' + error.message);
      
      // Don't close modal on error - let user see the error
      console.log('Keeping modal open to show error message');
    }
  };

  const handleDeleteLineup = async (lineupId) => {
    if (window.confirm('Are you sure you want to delete this lineup?')) {
      try {
        await deleteTeamLineup(lineupId);
        const updatedLineups = lineups.filter(l => l.id !== lineupId);
        setLineups(updatedLineups);
        
        if (selectedLineup?.id === lineupId) {
          setSelectedLineup(updatedLineups[0] || null);
        }
      } catch (error) {
        console.error('Error deleting lineup:', error);
        setError('Failed to delete lineup: ' + error.message);
      }
    }
  };

  const handleDuplicateLineup = async (lineup) => {
    try {
      const newLineup = await createTeamLineup({
        ...lineup,
        name: `${lineup.name} (Copy)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      });
      
      setLineups([newLineup, ...lineups]);
      setSelectedLineup(newLineup);
    } catch (error) {
      console.error('Error duplicating lineup:', error);
      setError('Failed to duplicate lineup: ' + error.message);
    }
  };



  const handleRemovePlayerFromPosition = async (playerId) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await removePlayerFromPosition(selectedLineup.id, playerId);
      setSelectedLineup(updatedLineup);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error removing player from position:', error);
      setError('Failed to remove player from position: ' + error.message);
    }
  };

  // Add player to substitutes bench
  const handleAddPlayerToSubstitutes = async (player) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await addPlayerToSubstitutes(selectedLineup.id, player);
      setSelectedLineup(updatedLineup);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error adding player to substitutes:', error);
      setError('Failed to add player to substitutes: ' + error.message);
    }
  };

  // Remove player from substitutes bench
  const handleRemovePlayerFromSubstitutes = async (playerId) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await removePlayerFromSubstitutes(selectedLineup.id, playerId);
      setSelectedLineup(updatedLineup);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error removing player from substitutes:', error);
      setError('Failed to remove player from substitutes: ' + error.message);
    }
  };

  const handleSetCaptain = async (playerId) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await setTeamCaptain(selectedLineup.id, playerId);
      setSelectedLineup(updatedLineup);
    } catch (error) {
      console.error('Error setting captain:', error);
      setError('Failed to set captain: ' + error.message);
    }
  };

  // Get available players for the selected team
  const getAvailablePlayers = () => {
    console.log('getAvailablePlayers called with:', { selectedTeam, selectedLineup });
    if (!selectedTeam || !selectedTeam.players) {
      console.log('No team or players, returning empty array');
      return [];
    }
    if (!Array.isArray(selectedTeam.players)) {
      console.log('Team players is not an array:', selectedTeam.players);
      return [];
    }
    
    const available = selectedTeam.players.filter(player => {
      const inLineup = selectedLineup?.players && Array.isArray(selectedLineup.players) ? 
        selectedLineup.players.find(p => p.id === player.id) : null;
      const inSubstitutes = selectedLineup?.substitutes && Array.isArray(selectedLineup.substitutes) ? 
        selectedLineup.substitutes.find(p => p.id === player.id) : null;
      
      return !inLineup && !inSubstitutes;
    });
    
    console.log('Available players:', available);
    return available;
  };

  // Get lineup validation status
  const getValidationStatus = () => {
    if (!selectedLineup) return null;
    return validateLineup(selectedLineup.players || []);
  };

  // Open player selector for a specific position
  const openPlayerSelector = (position) => {
    setSelectedPosition(position);
    setAvailablePlayers(getAvailablePlayers());
    setShowPlayerSelector(true);
  };



  // Add player to a specific position
  const handleAddPlayerToPosition = async (position, player) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await addPlayerToPosition(selectedLineup.id, position, player);
      setSelectedLineup(updatedLineup);
      setShowPlayerSelector(false);
      setSelectedPosition(null);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error adding player to position:', error);
      setError('Failed to add player to position: ' + error.message);
    }
  };

  const handleSetViceCaptain = async (playerId) => {
    if (!selectedLineup) return;
    
    try {
      const updatedLineup = await setTeamViceCaptain(selectedLineup.id, playerId);
      setSelectedLineup(updatedLineup);
    } catch (error) {
      console.error('Error setting vice captain:', error);
      setError('Failed to set vice captain: ' + error.message);
    }
  };







  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-primary">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-white/80">Please log in to access the team builder.</p>
          </div>
        </div>
      </div>
    );
  }

  // Add error boundary for the component
  if (error) {
    console.log('Rendering error state with error:', error);
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-primary">
            <h2 className="text-2xl font-bold mb-4">Error in Team Builder</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => setError('')}
              className="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Clear Error
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add safety check for loading state
  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-primary">
            <h2 className="text-2xl font-bold mb-4">Loading Team Builder</h2>
            <p className="text-white/80 mb-4">Please wait while we load your teams...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering TeamBuilder component with state:', {
    user: !!user,
    teams: teams?.length || 0,
    selectedTeam: !!selectedTeam,
    lineups: lineups?.length || 0,
    selectedLineup: !!selectedLineup,
    loading,
    error
  });

  // Add defensive checks for all variables
  const safeTeams = teams || [];
  const safeLineups = lineups || [];
  const safeSelectedTeam = selectedTeam || null;
  const safeSelectedLineup = selectedLineup || null;
  
  console.log('Safe variables created:', {
    safeTeams: safeTeams.length,
    safeLineups: safeLineups.length,
    safeSelectedTeam: !!safeSelectedTeam,
    safeSelectedLineup: !!safeSelectedLineup
  });

  try {
    return (
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-primary mb-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
            >
              <Trophy size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Team Builder</h1>
            <p className="text-white/80 text-lg">Create and manage rugby team lineups with proper formation layouts</p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-error text-center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Team Selection */}
        <motion.div
          key="team-selection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Select Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teams && teams.length > 0 ? teams.map((team) => (
                <motion.button
                  key={team.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTeam?.id === team.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-secondary-light hover:border-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm opacity-75">{team.ageGroup} - {team.type}</div>
                  </div>
                </motion.button>
              )) : (
                <div className="col-span-3 text-center py-8 text-text-secondary">
                  <Users size={48} className="mx-auto mb-4 text-primary/40" />
                  <p className="text-lg font-medium">No Teams Available</p>
                  <p className="text-sm">Teams will appear here once they are created</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {selectedTeam && (
          <>
            {/* Lineup Management */}
            <motion.div
              key="lineup-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card mb-8"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Lineups for {selectedTeam.name}</h2>
                    <p className="text-text-secondary">Manage team lineups and formations</p>
                  </div>
                  <button
                    onClick={() => setShowCreateLineup(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create Lineup
                  </button>
                </div>

                {/* Lineup List */}
                {lineups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-text-secondary mb-4">
                      <Trophy size={48} className="mx-auto mb-4 text-primary/40" />
                      <p className="text-lg font-medium">No Lineups Yet</p>
                      <p className="text-sm">Create your first lineup to get started with team management</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lineups.map((lineup) => (
                      <motion.div
                        key={lineup.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedLineup?.id === lineup.id
                            ? 'border-primary bg-primary/10'
                            : 'border-secondary-light hover:border-primary'
                        }`}
                        onClick={() => setSelectedLineup(lineup)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-text-primary">{lineup.name}</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateLineup(lineup);
                              }}
                              className="p-1 text-text-secondary hover:text-primary"
                              title="Duplicate"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLineup(lineup.id);
                              }}
                              className="p-1 text-text-secondary hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-text-secondary space-y-1">
                          <div>Type: {lineup.type}</div>
                          <div>Opponent: {lineup.opponent}</div>
                          <div>Status: {lineup.status}</div>
                          <div>Players: {lineup.players.length}/15</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Formation Display */}
            {selectedLineup ? (
              <motion.div
                key="formation-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="card mb-8"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{selectedLineup.name}</h2>
                      <div className="text-text-secondary">
                        {selectedLineup.opponent} - {selectedLineup.isHome ? 'Home' : 'Away'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary btn-sm">Edit</button>
                      <button className="btn-primary btn-sm">Save</button>
                    </div>
                  </div>

                  {/* Formation Layout */}
                  <div className="bg-green-800/20 rounded-lg p-6 border border-green-600/30">
                    {/* Forwards - Scrum Formation */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Forwards</h3>
                      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
                        {/* Row 1: Front Row */}
                        <div className="col-start-2 col-span-3 grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((pos) => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === pos) : null;
                            return (
                              <PositionCard
                                key={pos}
                                position={pos}
                                player={player}
                                onAddPlayer={() => openPlayerSelector(pos)}
                                onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                onSetCaptain={() => player && handleSetCaptain(player.id)}
                                onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                isCaptain={selectedLineup.captain === player?.id}
                                isViceCaptain={selectedLineup.viceCaptain === player?.id}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Row 2: Locks */}
                        <div className="col-start-2 col-span-3 grid grid-cols-3 gap-2">
                          <div></div>
                          {[4, 5].map((pos) => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === pos) : null;
                            return (
                              <PositionCard
                                key={pos}
                                position={pos}
                                player={player}
                                onAddPlayer={() => openPlayerSelector(pos)}
                                onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                onSetCaptain={() => player && handleSetCaptain(player.id)}
                                onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                isCaptain={selectedLineup.captain === player?.id}
                                isViceCaptain={selectedLineup.viceCaptain === player?.id}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Row 3: Back Row */}
                        <div className="col-start-1 col-span-5 grid grid-cols-5 gap-2">
                          {[6, 7, 8].map((pos) => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === pos) : null;
                            const col = pos === 6 ? 1 : pos === 7 ? 3 : 5;
                            return (
                              <div key={pos} className={`col-start-${col}`}>
                                <PositionCard
                                  position={pos}
                                  player={player}
                                  onAddPlayer={() => openPlayerSelector(pos)}
                                  onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                  onSetCaptain={() => player && handleSetCaptain(player.id)}
                                  onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                  isCaptain={selectedLineup.captain === player?.id}
                                  isViceCaptain={selectedLineup.viceCaptain === player?.id}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Backs - Position Groups */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Backs</h3>
                      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
                        {/* Row 4: Halfbacks */}
                        <div className="col-start-3 col-span-2 grid grid-cols-2 gap-2">
                          {[9, 10].map((pos) => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === pos) : null;
                            return (
                              <PositionCard
                                key={pos}
                                position={pos}
                                player={player}
                                onAddPlayer={() => openPlayerSelector(pos)}
                                onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                onSetCaptain={() => player && handleSetCaptain(player.id)}
                                onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                isCaptain={selectedLineup.captain === player?.id}
                                isViceCaptain={selectedLineup.viceCaptain === player?.id}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Row 5: Centres and Wings */}
                        <div className="col-start-1 col-span-5 grid grid-cols-5 gap-2">
                          {[11, 12, 13, 14].map((pos) => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === pos) : null;
                            const col = pos === 11 ? 1 : pos === 12 ? 2 : pos === 13 ? 4 : 5;
                            return (
                              <div key={pos} className={`col-start-${col}`}>
                                <PositionCard
                                  position={pos}
                                  player={player}
                                  onAddPlayer={() => openPlayerSelector(pos)}
                                  onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                  onSetCaptain={() => player && handleSetCaptain(player.id)}
                                  onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                  isCaptain={selectedLineup.captain === player?.id}
                                  isViceCaptain={selectedLineup.viceCaptain === player?.id}
                                />
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Row 6: Fullback */}
                        <div className="col-start-3">
                          {(() => {
                            const player = selectedLineup.players && Array.isArray(selectedLineup.players) ? selectedLineup.players.find(p => p.position === 15) : null;
                            return (
                              <PositionCard
                                position={15}
                                player={player}
                                onAddPlayer={() => openPlayerSelector(15)}
                                onRemovePlayer={() => player && handleRemovePlayerFromPosition(player.id)}
                                onSetCaptain={() => player && handleSetCaptain(player.id)}
                                onSetViceCaptain={() => player && handleSetViceCaptain(player.id)}
                                isCaptain={selectedLineup.captain === player?.id}
                                isViceCaptain={selectedLineup.viceCaptain === player?.id}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Status */}
                  {(() => {
                    const validation = getValidationStatus();
                    if (!validation) return null;
                    
                    return (
                      <div className="mt-6 p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400">
                        <div className="flex items-center gap-2 mb-2">
                          {validation.isValid ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <AlertCircle size={20} className="text-blue-600" />
                          )}
                          <h4 className="font-semibold text-text-primary">Lineup Status</h4>
                        </div>
                        <div className="text-sm text-text-secondary">
                          {validation.isValid ? (
                            <span className="text-green-600">✅ Complete lineup with all 15 positions filled</span>
                          ) : (
                            <div>
                              <div>⚠️ {validation.totalPlayers}/15 players assigned</div>
                              {validation.missingPositions.length > 0 && (
                                <div>Missing positions: {validation.missingPositions.join(', ')}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Substitutes Bench */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text-primary">Substitutes Bench</h3>
                      <button
                        onClick={() => {
                          setSelectedPosition('substitute');
                          setAvailablePlayers(getAvailablePlayers());
                          setShowPlayerSelector(true);
                        }}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <UserPlus size={16} />
                        Add Substitute
                      </button>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                      {selectedLineup.substitutes && Array.isArray(selectedLineup.substitutes) && selectedLineup.substitutes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {selectedLineup.substitutes.map((substitute, index) => (
                            <div
                              key={substitute.id || index}
                              className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text-primary">
                                  {substitute.firstName} {substitute.lastName}
                                </span>
                                <button
                                  onClick={() => handleRemovePlayerFromSubstitutes(substitute.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove substitute"
                                >
                                  <UserMinus size={14} />
                                </button>
                              </div>
                              <div className="text-xs text-text-secondary">
                                {substitute.position1}
                                {substitute.position2 && ` / ${substitute.position2}`}
                                {substitute.position3 && ` / ${substitute.position3}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-text-secondary">
                          <Users size={24} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No substitutes added yet</p>
                          <p className="text-xs">Click "Add Substitute" to add players to the bench</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="card mb-8"
              >
                <div className="p-6 text-center">
                  <div className="text-text-secondary mb-4">
                    <Trophy size={48} className="mx-auto mb-4 text-primary/40" />
                    <p className="text-lg font-medium">No Lineup Selected</p>
                    <p className="text-sm">Select a lineup from above or create a new one to view the formation</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Create Lineup Modal */}
        {showCreateLineup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Create New Lineup</h3>
              <form onSubmit={handleCreateLineup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Lineup Name
                    </label>
                    <input
                      type="text"
                      value={lineupForm.name}
                      onChange={(e) => setLineupForm({...lineupForm, name: e.target.value})}
                      className="form-input w-full"
                      placeholder="e.g., vs. Auckland Grammar"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Lineup Type
                    </label>
                    <select
                      value={lineupForm.type}
                      onChange={(e) => setLineupForm({...lineupForm, type: e.target.value})}
                      className="form-select w-full"
                    >
                      {LINEUP_SET_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Match Date
                    </label>
                    <input
                      type="date"
                      value={lineupForm.matchDate}
                      onChange={(e) => setLineupForm({...lineupForm, matchDate: e.target.value})}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Opponent
                    </label>
                    <input
                      type="text"
                      value={lineupForm.opponent}
                      onChange={(e) => setLineupForm({...lineupForm, opponent: e.target.value})}
                      className="form-input w-full"
                      placeholder="e.g., Auckland Grammar"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isHome"
                      checked={lineupForm.isHome}
                      onChange={(e) => setLineupForm({...lineupForm, isHome: e.target.checked})}
                      className="form-checkbox"
                    />
                    <label htmlFor="isHome" className="text-sm text-text-secondary">
                      Home Game
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={lineupForm.notes}
                      onChange={(e) => setLineupForm({...lineupForm, notes: e.target.value})}
                      className="form-textarea w-full"
                      rows="3"
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary flex-1">
                    Create Lineup
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateLineup(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Player Selector Modal */}
        {showPlayerSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">
                {selectedPosition === 'substitute' ? 'Add Player to Substitutes Bench' : `Select Player for Position ${selectedPosition}`}
              </h3>
              
              {availablePlayers.length === 0 ? (
                <div className="text-center py-6 text-text-secondary">
                  <Users size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No available players</p>
                  <p className="text-xs">All team players are already assigned to positions or substitutes</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availablePlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (selectedPosition === 'substitute') {
                          handleAddPlayerToSubstitutes(player);
                        } else {
                          handleAddPlayerToPosition(selectedPosition, player);
                        }
                      }}
                      className="w-full p-3 text-left border border-secondary-light rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="font-medium text-text-primary">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {player.position1}
                        {player.position2 && ` / ${player.position2}`}
                        {player.position3 && ` / ${player.position3}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowPlayerSelector(false);
                    setSelectedPosition(null);
                  }}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
    );
  } catch (renderError) {
    console.error('Error rendering TeamBuilder component:', renderError);
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-primary">
            <h2 className="text-2xl font-bold mb-4">Render Error in Team Builder</h2>
            <p className="text-white/80 mb-4">An error occurred while rendering the component</p>
            <details className="text-left text-white/80 mb-4">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="text-xs mt-2 bg-white/10 p-2 rounded overflow-auto">
                {renderError.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

// Position Card Component
const PositionCard = ({ 
  position, 
  player, 
  onAddPlayer, 
  onRemovePlayer, 
  onSetCaptain, 
  onSetViceCaptain,
  isCaptain,
  isViceCaptain
}) => {
  const getPositionName = (pos) => {
    if (pos <= 8) {
      const forwardPos = FORWARD_POSITIONS.find(p => p.number === pos);
      return forwardPos?.shortName || `#${pos}`;
    } else {
      const backPos = BACK_POSITIONS.find(p => p.number === pos);
      return backPos?.shortName || `#${pos}`;
    }
  };

  if (!player) {
    return (
      <div className="relative">
        <button
          onClick={onAddPlayer}
          className="w-20 h-24 border-2 border-dashed border-secondary-light rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors group"
        >
          <div className="text-4xl text-secondary-light group-hover:text-primary">+</div>
          <div className="text-xs text-secondary-light group-hover:text-primary text-center">
            {getPositionName(position)}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-20 h-24 bg-white rounded-lg border-2 border-primary shadow-lg overflow-hidden">
        {/* Player Photo Placeholder */}
        <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-2xl font-bold">
            {(player.firstName || '').charAt(0)}{(player.lastName || '').charAt(0)}
          </div>
        </div>
        
        {/* Player Info */}
        <div className="p-2 text-center">
          <div className="text-xs font-semibold text-text-primary truncate">
            {player.firstName} {player.lastName}
          </div>
          <div className="text-xs text-text-secondary">
            {getPositionName(position)}
          </div>
        </div>
        
        {/* Captain/Vice Captain Indicators */}
        {isCaptain && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Crown size={12} />
          </div>
        )}
        {isViceCaptain && (
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Shield size={12} />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute -top-1 -left-1 flex gap-1">
          <button
            onClick={onSetCaptain}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
              isCaptain ? 'bg-yellow-500' : 'bg-gray-400 hover:bg-yellow-500'
            }`}
            title={isCaptain ? 'Remove Captain' : 'Set as Captain'}
          >
            C
          </button>
          <button
            onClick={onSetViceCaptain}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
              isViceCaptain ? 'bg-blue-500' : 'bg-gray-400 hover:bg-blue-500'
            }`}
            title={isViceCaptain ? 'Remove Vice Captain' : 'Set as Vice Captain'}
          >
            VC
          </button>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={onRemovePlayer}
          className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Remove Player"
        >
          <UserMinus size={10} />
        </button>
      </div>
    </div>
  );
};

export default TeamBuilder;
