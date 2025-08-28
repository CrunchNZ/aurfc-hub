import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getAllTeams } from '../services/team';
import { 
  Users, 
  Trophy, 
  Target, 
  Shield, 
  TrendingUp, 
  Activity,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Settings,
  Plus,
  Search,
  X
} from 'lucide-react';

// ============================================================================
// TEAM BUILDER COMPONENT - COMPLETE IMPLEMENTATION
// ============================================================================

const TeamBuilder = () => {
  const { currentUser: user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  useEffect(() => {
    console.log('TeamBuilder useEffect triggered');
    console.log('User:', user);
    console.log('Auth loading:', authLoading);
    
    if (user && user.uid) {
      console.log('User authenticated, loading teams...');
      loadTeams();
    } else {
      console.log('User not authenticated or no UID');
    }
  }, [user, authLoading]);

  const loadTeams = async () => {
    try {
      console.log('loadTeams function called');
      setLoading(true);
      setError('');
      console.log('Calling getAllTeams...');
      const teamsData = await getAllTeams();
      console.log('getAllTeams response:', teamsData);
      setTeams(teamsData);
      console.log('Teams state updated:', teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.ageGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };

  const handleCloseTeamDetails = () => {
    setShowTeamDetails(false);
    setSelectedTeam(null);
  };

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
              <p className="text-white/80">Please log in to access the team builder.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading teams...</p>
          </div>
        </div>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Team Builder</h1>
              <p className="text-text-secondary">Build game day rosters and manage team lineups</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search teams by name, age group, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="text-sm text-text-secondary">
                {filteredTeams.length} of {teams.length} teams
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-red-200 bg-red-50 mb-6"
          >
            <div className="p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadTeams}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-text-secondary mb-4">
              <Users size={64} className="mx-auto mb-4 text-primary/40" />
              <p className="text-xl font-medium">No Teams Found</p>
              <p className="text-sm">Teams will appear here once they are created in Team</p>
            </div>
            <button
              onClick={() => window.location.href = '/team-management'}
              className="btn-primary"
            >
              Go to Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTeamSelect(team)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                          {team.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                              {team.ageGroup}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              team.type === 'Rippa' ? 'bg-purple-100 text-purple-800' :
                              team.type === 'Open' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {team.type}
                            </span>
                          </div>
                          {team.description && (
                            <p className="text-sm text-text-secondary line-clamp-2">
                              {team.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        team.active ? 'bg-green-500' : 'bg-red-500'
                      }`} title={team.active ? 'Active' : 'Inactive'} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>Max Players: {team.maxPlayers || 15}</span>
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {team.players ? team.players.length : 0}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="w-full btn-primary btn-sm">
                        GameDay
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Team Details Modal */}
        <AnimatePresence>
          {showTeamDetails && selectedTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={handleCloseTeamDetails}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">{selectedTeam.name}</h2>
                    <button
                      onClick={handleCloseTeamDetails}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Team Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Age Group</label>
                          <p className="text-text-primary">{selectedTeam.ageGroup}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Type</label>
                          <p className="text-text-primary">{selectedTeam.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedTeam.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedTeam.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Max Players</label>
                          <p className="text-text-primary">{selectedTeam.maxPlayers || 15}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Current Players</h3>
                      <div className="space-y-2">
                        {selectedTeam.players && selectedTeam.players.length > 0 ? (
                          selectedTeam.players.map((player, index) => (
                            <div key={player.id || index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">
                                  {player.firstName} {player.lastName}
                                </p>
                                <p className="text-sm text-text-secondary">{player.position1}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-text-secondary text-sm">No players assigned yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedTeam.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-text-secondary">{selectedTeam.description}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        handleCloseTeamDetails();
                        window.location.href = `/gameday?team=${selectedTeam.id}`;
                      }}
                      className="btn-primary flex-1"
                    >
                      Build Lineup
                    </button>
                    <button 
                      onClick={() => {
                        handleCloseTeamDetails();
                        window.location.href = `/team-management`;
                      }}
                      className="btn-secondary flex-1"
                    >
                      Manage Team
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TeamBuilder;
