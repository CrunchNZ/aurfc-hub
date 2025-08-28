// Match Analysis for AURFC Hub
// Detailed match breakdowns, performance heatmaps, and strategy insights

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Map, 
  Clock, 
  Target, 
  Users,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Star,
  Play,
  Pause,
  Square,
  Zap
} from 'lucide-react';
import { getMatchAnalytics } from '../services/advanced-stats';

const MatchAnalysis = () => {
  const { currentUser: user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisView, setAnalysisView] = useState('overview'); // overview, timeline, heatmap, strategy

  // Mock match data for demonstration
  const mockMatches = [
    {
      id: 'match-1',
      teamName: 'All Blues',
      opponent: 'Rival Team A',
      date: '2024-01-15',
      result: 'W',
      score: '24-18',
      possession: 58,
      territory: 62,
      tries: 3,
      conversions: 2,
      penaltyGoals: 1,
      errors: 8,
      penalties: 5,
      duration: 80,
      status: 'completed'
    },
    {
      id: 'match-2',
      teamName: 'All Blues',
      opponent: 'Rival Team B',
      date: '2024-01-08',
      result: 'L',
      score: '15-22',
      possession: 45,
      territory: 48,
      tries: 2,
      conversions: 1,
      penaltyGoals: 1,
      errors: 12,
      penalties: 8,
      duration: 80,
      status: 'completed'
    },
    {
      id: 'match-3',
      teamName: 'All Blues',
      opponent: 'Rival Team C',
      date: '2024-01-01',
      result: 'W',
      score: '31-14',
      possession: 65,
      territory: 68,
      tries: 4,
      conversions: 3,
      penaltyGoals: 1,
      errors: 6,
      penalties: 3,
      duration: 80,
      status: 'completed'
    }
  ];

  // Mock detailed match data
  const mockMatchDetails = {
    'match-1': {
      periods: [
        {
          period: 1,
          startTime: '14:00',
          endTime: '14:40',
          teamScore: 14,
          opponentScore: 10,
          events: [
            { time: '2:15', type: 'try', player: 'John Smith', team: 'team', points: 5 },
            { time: '5:30', type: 'conversion', player: 'John Smith', team: 'team', points: 2 },
            { time: '12:45', type: 'try', player: 'Mike Johnson', team: 'team', points: 5 },
            { time: '15:20', type: 'conversion', player: 'John Smith', team: 'team', points: 2 },
            { time: '25:10', type: 'penalty_goal', player: 'John Smith', team: 'team', points: 3 },
            { time: '32:15', type: 'try', player: 'Opponent Player', team: 'opponent', points: 5 },
            { time: '38:45', type: 'penalty_goal', player: 'Opponent Player', team: 'opponent', points: 3 }
          ]
        },
        {
          period: 2,
          startTime: '14:45',
          endTime: '15:25',
          teamScore: 10,
          opponentScore: 8,
          events: [
            { time: '45:20', type: 'try', player: 'David Williams', team: 'team', points: 5 },
            { time: '52:10', type: 'penalty_goal', player: 'Opponent Player', team: 'opponent', points: 3 },
            { time: '65:30', type: 'penalty_goal', player: 'Opponent Player', team: 'opponent', points: 3 },
            { time: '72:15', type: 'penalty_goal', player: 'Opponent Player', team: 'opponent', points: 3 }
          ]
        }
      ],
      possessionTimeline: [
        { time: 0, team: 1, opponent: 0 },
        { time: 10, team: 0, opponent: 1 },
        { time: 20, team: 1, opponent: 0 },
        { time: 30, team: 1, opponent: 0 },
        { time: 40, team: 0, opponent: 1 },
        { time: 50, team: 1, opponent: 0 },
        { time: 60, team: 1, opponent: 0 },
        { time: 70, team: 0, opponent: 1 },
        { time: 80, team: 1, opponent: 0 }
      ],
      territoryTimeline: [
        { time: 0, team: 1, opponent: 0 },
        { time: 10, team: 1, opponent: 0 },
        { time: 20, team: 0, opponent: 1 },
        { time: 30, team: 1, opponent: 0 },
        { time: 40, team: 1, opponent: 0 },
        { time: 50, team: 1, opponent: 0 },
        { time: 60, team: 0, opponent: 1 },
        { time: 70, team: 1, opponent: 0 },
        { time: 80, team: 1, opponent: 0 }
      ],
      keyMoments: [
        { time: '2:15', description: 'Early try sets positive tone', impact: 'high' },
        { time: '25:10', description: 'Penalty goal extends lead', impact: 'medium' },
        { time: '45:20', description: 'Second half try secures win', impact: 'high' }
      ]
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      loadMatchDetails();
    }
  }, [selectedMatch]);

  const loadMatchDetails = async () => {
    if (!selectedMatch) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the database
      const details = mockMatchDetails[selectedMatch.id];
      setMatchData(details);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading match details:', error);
      setError('Failed to load match details');
      setLoading(false);
    }
  };

  const getResultColor = (result) => {
    return result === 'W' ? 'text-green-600 bg-green-100' : 
           result === 'L' ? 'text-red-600 bg-red-100' : 
           'text-gray-600 bg-gray-100';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time);
    const seconds = Math.round((time - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Match Analysis</h1>
                <p className="text-gray-600 mt-1">Detailed match breakdowns and strategy insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Match Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Matches</h3>
                <p className="text-sm text-gray-600">Select a match to analyze</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {mockMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedMatch?.id === match.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResultColor(match.result)}`}>
                          {match.result}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{match.score}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        vs {match.opponent}
                      </div>
                      <div className="text-xs text-gray-500">{match.date}</div>
                      
                      {/* Quick Stats */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-600">
                          <span className="font-medium">Poss:</span> {match.possession}%
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Terr:</span> {match.territory}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Match Analysis */}
          <div className="lg:col-span-3">
            {!selectedMatch ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Match</h3>
                <p className="text-gray-600">Choose a match from the sidebar to view detailed analysis</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Match Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMatch.teamName} vs {selectedMatch.opponent}
                      </h2>
                      <p className="text-gray-600">{selectedMatch.date} • {selectedMatch.duration} minutes</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getResultColor(selectedMatch.result)}`}>
                        {selectedMatch.result === 'W' ? 'Victory' : selectedMatch.result === 'L' ? 'Defeat' : 'Draw'}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mt-2">{selectedMatch.score}</div>
                    </div>
                  </div>
                </div>

                {/* Analysis View Tabs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'overview', name: 'Overview', icon: BarChart3 },
                        { id: 'timeline', name: 'Timeline', icon: Clock },
                        { id: 'heatmap', name: 'Heatmap', icon: Map },
                        { id: 'strategy', name: 'Strategy', icon: Target }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setAnalysisView(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                              analysisView === tab.id
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
                    {analysisView === 'overview' && (
                      <div className="space-y-6">
                        {/* Key Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedMatch.possession}%</div>
                            <div className="text-sm text-gray-600">Possession</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedMatch.territory}%</div>
                            <div className="text-sm text-gray-600">Territory</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedMatch.tries}</div>
                            <div className="text-sm text-gray-600">Tries</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedMatch.conversions}</div>
                            <div className="text-sm text-gray-600">Conversions</div>
                          </div>
                        </div>

                        {/* Performance Comparison */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Errors</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-900">{selectedMatch.errors}</span>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-red-600 h-2 rounded-full" 
                                    style={{ width: `${(selectedMatch.errors / 20) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Penalties</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-900">{selectedMatch.penalties}</span>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-600 h-2 rounded-full" 
                                    style={{ width: `${(selectedMatch.penalties / 15) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline Tab */}
                    {analysisView === 'timeline' && matchData && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900">Match Timeline</h4>
                        
                        {matchData.periods.map((period) => (
                          <div key={period.period} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h5 className="font-medium text-gray-900">
                                Period {period.period} ({period.startTime} - {period.endTime})
                              </h5>
                              <p className="text-sm text-gray-600">
                                Score: {period.teamScore} - {period.opponentScore}
                              </p>
                            </div>
                            <div className="p-4">
                              <div className="space-y-3">
                                {period.events.map((event, index) => (
                                  <div key={index} className="flex items-center space-x-4">
                                    <div className="w-16 text-sm font-mono text-gray-500">
                                      {event.time}
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${
                                      event.team === 'team' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}></div>
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900 capitalize">{event.type.replace('_', ' ')}</span>
                                      {event.player && (
                                        <span className="text-gray-600 ml-2">by {event.player}</span>
                                      )}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      +{event.points} pts
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Heatmap Tab */}
                    {analysisView === 'heatmap' && matchData && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900">Performance Heatmap</h4>
                        
                        {/* Possession Timeline */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h5 className="font-medium text-gray-900 mb-4">Possession Timeline</h5>
                          <div className="flex space-x-1">
                            {matchData.possessionTimeline.map((point, index) => (
                              <div key={index} className="flex-1">
                                <div className={`h-8 rounded ${
                                  point.team ? 'bg-blue-500' : 'bg-red-500'
                                }`}></div>
                                <div className="text-xs text-gray-500 text-center mt-1">
                                  {formatTime(point.time)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Team Possession</span>
                            <span>Opponent Possession</span>
                          </div>
                        </div>

                        {/* Territory Timeline */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h5 className="font-medium text-gray-900 mb-4">Territory Timeline</h5>
                          <div className="flex space-x-1">
                            {matchData.territoryTimeline.map((point, index) => (
                              <div key={index} className="flex-1">
                                <div className={`h-8 rounded ${
                                  point.team ? 'bg-green-500' : 'bg-orange-500'
                                }`}></div>
                                <div className="text-xs text-gray-500 text-center mt-1">
                                  {formatTime(point.time)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Team Territory</span>
                            <span>Opponent Territory</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strategy Tab */}
                    {analysisView === 'strategy' && matchData && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900">Strategy Insights</h4>
                        
                        {/* Key Moments */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h5 className="font-medium text-gray-900 mb-4">Key Moments</h5>
                          <div className="space-y-3">
                            {matchData.keyMoments.map((moment, index) => (
                              <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                                <div className="w-12 text-sm font-mono text-gray-500">
                                  {moment.time}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{moment.description}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(moment.impact)}`}>
                                  {moment.impact} impact
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-blue-50 rounded-lg p-6">
                          <h5 className="font-medium text-blue-900 mb-4">Strategic Recommendations</h5>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Maintain possession control</p>
                                <p className="text-sm text-blue-700">Your team showed excellent ball retention in the second half</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Reduce penalty count</p>
                                <p className="text-sm text-blue-700">Focus on discipline to avoid giving away easy points</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Build on set piece success</p>
                                <p className="text-sm text-blue-700">Strong performance in scrums and lineouts</p>
                              </div>
                            </div>
                          </div>
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

export default MatchAnalysis;
