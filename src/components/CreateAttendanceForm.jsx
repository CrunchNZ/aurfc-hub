import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Save, 
  Plus,
  Trash2
} from 'lucide-react';
import { getTeamPlayers } from '../services/team';

// ============================================================================
// CREATE ATTENDANCE FORM COMPONENT
// ============================================================================

const CreateAttendanceForm = ({ team, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'training',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '18:00',
    notes: ''
  });

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load team players on component mount
  useEffect(() => {
    if (team) {
      loadTeamPlayers();
    }
  }, [team]);

  const loadTeamPlayers = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the team service
      // For now, we'll use a placeholder
      const teamPlayers = team.players || [];
      setPlayers(teamPlayers.map(player => ({
        ...player,
        status: 'present', // Default status
        checkInTime: null,
        checkOutTime: null,
        notes: ''
      })));
    } catch (err) {
      setError('Failed to load team players: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlayerStatusChange = (playerId, status) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, status }
        : player
    ));
  };

  const handlePlayerNotesChange = (playerId, notes) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, notes }
        : player
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (!formData.eventName.trim()) {
        setError('Event name is required');
        return;
      }

      if (!formData.eventDate) {
        setError('Event date is required');
        return;
      }

      if (!team || !team.id) {
        setError('Team information is missing');
        return;
      }

      console.log('Creating attendance data:', {
        formData,
        team,
        players: players.length
      });

      const attendanceData = {
        eventId: `event-${Date.now()}`,
        eventName: formData.eventName.trim(),
        eventType: formData.eventType,
        eventDate: new Date(`${formData.eventDate}T${formData.eventTime}`),
        notes: formData.notes.trim(),
        players: players.map(player => ({
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          status: player.status,
          checkInTime: player.checkInTime,
          checkOutTime: player.checkOutTime,
          notes: player.notes
        }))
      };

      console.log('Final attendance data:', attendanceData);
      onSubmit(attendanceData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('Failed to create attendance: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team players...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Attendance Record</h2>
            <p className="text-gray-600">Set up attendance tracking for {team?.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="e.g., Tuesday Training, Match vs Team X"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="training">Training Session</option>
                <option value="match">Match</option>
                <option value="event">Event</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Time
              </label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about the event..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Player Attendance */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Player Attendance</h3>
              <div className="text-sm text-gray-600">
                {players.filter(p => p.status === 'present').length} of {players.length} present
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {player.firstName?.[0]}{player.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {player.position1 || 'Position not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={player.status}
                      onChange={(e) => handlePlayerStatusChange(player.id, e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-0 ${getStatusColor(player.status)}`}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Notes..."
                      value={player.notes}
                      onChange={(e) => handlePlayerNotesChange(player.id, e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Create Attendance Record
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAttendanceForm;
