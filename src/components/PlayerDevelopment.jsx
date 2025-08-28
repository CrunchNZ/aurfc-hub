// Player Development Tracking for AURFC Hub
// Individual player performance analysis and development tracking

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  BarChart3,
  Star,
  Activity,
  Clock,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { getMatchAnalytics } from '../services/advanced-stats';

const PlayerDevelopment = () => {
  const { currentUser: user } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('season'); // week, month, season
  const [viewMode, setViewMode] = useState('overview'); // overview, performance, goals, trends

  // Mock player data for demonstration
  const mockPlayers = [
    {
      id: 'player-1',
      firstName: 'John',
      lastName: 'Smith',
      position: 'Fly Half',
      profileImage: null,
      age: 18,
      joinDate: '2023-01-15',
      currentForm: 'excellent',
      developmentStage: 'developing'
    },
    {
      id: 'player-2',
      firstName: 'Mike',
      lastName: 'Johnson',
      position: 'Prop',
      profileImage: null,
      age: 17,
      joinDate: '2023-03-20',
      currentForm: 'good',
      developmentStage: 'established'
    },
    {
      id: 'player-3',
      firstName: 'David',
      lastName: 'Williams',
      position: 'Scrum Half',
      profileImage: null,
      age: 16,
      joinDate: '2023-06-10',
      currentForm: 'improving',
      developmentStage: 'emerging'
    }
  ];

  // Mock performance data
  const mockPerformanceData = {
    'player-1': {
      matches: 12,
      tries: 8,
      conversions: 15,
      penaltyGoals: 3,
      dropGoals: 1,
      errors: 5,
      penalties: 2,
      timeOnField: 1080, // minutes
      timeOnBench: 120,
      performance: 85,
      trends: {
        tries: 'up',
        conversions: 'up',
        errors: 'down',
        penalties: 'stable'
      }
    },
    'player-2': {
      matches: 10,
      tries: 2,
      conversions: 0,
      penaltyGoals: 0,
      dropGoals: 0,
      errors: 8,
      penalties: 4,
      timeOnField: 900,
      timeOnBench: 180,
      performance: 72,
      trends: {
        tries: 'stable',
        conversions: 'stable',
        errors: 'down',
        penalties: 'down'
      }
    },
    'player-3': {
      matches: 8,
      tries: 3,
      conversions: 0,
      penaltyGoals: 0,
      dropGoals: 0,
      errors: 12,
      penalties: 6,
      timeOnField: 720,
      timeOnBench: 240,
      performance: 68,
      trends: {
        tries: 'up',
        conversions: 'stable',
        errors: 'down',
        penalties: 'down'
      }
    }
  };

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerStats();
    }
  }, [selectedPlayer, timeRange]);

  const loadPlayerStats = async () => {
    if (!selectedPlayer) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, we'll use mock data
      const stats = mockPerformanceData[selectedPlayer.id];
      setPlayerStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading player stats:', error);
      setError('Failed to load player statistics');
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFormColor = (form) => {
    switch (form) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'improving':
        return 'text-yellow-600 bg-yellow-100';
      case 'stable':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDevelopmentStageColor = (stage) => {
    switch (stage) {
      case 'emerging':
        return 'text-blue-600 bg-blue-100';
      case 'developing':
        return 'text-yellow-600 bg-yellow-100';
      case 'established':
        return 'text-green-600 bg-green-100';
      case 'elite':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Player Development</h1>
                <p className="text-gray-600 mt-1">Track individual player progress and development</p>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="form-select"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="season">This Season</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Player Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Players</h3>
                <p className="text-sm text-gray-600">Select a player to view details</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {mockPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedPlayer?.id === player.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {player.profileImage ? (
                            <img 
                              src={player.profileImage} 
                              alt={`${player.firstName} ${player.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {player.firstName[0]}{player.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{player.position}</p>
                        </div>
                      </div>
                      
                      {/* Performance Indicators */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFormColor(player.currentForm)}`}>
                          {player.currentForm}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDevelopmentStageColor(player.developmentStage)}`}>
                          {player.developmentStage}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player Details */}
          <div className="lg:col-span-3">
            {!selectedPlayer ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Player</h3>
                <p className="text-gray-600">Choose a player from the sidebar to view their development details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Player Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedPlayer.profileImage ? (
                        <img 
                          src={selectedPlayer.profileImage} 
                          alt={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-medium text-gray-600">
                          {selectedPlayer.firstName[0]}{selectedPlayer.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPlayer.firstName} {selectedPlayer.lastName}
                      </h2>
                      <p className="text-gray-600">{selectedPlayer.position}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">Age: {selectedPlayer.age}</span>
                        <span className="text-sm text-gray-500">Joined: {new Date(selectedPlayer.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFormColor(selectedPlayer.currentForm)}`}>
                        {selectedPlayer.currentForm}
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDevelopmentStageColor(selectedPlayer.developmentStage)} mt-2`}>
                        {selectedPlayer.developmentStage}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Mode Tabs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'overview', name: 'Overview', icon: BarChart3 },
                        { id: 'performance', name: 'Performance', icon: Activity },
                        { id: 'goals', name: 'Goals', icon: Target },
                        { id: 'trends', name: 'Trends', icon: TrendingUp }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                              viewMode === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{tab.name}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Overview Tab */}
                    {viewMode === 'overview' && playerStats && (
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{playerStats.matches}</div>
                            <div className="text-sm text-gray-600">Matches</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{playerStats.tries}</div>
                            <div className="text-sm text-gray-600">Tries</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{playerStats.conversions}</div>
                            <div className="text-sm text-gray-600">Conversions</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{playerStats.performance}</div>
                            <div className="text-sm text-gray-600">Performance</div>
                          </div>
                        </div>

                        {/* Performance Chart */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Tries</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(playerStats.tries / Math.max(playerStats.matches, 1)) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{playerStats.tries}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Conversions</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${(playerStats.conversions / Math.max(playerStats.matches, 1)) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{playerStats.conversions}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Errors</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-600 h-2 rounded-full" 
                                    style={{ width: `${(playerStats.errors / Math.max(playerStats.matches, 1)) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{playerStats.errors}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Tab */}
                    {viewMode === 'performance' && playerStats && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Match Statistics */}
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Matches Played:</span>
                                <span className="text-sm font-medium">{playerStats.matches}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Time on Field:</span>
                                <span className="text-sm font-medium">{Math.floor(playerStats.timeOnField / 60)}h {playerStats.timeOnField % 60}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Time on Bench:</span>
                                <span className="text-sm font-medium">{Math.floor(playerStats.timeOnBench / 60)}h {playerStats.timeOnBench % 60}m</span>
                              </div>
                            </div>
                          </div>

                          {/* Scoring Statistics */}
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Scoring Statistics</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Tries:</span>
                                <span className="text-sm font-medium">{playerStats.tries}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Conversions:</span>
                                <span className="text-sm font-medium">{playerStats.conversions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Penalty Goals:</span>
                                <span className="text-sm font-medium">{playerStats.penaltyGoals}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Drop Goals:</span>
                                <span className="text-sm font-medium">{playerStats.dropGoals}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goals Tab */}
                    {viewMode === 'goals' && (
                      <div className="text-center text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Goal setting and tracking features coming soon...</p>
                      </div>
                    )}

                    {/* Trends Tab */}
                    {viewMode === 'trends' && playerStats && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900">Performance Trends</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(playerStats.trends).map(([metric, trend]) => (
                            <div key={metric} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 capitalize">{metric}</span>
                                {getTrendIcon(trend)}
                              </div>
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  trend === 'up' ? 'bg-green-100 text-green-800' :
                                  trend === 'down' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {trend === 'up' ? 'Improving' : 
                                   trend === 'down' ? 'Declining' : 'Stable'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDevelopment;
