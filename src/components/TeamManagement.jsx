import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from '../services/team';
import { getUsersByRole } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import TeamPlayers from './TeamPlayers';
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
  Settings
} from 'lucide-react';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [error, setError] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    ageGroup: '',
    type: 'Open',
    description: '',
    maxPlayers: 15
  });

  const { currentUser: user } = useAuth();

  useEffect(() => {
      if (user) {
      loadTeams();
    }
  }, [user]);

  const loadTeams = async () => {
        try {
      setLoading(true);
      const teamsData = await getAllTeams();
      setTeams(teamsData);
        } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating team with data:', teamForm);
      console.log('Current user:', user);
      
      // Validate required fields
      if (!teamForm.name || !teamForm.ageGroup) {
        setError('Team name and age group are required');
        return;
      }
      
      const teamData = {
        ...teamForm,
        createdBy: user.uid,
        maxPlayers: parseInt(teamForm.maxPlayers) || 15
      };
      
      console.log('Team data being sent:', teamData);
      const result = await createTeam(teamData);
      console.log('Team created successfully:', result);
      
      setShowAddTeam(false);
      setTeamForm({
        name: '',
        ageGroup: '',
        type: 'Open',
        description: '',
        maxPlayers: 15
      });
      setError(''); // Clear any previous errors
      loadTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      setError(`Failed to create team: ${error.message}`);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      await updateTeam(editingTeam.id, teamForm);
      setEditingTeam(null);
      setTeamForm({
        name: '',
        ageGroup: '',
        type: 'Open',
        description: '',
        maxPlayers: 15
      });
      loadTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(teamId);
        loadTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        setError('Failed to delete team');
      }
    }
  };

  const handleToggleTeamStatus = async (teamId, currentStatus) => {
    try {
      await toggleTeamStatus(teamId, !currentStatus);
      loadTeams();
    } catch (error) {
      console.error('Error toggling team status:', error);
      setError('Failed to update team status');
    }
  };

  const editTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      ageGroup: team.ageGroup,
      type: team.type,
      description: team.description,
      maxPlayers: team.maxPlayers
    });
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
              <p className="text-white/80">Please log in to access team management.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'teams',
      label: 'Team Management',
      icon: Users,
      description: 'Create and manage rugby teams'
    },
    {
      id: 'players',
      label: 'Team Players',
      icon: UserCheck,
      description: 'Manage players within teams'
    },
    {
      id: 'team-builder',
      label: 'Team Builder',
      icon: Trophy,
      description: 'Build game day rosters'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      description: 'Track player attendance'
    },
    {
      id: 'overview',
      label: 'Team Overview',
      icon: Shield,
      description: 'View all teams and their status'
    }
  ];

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
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-white/80 text-lg">Create and manage rugby teams for different age groups</p>
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

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg transform scale-105'
                      : 'bg-secondary-light text-text-secondary hover:bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon 
                    size={24} 
                    className={`mb-2 ${
                      isActive ? 'text-white' : 'text-primary'
                    }`}
                  />
                  <span className="text-sm font-medium text-center mb-1">
                    {tab.label}
                  </span>
                  <span className={`text-xs text-center ${
                    isActive ? 'text-white/80' : 'text-text-secondary'
                  }`}>
                    {tab.description}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-8"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users size={24} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Team Management</h2>
                  </div>
                  <button
                    onClick={() => setShowAddTeam(true)}
                    className="btn-primary"
                  >
                    Add New Team
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-text-secondary">Loading teams...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-secondary-light">
                          <th className="text-left p-3 text-text-secondary font-medium">Team Name</th>
                          <th className="text-left p-3 text-text-secondary font-medium">Age Group</th>
                          <th className="text-left p-3 text-text-secondary font-medium">Type</th>
                          <th className="text-left p-3 text-text-secondary font-medium">Status</th>
                          <th className="text-left p-3 text-text-secondary font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team) => (
                          <tr key={team.id} className="border-b border-secondary-light/30 hover:bg-secondary-light/20">
                            <td className="p-3">
                              <div>
                                <div className="font-medium text-text-primary">{team.name}</div>
                                {team.description && (
                                  <div className="text-sm text-text-secondary">{team.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-text-secondary">{team.ageGroup}</td>
                            <td className="p-3 text-text-secondary">{team.type}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                team.active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {team.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editTeam(team)}
                                  className="btn-secondary btn-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleTeamStatus(team.id, team.active)}
                                  className={`btn-sm ${
                                    team.active ? 'btn-warning' : 'btn-success'
                                  }`}
                                >
                                  {team.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(team.id)}
                                  className="btn-danger btn-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-8"
            >
              <div className="p-6">
                {!selectedTeam && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Select a Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teams.map((team) => (
                        <motion.button
                          key={team.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTeam(team)}
                          className="p-4 rounded-lg border-2 border-secondary-light hover:border-primary text-left transition-all bg-white hover:bg-primary/5"
                        >
                          <div className="font-semibold text-text-primary">{team.name}</div>
                          <div className="text-sm text-text-secondary">{team.ageGroup} - {team.type}</div>
                          <div className="text-xs text-text-secondary mt-1">
                            {team.players ? `${team.players.length} players` : '0 players'}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTeam ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary">
                          Managing Players: {selectedTeam.name}
                        </h3>
                        <p className="text-text-secondary">{selectedTeam.ageGroup} - {selectedTeam.type}</p>
                      </div>
                      <button
                        onClick={() => setSelectedTeam(null)}
                        className="btn-secondary"
                      >
                        Change Team
                      </button>
                    </div>
                    
                    <TeamPlayers 
                      selectedTeam={selectedTeam} 
                      onTeamUpdate={(updatedTeam) => {
                        // Update the team in the local state
                        setTeams(prev => prev.map(t => 
                          t.id === updatedTeam.id ? updatedTeam : t
                        ));
                        setSelectedTeam(updatedTeam);
                      }}
                    />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-text-secondary mb-4">
                      <UserCheck size={48} className="mx-auto mb-4 text-primary/40" />
                      <p className="text-lg font-medium">No Teams Available</p>
                      <p className="text-sm">Create a team first before managing players</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('teams');
                        setShowAddTeam(true);
                      }}
                      className="btn-primary"
                    >
                      Create Your First Team
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {activeTab === 'team-builder' && (
            <motion.div
              key="team-builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-8"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy size={24} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">Team Builder</h2>
                </div>
                
                <div className="text-center py-8">
                  <div className="text-text-secondary mb-4">
                    <Trophy size={48} className="mx-auto mb-4 text-primary/40" />
                    <p className="text-lg font-medium">Team Builder Coming Soon</p>
                    <p className="text-sm">Build game day rosters and manage team lineups</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/team-builder'}
                    className="btn-primary"
                  >
                    Go to Team Builder
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-8"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <UserCheck size={24} className="text-accent-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">Attendance Tracking</h2>
                </div>
                
                <div className="text-center py-8">
                  <div className="text-text-secondary mb-4">
                    <UserCheck size={48} className="mx-auto mb-4 text-accent-green/40" />
                    <p className="text-lg font-medium">Attendance System Coming Soon</p>
                    <p className="text-sm">Track player attendance for training and games</p>
                  </div>
                  <button className="btn-secondary">
                    Set Up Attendance
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-8"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <TrendingUp size={24} className="text-accent-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">Team Overview</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="card-secondary text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{teams.length}</div>
                    <div className="text-text-secondary">Total Teams</div>
                  </div>
                  <div className="card-secondary text-center">
                    <div className="text-3xl font-bold text-accent-green mb-2">
                      {teams.filter(t => t.active).length}
                    </div>
                    <div className="text-text-secondary">Active Teams</div>
                  </div>
                  <div className="card-secondary text-center">
                    <div className="text-3xl font-bold text-accent-gold mb-2">
                      {teams.filter(t => !t.active).length}
                    </div>
                    <div className="text-text-secondary">Inactive Teams</div>
                  </div>
                </div>

                <div className="bg-secondary-light/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-text-primary mb-4">Team Categories:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Age Groups:</h4>
                      <div className="space-y-1">
                        {Array.from(new Set(teams.map(t => t.ageGroup))).map(ageGroup => (
                          <div key={ageGroup} className="text-sm text-text-secondary">
                            • {ageGroup}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Team Types:</h4>
                      <div className="space-y-1">
                        {Array.from(new Set(teams.map(t => t.type))).map(type => (
                          <div key={type} className="text-sm text-text-secondary">
                            • {type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Team Modal */}
        {showAddTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Add New Team</h3>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Age Group
                    </label>
                    <input
                      type="text"
                      value={teamForm.ageGroup}
                      onChange={(e) => setTeamForm({...teamForm, ageGroup: e.target.value})}
                      className="form-input w-full"
                      placeholder="e.g., Under 6, Under 7"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Type
                    </label>
                    <select
                      value={teamForm.type}
                      onChange={(e) => setTeamForm({...teamForm, type: e.target.value})}
                      className="form-select w-full"
                    >
                      <option value="Open">Open</option>
                      <option value="Restricted">Restricted</option>
                      <option value="Rippa">Rippa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      className="form-textarea w-full"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Max Players
                    </label>
                    <input
                      type="number"
                      value={teamForm.maxPlayers}
                      onChange={(e) => setTeamForm({...teamForm, maxPlayers: parseInt(e.target.value)})}
                      className="form-input w-full"
                      min="1"
                      max="30"
                    />
              </div>
            </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary flex-1">
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTeam(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Team Modal */}
        {editingTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Edit Team</h3>
              <form onSubmit={handleUpdateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Age Group
                    </label>
                    <input
                      type="text"
                      value={teamForm.ageGroup}
                      onChange={(e) => setTeamForm({...teamForm, ageGroup: e.target.value})}
                      className="form-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Type
                    </label>
                    <select
                      value={teamForm.type}
                      onChange={(e) => setTeamForm({...teamForm, type: e.target.value})}
                      className="form-select w-full"
                    >
                      <option value="Open">Open</option>
                      <option value="Restricted">Restricted</option>
                      <option value="Rippa">Rippa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      className="form-textarea w-full"
                      rows="3"
                    />
                  </div>
                      <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Max Players
                    </label>
                    <input
                      type="number"
                      value={teamForm.maxPlayers}
                      onChange={(e) => setTeamForm({...teamForm, maxPlayers: parseInt(e.target.value)})}
                      className="form-input w-full"
                      min="1"
                      max="30"
                    />
                      </div>
                    </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary flex-1">
                    Update Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
                  </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default TeamManagement;
