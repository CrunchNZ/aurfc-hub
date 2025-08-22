import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  addPlayerToTeam,
  removePlayerFromTeam,
  updatePlayerInTeam,
  getTeamPlayers,
  getTeamRosterSummary,
  RUGBY_POSITIONS
} from '../services/team-players';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Save,
  X,
  User,
  Shield,
  Trophy,
  BarChart3,
  AlertCircle
} from 'lucide-react';

const TeamPlayers = ({ selectedTeam, onTeamUpdate }) => {
  const { currentUser: user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [rosterSummary, setRosterSummary] = useState(null);
  
  // Form states
  const [playerForm, setPlayerForm] = useState({
    firstName: '',
    lastName: '',
    position1: '',
    position2: '',
    position3: ''
  });

  useEffect(() => {
    if (selectedTeam) {
      loadPlayers();
      loadRosterSummary();
    }
  }, [selectedTeam]);

  const loadPlayers = async () => {
    if (!selectedTeam) return;
    
    try {
      setLoading(true);
      const playersData = await getTeamPlayers(selectedTeam.id);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const loadRosterSummary = async () => {
    if (!selectedTeam) return;
    
    try {
      const summary = await getTeamRosterSummary(selectedTeam.id);
      setRosterSummary(summary);
    } catch (error) {
      console.error('Error loading roster summary:', error);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!playerForm.firstName || !playerForm.position1) {
        setError('First name and primary position are required');
        return;
      }
      
      const playerData = {
        ...playerForm,
        addedBy: user.uid
      };
      
      const updatedTeam = await addPlayerToTeam(selectedTeam.id, playerData);
      
      // Update local state
      setPlayers(updatedTeam.players);
      setRosterSummary(await getTeamRosterSummary(selectedTeam.id));
      
      // Reset form and close modal only on success
      setPlayerForm({
        firstName: '',
        lastName: '',
        position1: '',
        position2: '',
        position3: ''
      });
      setShowAddPlayer(false);
      setError('');
      
      // Notify parent component
      if (onTeamUpdate) {
        onTeamUpdate(updatedTeam);
      }
      
    } catch (error) {
      console.error('Error adding player:', error);
      setError(`Failed to add player: ${error.message}`);
      // Don't close modal on error - let user see the error message
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!editingPlayer) return;
      
      const updates = {
        firstName: playerForm.firstName,
        lastName: playerForm.lastName,
        position1: playerForm.position1,
        position2: playerForm.position2 || null,
        position3: playerForm.position3 || null
      };
      
      const updatedTeam = await updatePlayerInTeam(selectedTeam.id, editingPlayer.id, updates);
      
      // Update local state
      setPlayers(updatedTeam.players);
      setRosterSummary(await getTeamRosterSummary(selectedTeam.id));
      
      // Reset form and close modal only on success
      setEditingPlayer(null);
      setPlayerForm({
        firstName: '',
        lastName: '',
        position1: '',
        position2: '',
        position3: ''
      });
      setShowEditPlayer(false);
      setError('');
      
      // Notify parent component
      if (onTeamUpdate) {
        onTeamUpdate(updatedTeam);
      }
      
    } catch (error) {
      console.error('Error updating player:', error);
      setError(`Failed to update player: ${error.message}`);
      // Don't close modal on error - let user see the error message
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to remove this player from the team?')) {
      return;
    }
    
    try {
      setLoading(true);
      const updatedTeam = await removePlayerFromTeam(selectedTeam.id, playerId);
      
      // Update local state
      setPlayers(updatedTeam.players);
      setRosterSummary(await getTeamRosterSummary(selectedTeam.id));
      
      // Notify parent component
      if (onTeamUpdate) {
        onTeamUpdate(updatedTeam);
      }
      
    } catch (error) {
      console.error('Error removing player:', error);
      setError(`Failed to remove player: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const editPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      firstName: player.firstName,
      lastName: player.lastName || '',
      position1: player.position1,
      position2: player.position2 || '',
      position3: player.position3 || ''
    });
    setShowEditPlayer(true);
  };

  const resetForm = () => {
    setPlayerForm({
      firstName: '',
      lastName: '',
      position1: '',
      position2: '',
      position3: ''
    });
    setEditingPlayer(null);
    setError('');
  };

  // Filter players based on search and position filter
  const filteredPlayers = players.filter(player => {
    const matchesSearch = !searchTerm || 
      player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.lastName && player.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPosition = !filterPosition || 
      player.position1 === filterPosition ||
      player.position2 === filterPosition ||
      player.position3 === filterPosition;
    
    return matchesSearch && matchesPosition;
  });

  if (!selectedTeam) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <Users size={48} className="mx-auto mb-4 text-primary/40" />
        <p>Please select a team to manage players</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Team Players</h2>
          <p className="text-text-secondary">Manage players for {selectedTeam.name}</p>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add Player
        </button>
      </div>

      {/* Roster Summary */}
      {rosterSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="card bg-primary/5 border-primary/20">
            <div className="p-4 text-center">
              <Users size={24} className="mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{rosterSummary.totalPlayers}</div>
              <div className="text-sm text-text-secondary">Total Players</div>
            </div>
          </div>
          
          <div className="card bg-accent-green/5 border-accent-green/20">
            <div className="p-4 text-center">
              <Shield size={24} className="mx-auto mb-2 text-accent-green" />
              <div className="text-2xl font-bold text-accent-green">{rosterSummary.activePlayers}</div>
              <div className="text-sm text-text-secondary">Active Players</div>
            </div>
          </div>
          
          <div className="card bg-accent-blue/5 border-accent-blue/20">
            <div className="p-4 text-center">
              <Trophy size={24} className="mx-auto mb-2 text-accent-blue" />
              <div className="text-2xl font-bold text-accent-blue">
                {Object.keys(rosterSummary.positions).length}
              </div>
              <div className="text-sm text-text-secondary">Positions Covered</div>
            </div>
          </div>
          
          <div className="card bg-accent-orange/5 border-accent-orange/20">
            <div className="p-4 text-center">
              <BarChart3 size={24} className="mx-auto mb-2 text-accent-orange" />
              <div className="text-2xl font-bold text-accent-orange">
                {Math.round((rosterSummary.activePlayers / rosterSummary.totalPlayers) * 100) || 0}%
              </div>
              <div className="text-sm text-text-secondary">Active Rate</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search players by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
        
        <div className="relative">
          <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="form-select pl-10"
          >
            <option value="">All Positions</option>
            {RUGBY_POSITIONS.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-red-50 border-red-200 text-red-800"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        </motion.div>
      )}

      {/* Players List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-secondary">Loading players...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Users size={48} className="mx-auto mb-4 text-primary/40" />
          <p>No players found</p>
          {searchTerm || filterPosition ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPosition('');
              }}
              className="btn-secondary mt-2"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => setShowAddPlayer(true)}
              className="btn-primary mt-2"
            >
              Add First Player
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {player.firstName} {player.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {player.position1}
                        </span>
                        {player.position2 && (
                          <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded-full">
                            {player.position2}
                          </span>
                        )}
                        {player.position3 && (
                          <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full">
                            {player.position3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editPlayer(player)}
                    className="btn-icon btn-icon-secondary"
                    title="Edit player"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="btn-icon btn-icon-danger"
                    title="Remove player"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Player Modal */}
      <AnimatePresence>
        {showAddPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Player to Team</h3>
                <button
                  onClick={() => {
                    setShowAddPlayer(false);
                    resetForm();
                  }}
                  className="btn-icon"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    value={playerForm.firstName}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Last Name (Optional)</label>
                  <input
                    type="text"
                    value={playerForm.lastName}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Position 1 *</label>
                  <select
                    value={playerForm.position1}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position1: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="">Select primary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Position 2 (Optional)</label>
                  <select
                    value={playerForm.position2}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position2: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Select secondary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Position 3 (Optional)</label>
                  <select
                    value={playerForm.position3}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position3: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Select tertiary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPlayer(false);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Add Player
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Player Modal */}
      <AnimatePresence>
        {showEditPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Player</h3>
                <button
                  onClick={() => {
                    setShowEditPlayer(false);
                    resetForm();
                  }}
                  className="btn-icon"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePlayer} className="space-y-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    value={playerForm.firstName}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Last Name (Optional)</label>
                  <input
                    type="text"
                    value={playerForm.lastName}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Position 1 *</label>
                  <select
                    value={playerForm.position1}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position1: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="">Select primary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Position 2 (Optional)</label>
                  <select
                    value={playerForm.position2}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position2: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Select secondary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Position 3 (Optional)</label>
                  <select
                    value={playerForm.position3}
                    onChange={(e) => setPlayerForm(prev => ({ ...prev, position3: e.target.value }))}
                    className="form-select"
                  >
                    <option value="">Select tertiary position</option>
                    {RUGBY_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPlayer(false);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Update Player
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPlayers;
