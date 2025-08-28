import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/database';
import { getAllTeams, createTeam, updateTeam, deleteTeam, toggleTeamStatus, populateInitialTeams } from '../services/team';
import { 
  User, 
  Settings, 
  Shield, 
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  
  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: '',
    ageGroup: '',
    type: 'Open',
    description: '',
    maxPlayers: 15
  });

  // Mock data for admin dashboard
  const [adminData, setAdminData] = useState({
    clubOverview: {
      totalMembers: 687,
      activeMembers: 612,
      totalTeams: 12,
      monthlyRevenue: 24500,
      targetRevenue: 25000
    },
    financialHealth: {
      outstandingPayments: 3200,
      budgetUtilization: 78,
      sponsorshipRevenue: 8500,
      monthlyExpenses: 18500
    },
    strategicMetrics: {
      membershipGrowth: 12,
      teamPerformance: 8,
      facilityUtilization: 85,
      communitySatisfaction: 92
    },
    priorityActions: [
      {
        id: 1,
        title: 'Approve New Registrations',
        count: 23,
        priority: 'high',
        type: 'registration'
      },
      {
        id: 2,
        title: 'Review Monthly Budget',
        count: 1,
        priority: 'medium',
        type: 'financial'
      },
      {
        id: 3,
        title: 'Schedule Board Meeting',
        count: 1,
        priority: 'high',
        type: 'meeting'
      },
      {
        id: 4,
        title: 'Update Club Policies',
        count: 3,
        priority: 'medium',
        type: 'policy'
      }
    ],
    recentActivities: [
      {
        id: 1,
        action: 'New team registration approved',
        team: 'U16 Girls',
        time: '2 hours ago',
        type: 'success'
      },
      {
        id: 2,
        action: 'Monthly financial report generated',
        team: 'Finance',
        time: '4 hours ago',
        type: 'info'
      },
      {
        id: 3,
        action: 'Sponsorship agreement signed',
        team: 'Marketing',
        time: '6 hours ago',
        type: 'success'
      }
    ]
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        usersService.getAllUsers(),
        getAllTeams()
      ]);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Team management functions
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await createTeam({
        ...teamForm,
        createdBy: user.uid
      });
      
      setTeamForm({
        name: '',
        ageGroup: '',
        type: 'open',
        description: '',
        maxPlayers: 20
      });
      setShowAddTeam(false);
      loadData();
    } catch (error) {
      setError('Failed to create team: ' + error.message);
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
        type: 'open',
        description: '',
        maxPlayers: 20
      });
      loadData();
    } catch (error) {
      setError('Failed to update team: ' + error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(teamId);
        loadData();
      } catch (error) {
        setError('Failed to delete team: ' + error.message);
      }
    }
  };

  const handleToggleTeamStatus = async (teamId) => {
    try {
      await toggleTeamStatus(teamId);
      loadData();
    } catch (error) {
      setError('Failed to toggle team status: ' + error.message);
    }
  };

  const editTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      ageGroup: team.ageGroup,
      type: team.type,
      description: team.description || '',
      maxPlayers: team.maxPlayers || 20
    });
  };

  // Navigation functions
  const navigateToClubManagement = () => navigate('/club-management');
  const navigateToFinancialManagement = () => navigate('/financial-management');
  const navigateToMemberManagement = () => navigate('/member-management');
  const navigateToReports = () => navigate('/reports');
  const navigateToSystemAdmin = () => navigate('/system-admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Club Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.displayName || 'Admin'}! Here's your club overview.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Club Administrator
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Full Access
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Club Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-primary">
                  {adminData.clubOverview.totalMembers}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  {adminData.clubOverview.activeMembers} active
                </span>
                <span className="ml-1">({Math.round((adminData.clubOverview.activeMembers / adminData.clubOverview.totalMembers) * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${adminData.clubOverview.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className={`font-medium ${
                  adminData.clubOverview.monthlyRevenue >= adminData.clubOverview.targetRevenue 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {adminData.clubOverview.monthlyRevenue >= adminData.clubOverview.targetRevenue ? 'Above' : 'Below'}
                </span>
                <span className="ml-1">target (${adminData.clubOverview.targetRevenue.toLocaleString()})</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-blue-600">{adminData.clubOverview.totalTeams}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-600 font-medium">
                  {adminData.strategicMetrics.teamPerformance}/{adminData.clubOverview.totalTeams}
                </span>
                <span className="ml-1">teams performing well</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Facility Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{adminData.strategicMetrics.facilityUtilization}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-purple-600 font-medium">Optimal</span>
                <span className="ml-1">utilization rate</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex space-x-1 bg-secondary-light p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'teams'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Manage Teams
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'overview' && (
            <>
              {/* Overview content */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Total Users</h3>
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-accent-gold mb-2">{users.length}</div>
                <div className="text-text-secondary">Registered users</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Active Teams</h3>
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-accent-gold mb-2">
                  {teams.filter(team => team.active).length}
                </div>
                <div className="text-text-secondary">Active teams</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">System Status</h3>
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-500 mb-2">Active</div>
                <div className="text-text-secondary">All systems operational</div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-secondary">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary">User Management</h3>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Add User
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-secondary-light">
                        <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'coach' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'parent' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-primary hover:text-primary-dark mr-2">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-secondary">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary">Team</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      try {
                        setError(null);
                        await populateInitialTeams();
                        await loadData();
                        alert('Initial teams populated successfully!');
                      } catch (error) {
                        console.error('Error populating teams:', error);
                        setError('Failed to populate teams: ' + error.message);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Populate Initial Teams
                  </button>
                  <button 
                    onClick={() => setShowAddTeam(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Team
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Team Name</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Age Group</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id} className="border-b border-secondary-light">
                        <td className="py-3 px-4 font-medium">{team.name}</td>
                        <td className="py-3 px-4">{team.ageGroup}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            team.type === 'Rippa' ? 'bg-purple-100 text-purple-800' :
                            team.type === 'Open' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {team.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            team.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {team.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => editTeam(team)}
                            className="text-primary hover:text-primary-dark mr-2"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleTeamStatus(team.id, team.active)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                          >
                            {team.active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Team</h3>
            
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Under 12 Open"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Age Group
                </label>
                <select
                  value={teamForm.ageGroup}
                  onChange={(e) => setTeamForm({...teamForm, ageGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Age Group</option>
                  <option value="Under 6">Under 6</option>
                  <option value="Under 7">Under 7</option>
                  <option value="Under 8">Under 8</option>
                  <option value="Under 9">Under 9</option>
                  <option value="Under 10">Under 10</option>
                  <option value="Under 11">Under 11</option>
                  <option value="Under 12">Under 12</option>
                  <option value="Under 13">Under 13</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Team Type
                </label>
                <select
                  value={teamForm.type}
                  onChange={(e) => setTeamForm({...teamForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="rippa">Rippa</option>
                  <option value="open">Open</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Team description..."
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  value={teamForm.maxPlayers}
                  onChange={(e) => setTeamForm({...teamForm, maxPlayers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  max="50"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTeam(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-text-primary rounded-md hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Team</h3>
            
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Under 12 Open"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Age Group
                </label>
                <select
                  value={teamForm.ageGroup}
                  onChange={(e) => setTeamForm({...teamForm, ageGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Age Group</option>
                  <option value="Under 6">Under 6</option>
                  <option value="Under 7">Under 7</option>
                  <option value="Under 8">Under 8</option>
                  <option value="Under 9">Under 9</option>
                  <option value="Under 10">Under 10</option>
                  <option value="Under 11">Under 11</option>
                  <option value="Under 12">Under 12</option>
                  <option value="Under 13">Under 13</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Team Type
                </label>
                <select
                  value={teamForm.type}
                  onChange={(e) => setTeamForm({...teamForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="Rippa">Rippa</option>
                  <option value="Open">Open</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Team description..."
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  value={teamForm.maxPlayers}
                  onChange={(e) => setTeamForm({...teamForm, maxPlayers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  min="1"
                  max="50"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Update Team
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeam(null);
                    setTeamForm({
                      name: '',
                      ageGroup: '',
                      type: 'open',
                      description: '',
                      maxPlayers: 20
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-secondary text-text-primary rounded-md hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
