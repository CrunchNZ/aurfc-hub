// Season Statistics for AURFC Hub
// Team rankings, performance trends, and season overview

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  BarChart3,
  Star,
  Activity,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Medal,
  Flag
} from 'lucide-react';
import { getTeamSeasonStats } from '../services/advanced-stats';

const SeasonStatistics = () => {
  const { currentUser: user } = useAuth();
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // overview, rankings, trends, players

  // Mock season data for demonstration
  const mockSeasonData = {
    '2024': {
      totalMatches: 15,
      wins: 11,
      losses: 3,
      draws: 1,
      totalPoints: 342,
      totalTries: 45,
      totalConversions: 38,
      totalPenaltyGoals: 12,
      totalDropGoals: 2,
      totalErrors: 89,
      totalPenalties: 67,
      totalTurnovers: 34,
      averagePossession: 58,
      averageTerritory: 61,
      winRate: 73.3,
      pointsPerMatch: 22.8,
      triesPerMatch: 3.0,
      conversionRate: 84.4,
      discipline: 78.5,
      teams: [
        {
          id: 'team-1',
          name: 'All Blues',
          matches: 15,
          wins: 11,
          losses: 3,
          draws: 1,
          points: 342,
          tries: 45,
          conversions: 38,
          penaltyGoals: 12,
          dropGoals: 2,
          errors: 89,
          penalties: 67,
          turnovers: 34,
          possession: 58,
          territory: 61,
          winRate: 73.3,
          rank: 1
        },
        {
          id: 'team-2',
          name: 'Rival Team A',
          matches: 15,
          wins: 10,
          losses: 4,
          draws: 1,
          points: 298,
          tries: 38,
          conversions: 32,
          penaltyGoals: 8,
          dropGoals: 1,
          errors: 95,
          penalties: 72,
          turnovers: 41,
          possession: 52,
          territory: 55,
          winRate: 66.7,
          rank: 2
        },
        {
          id: 'team-3',
          name: 'Rival Team B',
          matches: 15,
          wins: 8,
          losses: 6,
          draws: 1,
          points: 267,
          tries: 32,
          conversions: 28,
          penaltyGoals: 10,
          dropGoals: 0,
          errors: 102,
          penalties: 78,
          turnovers: 45,
          possession: 48,
          territory: 51,
          winRate: 53.3,
          rank: 3
        }
      ],
      monthlyTrends: [
        { month: 'Jan', wins: 3, losses: 1, points: 89, tries: 12 },
        { month: 'Feb', wins: 2, losses: 1, points: 67, tries: 9 },
        { month: 'Mar', wins: 2, losses: 0, points: 78, tries: 10 },
        { month: 'Apr', wins: 2, losses: 1, points: 71, tries: 8 },
        { month: 'May', wins: 2, losses: 0, points: 37, tries: 6 }
      ],
      topPlayers: [
        {
          id: 'player-1',
          name: 'John Smith',
          position: 'Fly Half',
          matches: 15,
          tries: 8,
          conversions: 25,
          penaltyGoals: 8,
          totalPoints: 89,
          performance: 92
        },
        {
          id: 'player-2',
          name: 'Mike Johnson',
          position: 'Prop',
          matches: 14,
          tries: 3,
          conversions: 0,
          penaltyGoals: 0,
          totalPoints: 15,
          performance: 88
        },
        {
          id: 'player-3',
          name: 'David Williams',
          position: 'Scrum Half',
          matches: 13,
          tries: 5,
          conversions: 0,
          penaltyGoals: 0,
          totalPoints: 25,
          performance: 85
        }
      ]
    }
  };

  useEffect(() => {
    loadSeasonData();
  }, [selectedSeason]);

  const loadSeasonData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the database
      const data = mockSeasonData[selectedSeason];
      setSeasonData(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading season data:', error);
      setError('Failed to load season data');
      setLoading(false);
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 80) return 'text-green-600 bg-green-100';
    if (winRate >= 60) return 'text-blue-600 bg-blue-100';
    if (winRate >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank === 2) return 'text-gray-600 bg-gray-100';
    if (rank === 3) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading season statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Statistics</h2>
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
                <h1 className="text-3xl font-bold text-gray-900">Season Statistics</h1>
                <p className="text-gray-600 mt-1">Comprehensive season overview and team rankings</p>
              </div>
              
              {/* Season Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="form-select"
                >
                  <option value="2024">2024 Season</option>
                  <option value="2023">2023 Season</option>
                  <option value="2022">2022 Season</option>
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
                { id: 'rankings', name: 'Rankings', icon: Trophy },
                { id: 'trends', name: 'Trends', icon: TrendingUp },
                { id: 'players', name: 'Top Players', icon: Users }
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
        {viewMode === 'overview' && seasonData && (
          <div className="space-y-8">
            {/* Season Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{seasonData.totalMatches}</div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{seasonData.wins}</div>
                  <div className="text-sm text-gray-600">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{seasonData.losses}</div>
                  <div className="text-sm text-gray-600">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{seasonData.draws}</div>
                  <div className="text-sm text-gray-600">Draws</div>
                </div>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{seasonData.winRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Points per Match</p>
                    <p className="text-2xl font-bold text-gray-900">{seasonData.pointsPerMatch}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{seasonData.averagePossession}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900">{seasonData.totalPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tries</p>
                    <p className="text-2xl font-bold text-gray-900">{seasonData.totalTries}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Award className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{seasonData.conversionRate}%</p>
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
                          style={{ width: `${(seasonData.totalTries / (seasonData.totalTries + seasonData.totalPenaltyGoals + seasonData.totalDropGoals)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{seasonData.totalTries}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Penalty Goals</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(seasonData.totalPenaltyGoals / (seasonData.totalTries + seasonData.totalPenaltyGoals + seasonData.totalDropGoals)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{seasonData.totalPenaltyGoals}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Drop Goals</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(seasonData.totalDropGoals / (seasonData.totalTries + seasonData.totalPenaltyGoals + seasonData.totalDropGoals)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{seasonData.totalDropGoals}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                <div className="space-y-3">
                  {seasonData.monthlyTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600">W: {month.wins}</span>
                          <span className="text-xs text-red-600">L: {month.losses}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{month.points} pts</p>
                        <p className="text-xs text-gray-500">{month.tries} tries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rankings View */}
        {viewMode === 'rankings' && seasonData && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Rankings</h3>
              <p className="text-gray-600">Current season standings and performance metrics</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {seasonData.teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(team.rank)}`}>
                        {team.rank}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-500">{team.matches} matches</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{team.points}</p>
                        <p className="text-xs text-gray-500">Points</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{team.tries}</p>
                        <p className="text-xs text-gray-500">Tries</p>
                      </div>
                      <div className="text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWinRateColor(team.winRate)}`}>
                          {team.winRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends View */}
        {viewMode === 'trends' && seasonData && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <p className="text-gray-600">Track performance improvements and identify development areas</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Advanced trend analysis features coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Players View */}
        {viewMode === 'players' && seasonData && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <p className="text-gray-600">Leading players by performance and contribution</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {seasonData.topPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'text-yellow-600 bg-yellow-100' :
                        index === 1 ? 'text-gray-600 bg-gray-100' :
                        index === 2 ? 'text-orange-600 bg-orange-100' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{player.name}</h4>
                        <p className="text-sm text-gray-500">{player.position}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{player.totalPoints}</p>
                        <p className="text-xs text-gray-500">Points</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{player.tries}</p>
                        <p className="text-xs text-gray-500">Tries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{player.matches}</p>
                        <p className="text-xs text-gray-500">Matches</p>
                      </div>
                      <div className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {player.performance}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonStatistics;
