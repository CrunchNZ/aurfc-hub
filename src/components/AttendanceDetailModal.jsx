import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Save,
  Edit
} from 'lucide-react';

// ============================================================================
// ATTENDANCE DETAIL MODAL COMPONENT
// ============================================================================

const AttendanceDetailModal = ({ event, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [playerUpdates, setPlayerUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize player updates when modal opens
  React.useEffect(() => {
    if (event && event.players) {
      setPlayerUpdates(event.players.map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        status: player.status,
        checkInTime: player.checkInTime,
        checkOutTime: player.checkOutTime,
        notes: player.notes || ''
      })));
    }
  }, [event]);

  const handleStatusChange = (playerId, status) => {
    setPlayerUpdates(prev => prev.map(player => 
      player.playerId === playerId 
        ? { ...player, status }
        : player
    ));
  };

  const handleNotesChange = (playerId, notes) => {
    setPlayerUpdates(prev => prev.map(player => 
      player.playerId === playerId 
        ? { ...player, notes }
        : player
    ));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      await onUpdate(event.id, playerUpdates);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update attendance: ' + err.message);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'absent':
        return <XCircle size={16} className="text-red-600" />;
      case 'late':
        return <Clock size={16} className="text-orange-600" />;
      case 'excused':
        return <AlertCircle size={16} className="text-blue-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.toDate()).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      return new Date(time.toDate()).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Invalid Time';
    }
  };

  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.eventName}</h2>
            <p className="text-gray-600">
              {formatDate(event.eventDate)} - {event.eventType}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit size={20} />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Event Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{event.presentCount}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{event.absentCount}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-orange-600">{event.lateCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <p className="text-gray-900">{event.eventName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  event.eventType === 'training' ? 'bg-blue-100 text-blue-800' :
                  event.eventType === 'match' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {event.eventType}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-900">{formatDate(event.eventDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <p className="text-gray-900">{event.teamName}</p>
              </div>
              {event.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900">{event.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Player Attendance */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Player Attendance</h3>
              {isEditing && (
                <div className="text-sm text-gray-600">
                  {playerUpdates.filter(p => p.status === 'present').length} of {playerUpdates.length} present
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {playerUpdates.map((player) => (
                <div key={player.playerId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {player.playerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{player.playerName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getStatusIcon(player.status)}
                          <span className={getStatusColor(player.status)}>
                            {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <select
                          value={player.status}
                          onChange={(e) => handleStatusChange(player.playerId, e.target.value)}
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
                          onChange={(e) => handleNotesChange(player.playerId, e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Check In</p>
                          <p className="text-sm font-medium">{formatTime(player.checkInTime)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Check Out</p>
                          <p className="text-sm font-medium">{formatTime(player.checkOutTime)}</p>
                        </div>
                        {player.notes && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-sm font-medium">{player.notes}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceDetailModal;
