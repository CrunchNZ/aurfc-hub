import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTeams } from '../services/team';
import { 
  createAttendanceRecord,
  getTeamAttendanceRecords,
  getTeamAttendanceStats,
  bulkUpdateAttendance,
  exportAttendanceData
} from '../services/attendance';

// ============================================================================
// ATTENDANCE COMPONENT - MAIN ATTENDANCE MANAGEMENT
// ============================================================================

const Attendance = () => {
  const { currentUser: user } = useAuth();
  
  // State management
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  // Statistics
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    averageAttendance: 0,
    attendanceRate: 0
  });

  // Load teams on component mount
  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  // Load attendance data when team changes
  useEffect(() => {
    if (selectedTeam) {
      loadAttendanceData();
    }
  }, [selectedTeam, dateFilter, customDateRange]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await getAllTeams();
      setTeams(teamsData);
      
      // Auto-select first team if available
      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
      }
    } catch (err) {
      setError('Failed to load teams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      
      // Get attendance records
      const records = await getTeamAttendanceRecords(selectedTeam.id);
      setAttendanceRecords(records);

      // Calculate date range for stats
      let startDate, endDate;
      const now = new Date();
      
      switch (dateFilter) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'custom':
          startDate = customDateRange.start;
          endDate = customDateRange.end;
          break;
        default:
          startDate = new Date(0); // Beginning of time
          endDate = now;
      }

      // Get statistics
      const teamStats = await getTeamAttendanceStats(selectedTeam.id, startDate, endDate);
      setStats(teamStats);
    } catch (err) {
      setError('Failed to load attendance data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = async (attendanceData) => {
    try {
      console.log('handleCreateAttendance called with:', attendanceData);
      console.log('Selected team:', selectedTeam);
      console.log('User:', user);

      if (!selectedTeam || !selectedTeam.id) {
        throw new Error('No team selected');
      }

      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }

      const recordData = {
        ...attendanceData,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        coachId: user.uid,
        createdBy: user.uid
      };

      console.log('Calling createAttendanceRecord with:', recordData);

      const newRecord = await createAttendanceRecord(recordData);

      console.log('Attendance record created successfully:', newRecord);

      setAttendanceRecords(prev => [newRecord, ...prev]);
      setShowCreateForm(false);
      loadAttendanceData(); // Refresh data
    } catch (err) {
      console.error('Error in handleCreateAttendance:', err);
      setError('Failed to create attendance record: ' + err.message);
    }
  };

  const handleBulkUpdate = async (attendanceId, playerUpdates) => {
    try {
      await bulkUpdateAttendance(attendanceId, playerUpdates);
      loadAttendanceData(); // Refresh data
      setShowAttendanceModal(false);
    } catch (err) {
      setError('Failed to update attendance: ' + err.message);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await exportAttendanceData(
        selectedTeam.id,
        customDateRange.start,
        customDateRange.end
      );
      
      // Create and download CSV
      const csvContent = convertToCSV(exportData);
      downloadCSV(csvContent, `${selectedTeam.name}_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      setError('Failed to export data: ' + err.message);
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Event', 'Date', 'Type', 'Present', 'Absent', 'Late', 'Total', 'Notes'];
    const rows = data.events.map(event => [
      event.eventName,
      new Date(event.eventDate.toDate()).toLocaleDateString(),
      event.eventType,
      event.presentCount,
      event.absentCount,
      event.lateCount,
      event.totalPlayers,
      event.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-primary">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <UserCheck size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-white/80">Please log in to access attendance management.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading attendance data...</p>
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
              <Calendar size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Attendance Management</h1>
              <p className="text-text-secondary">Track and manage team attendance for training sessions, matches, and events</p>
            </div>
          </div>
        </div>

        {/* Team Selection */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === e.target.value);
                    setSelectedTeam(team);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.ageGroup} ({team.type})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedTeam && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    New Attendance
                  </button>
                  <button
                    onClick={handleExport}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download size={20} />
                    Export
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

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
                onClick={() => setError('')}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {selectedTeam ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {['overview', 'records', 'reports'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Calendar size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Events</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircle size={24} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Present</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalPresent}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <XCircle size={24} className="text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Absent</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalAbsent}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Clock size={24} className="text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Late</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalLate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Attendance Rate</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Overall Attendance</span>
                          <span>{stats.attendanceRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{stats.averageAttendance}</p>
                        <p className="text-sm text-gray-600">Avg per event</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Events */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
                    <div className="space-y-3">
                      {attendanceRecords.slice(0, 5).map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{record.eventName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(record.eventDate.toDate()).toLocaleDateString()} - {record.eventType}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Present</p>
                              <p className="font-medium text-green-600">{record.presentCount}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Absent</p>
                              <p className="font-medium text-red-600">{record.absentCount}</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedEvent(record);
                                setShowAttendanceModal(true);
                              }}
                              className="btn-secondary btn-sm"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'records' && (
                <motion.div
                  key="records"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Filters */}
                  <div className="card p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="all">All Time</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {dateFilter === 'custom' && (
                      <div className="mt-4 flex gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={customDateRange.start.toISOString().split('T')[0]}
                            onChange={(e) => setCustomDateRange(prev => ({
                              ...prev,
                              start: new Date(e.target.value)
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={customDateRange.end.toISOString().split('T')[0]}
                            onChange={(e) => setCustomDateRange(prev => ({
                              ...prev,
                              end: new Date(e.target.value)
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance Records Table */}
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Present
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Absent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Late
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceRecords
                            .filter(record => 
                              record.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              record.eventType.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{record.eventName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(record.eventDate.toDate()).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  record.eventType === 'training' ? 'bg-blue-100 text-blue-800' :
                                  record.eventType === 'match' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {record.eventType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{record.presentCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{record.absentCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{record.lateCount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedEvent(record);
                                      setShowAttendanceModal(true);
                                    }}
                                    className="text-primary hover:text-primary-dark"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEvent(record);
                                      setShowAttendanceModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Report Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Events:</span>
                          <span className="font-medium">{stats.totalEvents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Attendance:</span>
                          <span className="font-medium">{stats.averageAttendance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attendance Rate:</span>
                          <span className="font-medium">{stats.attendanceRate}%</span>
                        </div>
                      </div>
                      <button
                        onClick={handleExport}
                        className="w-full mt-4 btn-primary"
                      >
                        <Download size={20} className="mr-2" />
                        Export Summary
                      </button>
                    </div>

                    <div className="card p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="w-full btn-secondary"
                        >
                          <Plus size={20} className="mr-2" />
                          Create New Record
                        </button>
                        <button
                          onClick={() => setActiveTab('overview')}
                          className="w-full btn-secondary"
                        >
                          <BarChart3 size={20} className="mr-2" />
                          View Statistics
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Selected</h3>
            <p className="text-gray-600">Please select a team to view attendance information.</p>
          </div>
        )}
      </motion.div>

      {/* Create Attendance Form Modal */}
      {showCreateForm && (
        <CreateAttendanceForm
          team={selectedTeam}
          onSubmit={handleCreateAttendance}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Attendance Detail Modal */}
      {showAttendanceModal && selectedEvent && (
        <AttendanceDetailModal
          event={selectedEvent}
          onUpdate={handleBulkUpdate}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Attendance;
