// Performance Dashboard for AURFC Hub
// Comprehensive performance analytics and insights

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy, 
  Target, 
  Clock, 
  Award,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Star
} from 'lucide-react';
import { getMatchAnalytics, getTeamSeasonStats } from '../services/advanced-stats';
import { getTeamById } from '../services/team';

const PerformanceDashboard = () => {
  const { currentUser: user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('season'); // week, month, season
  const [viewMode, setViewMode] = useState('overview'); // overview, players, matches

  useEffect(() => {
    if (user) {
      loadUserTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamPerformance();
    }
  }, [selectedTeam, timeRange]);

  const loadUserTeams = async () => {
    try {
      // This would typically come from user's team associations
      // For now, we'll use a mock approach
      setLoading(false);
    } catch (error) {
      console.error('Error loading user teams:', error);
      setError('Failed to load teams');
      setLoading(false);
    }
  };

  const loadTeamPerformance = async () => {
    if (!selectedTeam) return;
    
    try {
      setLoading(true);
      
      // Load season statistics
      const seasonStats = await getTeamSeasonStats(selectedTeam.id, '2024');
      setTeamStats(seasonStats);
      
      // Load recent matches (this would need to be implemented in the service)
      // For now, we'll use mock data
      setRecentMatches([
        {
          id: 'match-1',
          opponent: 'Rival Team A',
          date: '2024-01-15',
          result: 'W',
          score: '24-18',
          possession: 58,
          territory: 62,
          tries: 3,
          conversions: 2,
          penaltyGoals: 1
        },
        {
          id: 'match-2',
          opponent: 'Rival Team B',
          date: '2024-01-08',
          result: 'L',
          score: '15-22',
          possession: 45,
          territory: 48,
          tries: 2,
          conversions: 1,
          penaltyGoals: 1
        }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading team performance:', error);
      setError('Failed to load performance data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
                <p className="text-gray-600 mt-1">Track team and player performance metrics</p>
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
        {/* View Mode Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'players', name: 'Players', icon: Users },
                { id: 'matches', name: 'Matches', icon: Calendar },
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
        </div>

        {/* Overview Dashboard */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamStats ? `${Math.round((teamStats.wins / teamStats.totalMatches) * 100)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamStats?.totalPoints || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Possession</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamStats?.averagePossession || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Matches Played</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamStats?.totalMatches || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scoring Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scoring Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tries</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${teamStats ? (teamStats.totalTries / Math.max(teamStats.totalMatches * 3, 1)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{teamStats?.totalTries || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversions</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${teamStats ? (teamStats.totalConversions / Math.max(teamStats.totalMatches * 2, 1)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{teamStats?.totalConversions || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Penalty Goals</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${teamStats ? (teamStats.totalPenaltyGoals / Math.max(teamStats.totalMatches * 1, 1)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{teamStats?.totalPenaltyGoals || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
                <div className="space-y-3">
                  {recentMatches.slice(0, 5).map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          match.result === 'W' ? 'bg-green-500' : 
                          match.result === 'L' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">vs {match.opponent}</p>
                          <p className="text-xs text-gray-500">{match.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{match.score}</p>
                        <p className="text-xs text-gray-500">{match.possession}% possession</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Selection */}
            {!selectedTeam && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-6xl mb-4">🏉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Team</h3>
                <p className="text-gray-600 mb-4">Choose a team to view detailed performance metrics</p>
                <button 
                  onClick={() => setViewMode('teams')}
                  className="btn-primary"
                >
                  Browse Teams
                </button>
              </div>
            )}
          </div>
        )}

        {/* Players View */}
        {viewMode === 'players' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Player Performance</h3>
              <p className="text-gray-600">Individual player statistics and development tracking</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Player performance tracking coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {/* Matches View */}
        {viewMode === 'matches' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Match History</h3>
              <p className="text-gray-600">Detailed analysis of past matches and performance trends</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Match analysis features coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {/* Trends View */}
        {viewMode === 'trends' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <p className="text-gray-600">Track performance improvements and identify areas for development</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Trend analysis features coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
