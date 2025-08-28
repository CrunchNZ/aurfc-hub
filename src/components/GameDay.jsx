import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Play, Pause, Square, Clock, Users, Trophy } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  getTeamById,
  getAllTeams
} from '../services/team';
import {
  createMatch,
  getMatch,
  getTeamMatches,
  updateMatch,
  startMatchTimer,
  pauseMatchTimer,
  resumeMatchTimer,
  endPeriod,
  recordEvent,
  togglePossession,
  toggleTerritory
} from '../services/gameday';

const GameDay = () => {
  console.log('🔍 GameDay component initializing...');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser: user, loading: authLoading } = useAuth();
  
  console.log('🔍 GameDay component initialized with:', { user, authLoading });
  
  // Core state management
  const [team, setTeam] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableTeams, setAvailableTeams] = useState([]);
  
  // Match state with proper initialization
  const [matchTime, setMatchTime] = useState(0);
  const [timerState, setTimerState] = useState('stopped');
  const [currentPeriod, setCurrentPeriod] = useState(1);
  
  // UI state
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [scoringEvent, setScoringEvent] = useState(null);
  
  // Match form
  const [matchForm, setMatchForm] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Timer
  const [timerInterval, setTimerInterval] = useState(null);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false);
  
  // Data persistence flags
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  console.log('🔍 State initialized successfully');

  // Robust state management functions
  const safeSetMatch = (newMatch) => {
    if (newMatch && typeof newMatch === 'object') {
      console.log('🔒 Safe setting match:', newMatch.id);
      setMatch(newMatch);
      setLastSaved(new Date());
    } else {
      console.error('❌ Invalid match data:', newMatch);
    }
  };

  const safeSetTeam = (newTeam) => {
    if (newTeam && typeof newTeam === 'object') {
      console.log('🔒 Safe setting team:', newTeam.id);
      setTeam(newTeam);
    } else {
      console.error('❌ Invalid team data:', newTeam);
    }
  };

  // Prevent accidental state clearing
  const clearState = () => {
    console.log('⚠️ Clearing state - this should only happen on explicit user action');
    setMatch(null);
    setTeam(null);
    setError('');
    setShowCreateMatch(false);
    setShowScoringModal(false);
    setScoringEvent(null);
  };

  // Rugby field positions (vertical layout - 8 rows x 7 columns)
  const ALL_POSITIONS = [
    // Front row - more horizontal spacing
    { id: 'prop1', name: 'Prop 1', x: 2.5, y: 1, number: 1 },
    { id: 'hooker', name: 'Hooker', x: 3.5, y: 1, number: 2 },
    { id: 'prop2', name: 'Prop 2', x: 4.5, y: 1, number: 3 },
    
    // Second row - locks moved lower to prevent overlap
    { id: 'lock1', name: 'Lock 1', x: 2.5, y: 2.4, number: 4 },
    { id: 'lock2', name: 'Lock 2', x: 4.5, y: 2.4, number: 5 },
    
    // Back row - more horizontal spacing
    { id: 'flanker1', name: 'Flanker 1', x: 1.5, y: 3.4, number: 6 },
    { id: 'number8', name: 'Number 8', x: 3.5, y: 3.4, number: 8 },
    { id: 'flanker2', name: 'Flanker 2', x: 5.5, y: 3.4, number: 7 },
    
    // Half backs - extra vertical spacing
    { id: 'scrumhalf', name: 'Scrum Half', x: 3.5, y: 4.6, number: 9 },
    { id: 'flyhalf', name: 'Fly Half', x: 3.5, y: 5.8, number: 10 },
    
    // Centers - more horizontal spacing
    { id: 'insidecenter', name: 'Inside Center', x: 2.5, y: 6.4, number: 12 },
    { id: 'outsidecenter', name: 'Outside Center', x: 4.5, y: 6.4, number: 13 },
    
    // Back three - more horizontal spacing
    { id: 'wing1', name: 'Wing 1', x: 1.5, y: 7.4, number: 11 },
    { id: 'fullback', name: 'Fullback', x: 3.5, y: 7.4, number: 15 },
    { id: 'wing2', name: 'Wing 2', x: 5.5, y: 7.4, number: 14 }
  ];

  // Scoring constants
  const SCORING = {
    TRY: { points: 5, description: 'Try' },
    CONVERSION: { points: 2, description: 'Conversion' },
    PENALTY_GOAL: { points: 3, description: 'Penalty Goal' },
    DROP_GOAL: { points: 3, description: 'Drop Goal' }
  };

  // Load team data when component mounts
  useEffect(() => {
    try {
      console.log('🔄 GameDay useEffect triggered:', { authLoading, user });
      if (!authLoading && user) {
        console.log('🔍 Auth loading complete, calling loadTeamData...');
        loadTeamData();
      }
    } catch (error) {
      console.error('❌ Error in useEffect:', error);
      setError(`Error in component initialization: ${error.message}`);
    }
  }, [authLoading, user]);

  // Timer effect
  useEffect(() => {
    if (match?.timerState === 'running' && !timerInterval) {
      const interval = setInterval(() => {
        setMatchTime(prev => prev + 1000);
      }, 1000);
      setTimerInterval(interval);
    } else if (match?.timerState !== 'running' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [match?.timerState, timerInterval]);

  const loadTeamData = async () => {
    try {
      console.log('🔍 Loading team data...');
      console.log('🔍 Current searchParams:', searchParams.toString());
      setLoading(true);
      setError('');
      
      // Get team ID from URL params
      const teamId = searchParams.get('team');
      console.log('🔍 Team ID from URL:', teamId);
      
      if (teamId) {
        // Load specific team
        console.log('🔍 Loading specific team with ID:', teamId);
        const teamData = await getTeamById(teamId);
        console.log('🔍 Team data received:', teamData);
        
        if (teamData) {
          console.log('✅ Setting team state with:', teamData);
          setTeam(teamData);
          
          // Load existing matches for this team
          try {
            const existingMatches = await getTeamMatches(teamId);
            console.log('🔍 Existing matches found:', existingMatches);
            
            if (existingMatches && existingMatches.length > 0) {
              // Find the most recent active match or the last created match
              const activeMatch = existingMatches.find(m => m.status === 'active' || m.status === 'scheduled');
              const lastMatch = existingMatches[existingMatches.length - 1];
              const matchToLoad = activeMatch || lastMatch;
              
              if (matchToLoad) {
                console.log('✅ Loading existing match:', matchToLoad);
                setMatch(matchToLoad);
                setMatchTime(matchToLoad.matchTime || 0);
              }
            }
          } catch (matchError) {
            console.log('ℹ️ No existing matches found or error loading matches:', matchError);
          }
          
          console.log('✅ Team loaded successfully');
        } else {
          console.error('❌ No team data returned for ID:', teamId);
          setError('Team not found');
        }
      } else {
        // Load all available teams
        console.log('🔍 No team ID in URL, loading all teams...');
        const teams = await getAllTeams();
        console.log('🔍 Available teams:', teams);
        setAvailableTeams(teams || []);
      }
    } catch (error) {
      console.error('❌ Error loading team data:', error);
      setError(`Failed to load team data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = async (selectedTeam) => {
    try {
      console.log('🔍 Team selected:', selectedTeam);
      console.log('🔍 Selected team ID:', selectedTeam.id);
      setLoading(true);
      setError('');
      
      const teamData = await getTeamById(selectedTeam.id);
      console.log('🔍 Team data received:', teamData);
      
      if (teamData) {
        console.log('✅ Setting team state with:', teamData);
        setTeam(teamData);
        
        // Load existing matches for this team
        try {
          const existingMatches = await getTeamMatches(selectedTeam.id);
          console.log('🔍 Existing matches found:', existingMatches);
          
          if (existingMatches && existingMatches.length > 0) {
            // Find the most recent active match or the last created match
            const activeMatch = existingMatches.find(m => m.status === 'active' || m.status === 'scheduled');
            const lastMatch = existingMatches[existingMatches.length - 1];
            const matchToLoad = activeMatch || lastMatch;
            
            if (matchToLoad) {
              console.log('✅ Loading existing match:', matchToLoad);
              setMatch(matchToLoad);
              setMatchTime(matchToLoad.matchTime || 0);
            }
          }
        } catch (matchError) {
          console.log('ℹ️ No existing matches found or error loading matches:', matchError);
        }
        
        console.log('✅ Team selection completed successfully');
      } else {
        console.error('❌ No team data returned for ID:', selectedTeam.id);
        setError('Team not found');
      }
    } catch (error) {
      console.error('❌ Error selecting team:', error);
      setError(`Failed to select team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simplified match creation - goes straight to dashboard
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('🔍 handleCreateMatch called with:', {
      team,
      teamId: team?.id,
      teamName: team?.name,
      user: user?.uid,
      matchForm
    });
    
    if (!matchForm.opponent.trim()) {
      setError('Opponent name is required');
      return;
    }

    if (!team || !team.id) {
      console.error('❌ Team is null or missing ID:', team);
      setError('No team selected. Please select a team first.');
      return;
    }

    if (!user || !user.uid) {
      console.error('❌ User is null or missing UID:', user);
      setError('User not authenticated. Please log in again.');
      return;
    }

    try {
      console.log('🔍 Creating match with validated data:', {
        teamId: team.id,
        teamName: team.name,
        opponent: matchForm.opponent.trim(),
        date: new Date(matchForm.date),
        createdBy: user.uid
      });
      
      console.log('🔄 Calling createMatch service...');
      const newMatch = await createMatch({
        teamId: team.id,
        teamName: team.name,
        opponent: matchForm.opponent.trim(),
        date: new Date(matchForm.date),
        currentXV: [],
        substitutes: team.players || [],
        createdBy: user.uid,
        status: 'scheduled',
        currentPeriod: 1,
        timerState: 'stopped',
        statistics: {
          possession: { team: 0, opponent: 0 },
          territory: { team: 0, opponent: 0 },
          errors: { team: 0, opponent: 0 },
          penalties: { team: 0, opponent: 0 },
          turnovers: { team: 0, opponent: 0 },
          tries: { team: 0, opponent: 0 },
          conversions: { team: 0, opponent: 0 },
          penaltyGoals: { team: 0, opponent: 0 },
          dropGoals: { team: 0, opponent: 0 }
        }
      });

      console.log('✅ Match created successfully:', newMatch);
      console.log('🔄 Setting match state...');
      setMatch(newMatch);
      setShowCreateMatch(false);
      setError('');
      console.log('✅ Match state updated, now showing dashboard');
    } catch (error) {
      console.error('❌ Error creating match:', error);
      setError(`Failed to create match: ${error.message}`);
    }
  };

  // Match control functions
  const handleStartMatch = async () => {
    if (!match?.id) {
      console.error('❌ No match ID available');
      setError('No match available to start');
      return;
    }
    
    try {
      console.log('🚀 Starting match timer for:', match.id);
      await startMatchTimer(match.id);
      
      // Update local state to reflect match is now running
      setMatch(prev => ({
        ...prev,
        matchTimer: {
          ...prev.matchTimer,
          state: 'running',
          startTime: new Date()
        }
      }));
      
      setTimerState('running');
      console.log('✅ Match started successfully');
    } catch (error) {
      console.error('❌ Error starting match:', error);
      setError(`Failed to start match: ${error.message}`);
    }
  };

  const handlePauseMatch = async () => {
    if (!match?.id) {
      console.error('❌ No match ID available');
      return;
    }
    
    try {
      console.log('⏸️ Pausing match timer for:', match.id);
      await pauseMatchTimer(match.id);
      
      // Update local state
      setMatch(prev => ({
        ...prev,
        matchTimer: {
          ...prev.matchTimer,
          state: 'paused',
          pausedTime: new Date()
        }
      }));
      
      setTimerState('paused');
      console.log('✅ Match paused successfully');
    } catch (error) {
      console.error('❌ Error pausing match:', error);
      setError(`Failed to pause match: ${error.message}`);
    }
  };

  const handleResumeMatch = async () => {
    if (!match?.id) {
      console.error('❌ No match ID available');
      return;
    }
    
    try {
      console.log('▶️ Resuming match timer for:', match.id);
      await resumeMatchTimer(match.id);
      
      // Update local state
      setMatch(prev => ({
        ...prev,
        matchTimer: {
          ...prev.matchTimer,
          state: 'running',
          pausedTime: null
        }
      }));
      
      setTimerState('running');
      console.log('✅ Match resumed successfully');
    } catch (error) {
      console.error('❌ Error resuming match:', error);
      setError(`Failed to resume match: ${error.message}`);
    }
  };

  const handleEndMatch = async () => {
    if (!match?.id) {
      console.error('❌ No match ID available');
      return;
    }
    
    try {
      console.log('🏁 Ending match for:', match.id);
      await endPeriod(match.id, 'completed');
      
      // Update local state
      setMatch(prev => ({
        ...prev,
        matchTimer: {
          ...prev.matchTimer,
          state: 'stopped'
        }
      }));
      
      setTimerState('stopped');
      console.log('✅ Match ended successfully');
    } catch (error) {
      console.error('❌ Error ending match:', error);
      setError(`Failed to end match: ${error.message}`);
    }
  };

  // Statistics functions
  const handleTogglePossession = async () => {
    if (!match?.id) {
      console.error('❌ No match available for possession toggle');
      return;
    }
    
    try {
      console.log('🔄 Toggling possession...');
      console.log('🔍 Current match statistics:', match?.statistics);
      
      // Prevent multiple simultaneous updates
      if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }
      
      setIsUpdating(true);
      
      // Ensure statistics object exists with proper structure
      const currentStatistics = match.statistics || {};
      const currentPossession = currentStatistics.possession || {};
      const currentTeamPossession = currentPossession.team || 0;
      
      const updatedStatistics = {
        ...currentStatistics,
        possession: {
          team: currentTeamPossession === 0 ? 1 : 0,
          opponent: currentTeamPossession === 0 ? 0 : 1
        }
      };
      
      // Create updated match object
      const updatedMatch = { ...match, statistics: updatedStatistics };
      
      // Update local state immediately for instant feedback
      safeSetMatch(updatedMatch);
      
      console.log('✅ Possession toggled locally');
      
      // Update database with proper error handling
      try {
        await updateMatch(match.id, { statistics: updatedStatistics });
        console.log('💾 Possession saved to database');
      } catch (dbError) {
        console.error('❌ Database update failed for possession:', dbError);
        // Revert local state if database update fails
        safeSetMatch(match);
        setError(`Failed to save possession: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error toggling possession:', error);
      setError(`Failed to toggle possession: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleTerritory = async () => {
    if (!match?.id) {
      console.error('❌ No match available for territory toggle');
      return;
    }
    
    try {
      console.log('🔄 Toggling territory...');
      console.log('🔍 Current match statistics:', match?.statistics);
      
      // Prevent multiple simultaneous updates
      if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }
      
      setIsUpdating(true);
      
      // Ensure statistics object exists with proper structure
      const currentStatistics = match.statistics || {};
      const currentTerritory = currentStatistics.territory || {};
      const currentTeamTerritory = currentTerritory.team || 0;
      
      const updatedStatistics = {
        ...currentStatistics,
        territory: {
          team: currentTeamTerritory === 0 ? 1 : 0,
          opponent: currentTeamTerritory === 0 ? 0 : 1
        }
      };
      
      // Create updated match object
      const updatedMatch = { ...match, statistics: updatedStatistics };
      
      // Update local state immediately for instant feedback
      safeSetMatch(updatedMatch);
      
      console.log('✅ Territory toggled locally');
      
      // Update database with proper error handling
      try {
        await updateMatch(match.id, { statistics: updatedStatistics });
        console.log('💾 Territory saved to database');
      } catch (dbError) {
        console.error('❌ Database update failed for territory:', dbError);
        // Revert local state if database update fails
        safeSetMatch(match);
        setError(`Failed to save territory: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error toggling territory:', error);
      setError(`Failed to toggle territory: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Error and penalty tracking functions
  const handleIncrementError = async (team = 'team') => {
    if (!match?.id) {
      console.error('❌ No match available for error tracking');
      return;
    }
    
    try {
      console.log(`🔄 Incrementing error for ${team}...`);
      
      // Prevent multiple simultaneous updates
      if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }
      
      setIsUpdating(true);
      
      // Ensure statistics object exists with proper structure
      const currentStatistics = match.statistics || {};
      const currentErrors = currentStatistics.errors || {};
      const currentCount = currentErrors[team] || 0;
      
      const updatedStatistics = {
        ...currentStatistics,
        errors: {
          ...currentErrors,
          [team]: currentCount + 1
        }
      };
      
      // Create updated match object
      const updatedMatch = { 
        ...match, 
        statistics: updatedStatistics 
      };
      
      // Update local state immediately for instant feedback
      safeSetMatch(updatedMatch);
      
      console.log(`✅ Error incremented for ${team} to ${currentCount + 1}`);
      
      // Update database with proper error handling
      try {
        await updateMatch(match.id, { statistics: updatedStatistics });
        console.log(`💾 Error count saved to database for ${team}`);
      } catch (dbError) {
        console.error('❌ Database update failed for error:', dbError);
        // Revert local state if database update fails
        safeSetMatch(match);
        setError(`Failed to save error count: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error incrementing error count:', error);
      setError(`Failed to increment error count: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrementPenalty = async (team = 'team') => {
    if (!match?.id) {
      console.error('❌ No match available for penalty tracking');
      return;
    }
    
    try {
      console.log(`🔄 Incrementing penalty for ${team}...`);
      
      // Prevent multiple simultaneous updates
      if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }
      
      setIsUpdating(true);
      
      // Ensure statistics object exists with proper structure
      const currentStatistics = match.statistics || {};
      const currentPenalties = currentStatistics.penalties || {};
      const currentCount = currentPenalties[team] || 0;
      
      const updatedStatistics = {
        ...currentStatistics,
        penalties: {
          ...currentPenalties,
          [team]: currentCount + 1
        }
      };
      
      // Create updated match object
      const updatedMatch = { 
        ...match, 
        statistics: updatedStatistics 
      };
      
      // Update local state immediately for instant feedback
      safeSetMatch(updatedMatch);
      
      console.log(`✅ Penalty incremented for ${team} to ${currentCount + 1}`);
      
      // Update database with proper error handling
      try {
        await updateMatch(match.id, { statistics: updatedStatistics });
        console.log(`💾 Penalty count saved to database for ${team}`);
      } catch (dbError) {
        console.error('❌ Database update failed for penalty:', dbError);
        // Revert local state if database update fails
        safeSetMatch(match);
        setError(`Failed to save penalty count: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error incrementing penalty count:', error);
      setError(`Failed to increment penalty count: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTeamEvent = async (eventType, team) => {
    if (!match?.id) return;
    
    try {
      const updatedMatch = await recordEvent(match.id, eventType, { team });
      setMatch(updatedMatch);
    } catch (error) {
      console.error(`❌ Error recording ${eventType}:`, error);
      setError(`Failed to record ${eventType}: ${error.message}`);
    }
  };

  // Scoring functions
  const handleScoringEvent = (eventType) => {
    if (!match?.id) {
      console.error('❌ No match available for scoring');
      setError('No match available for scoring');
      return;
    }
    
    const scoringInfo = SCORING[eventType];
    if (!scoringInfo) {
      console.error('❌ Invalid scoring event type:', eventType);
      return;
    }
    
    console.log('🎯 Setting up scoring event:', eventType, scoringInfo);
    setScoringEvent({
      type: eventType,
      description: scoringInfo.description,
      points: scoringInfo.points
    });
    setShowScoringModal(true);
  };

  const handleScoringSubmit = async (playerId, playerName) => {
    if (!match?.id || !scoringEvent) {
      console.error('❌ Missing match or scoring event');
      return;
    }
    
    try {
      console.log('📝 Recording scoring event:', {
        matchId: match.id,
        eventType: scoringEvent.type,
        playerId,
        playerName,
        points: scoringEvent.points
      });
      
      // Prevent multiple simultaneous updates
      if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
      }
      
      setIsUpdating(true);
      
      // Update local match state immediately for instant feedback
      const updatedMatch = {
        ...match,
        events: [
          ...(match.events || []),
          {
            id: `event-${Date.now()}`,
            type: scoringEvent.type,
            timestamp: new Date(),
            playerId,
            playerName,
            points: scoringEvent.points,
            team: 'team'
          }
        ]
      };
      
      // Update local state first using safe setter
      safeSetMatch(updatedMatch);
      setShowScoringModal(false);
      setScoringEvent(null);
      
      console.log('✅ Scoring event recorded locally');
      
      // Record the event in the database with proper error handling
      try {
        await recordEvent(match.id, scoringEvent.type, {
          playerId,
          playerName,
          points: scoringEvent.points,
          team: 'team'
        });
        console.log('💾 Scoring event saved to database');
      } catch (dbError) {
        console.error('❌ Database update failed for scoring event:', dbError);
        // Revert local state if database update fails
        safeSetMatch(match);
        setError(`Failed to save scoring event: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error recording scoring event:', error);
      setError(`Failed to record scoring event: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Player management functions
  const getPlayersForPosition = (position) => {
    if (!team?.players) return [];
    
    // Define position groups for intelligent suggestions
    const positionGroups = {
      // Props can play either tighthead or loosehead
      'prop1': ['PROP', 'TIGHTHEAD', 'LOOSEHEAD'],
      'prop2': ['PROP', 'TIGHTHEAD', 'LOOSEHEAD'],
      
      // Flankers can play either blindside or openside
      'flanker1': ['FLANKER', 'BLINDSIDE', 'OPENSIDE'],
      'flanker2': ['FLANKER', 'BLINDSIDE', 'OPENSIDE'],
      
      // Wings can play either left or right wing
      'wing1': ['WING', 'LEFT WING', 'RIGHT WING'],
      'wing2': ['WING', 'LEFT WING', 'RIGHT WING'],
      
      // Specific positions
      'hooker': ['HOOKER'],
      'lock1': ['LOCK', 'SECOND ROW'],
      'lock2': ['LOCK', 'SECOND ROW'],
      'number8': ['NUMBER 8', 'EIGHT'],
      'scrumhalf': ['SCRUM HALF', 'SCRUMHALF', 'HALF BACK', 'HALFBACK'],
      'flyhalf': ['FLY HALF', 'FLYHALF', 'FIRST FIVE', 'FIRST FIVE-EIGHTH', '1ST FIVE'],
      'insidecenter': ['INSIDE CENTER', 'INSIDE CENTRE', 'CENTER', 'CENTRE', '2ND FIVE', 'SECOND FIVE'],
      'outsidecenter': ['OUTSIDE CENTER', 'OUTSIDE CENTRE', 'CENTER', 'CENTRE'],
      'fullback': ['FULLBACK', 'FULL BACK']
    };
    
    const allowedPositions = positionGroups[position.id] || [position.name];
    
    console.log(`🔍 Finding players for ${position.name} (${position.id})`);
    console.log(`🎯 Allowed positions:`, allowedPositions);
    
    const suggestedPlayers = team.players.filter(player => {
      const preferences = [
        player.position1?.toUpperCase(),
        player.position2?.toUpperCase(),
        player.position3?.toUpperCase()
      ].filter(Boolean); // Remove undefined/null values
      
      console.log(`👤 Player ${player.firstName} ${player.lastName} preferences:`, preferences);
      
      // Check if any of the player's preferences match the allowed positions
      const isMatch = preferences.some(pref => 
        allowedPositions.some(allowed => 
          pref.includes(allowed) || allowed.includes(pref)
        )
      );
      
      console.log(`✅ ${player.firstName} ${player.lastName} match:`, isMatch);
      return isMatch;
    });
    
    console.log(`🎯 Suggested players for ${position.name}:`, suggestedPlayers.map(p => `${p.firstName} ${p.lastName}`));
    return suggestedPlayers;
  };

  const handleAssignPlayer = async (position, player) => {
    if (!match?.id) return;
    
    try {
      console.log(`🔄 Assigning player ${player.firstName} ${player.lastName} to ${position.name}...`);
      
      // Update match current XV
      const updatedCurrentXV = [...(match.currentXV || [])];
      
      // Remove player from any existing position first (swap logic)
      const existingPlayerIndex = updatedCurrentXV.findIndex(p => p.id === player.id);
      if (existingPlayerIndex >= 0) {
        console.log(`🔄 Removing player ${player.firstName} from previous position ${updatedCurrentXV[existingPlayerIndex].position}`);
        updatedCurrentXV.splice(existingPlayerIndex, 1);
      }
      
      // Remove any existing player from this position
      const existingPositionIndex = updatedCurrentXV.findIndex(p => p.position === position.id);
      if (existingPositionIndex >= 0) {
        console.log(`🔄 Removing existing player from position ${position.name}`);
        updatedCurrentXV.splice(existingPositionIndex, 1);
      }
      
      // Add player to new position with position details
      updatedCurrentXV.push({ 
        ...player, 
        position: position.id,
        positionName: position.name,
        positionNumber: position.number
      });
      
      // Update match locally first
      const updatedMatch = { ...match, currentXV: updatedCurrentXV };
      setMatch(updatedMatch);
      
      // Then update in database
      await updateMatch(match.id, { currentXV: updatedCurrentXV });
      console.log('✅ Player assigned successfully to position', position.name);
    } catch (error) {
      console.error('❌ Error assigning player:', error);
      setError(`Failed to assign player: ${error.message}`);
    }
  };

  const handleRemovePlayer = async (position) => {
    if (!match?.id) return;
    
    try {
      console.log(`🔄 Removing player from ${position.name}...`);
      
      const updatedCurrentXV = (match.currentXV || []).filter(p => p.position !== position.id);
      
      // Update match locally first
      const updatedMatch = { ...match, currentXV: updatedCurrentXV };
      setMatch(updatedMatch);
      
      // Then update in database
      await updateMatch(match.id, { currentXV: updatedCurrentXV });
      console.log('✅ Player removed successfully');
    } catch (error) {
      console.error('❌ Error removing player:', error);
      setError(`Failed to remove player: ${error.message}`);
    }
  };

  const getAvailablePlayers = () => {
    if (!team?.players) return team?.players || [];
    if (!match?.currentXV) return team?.players || [];
    
    const assignedPlayerIds = match.currentXV.map(p => p.id);
    const availablePlayers = team.players.filter(player => !assignedPlayerIds.includes(player.id));
    
    // Find the next unfilled position (1-15 order)
    const nextUnfilledPosition = ALL_POSITIONS.sort((a, b) => a.number - b.number)
      .find(position => !match.currentXV.find(p => p.position === position.id));
    
    if (nextUnfilledPosition) {
      console.log(`🎯 Next unfilled position: ${nextUnfilledPosition.name} (#${nextUnfilledPosition.number})`);
      
      // Sort available players by relevance to the next position, with status priority
      const prioritizedPlayers = availablePlayers.sort((a, b) => {
        // First, sort by status (available players first, then injured, then absent)
        const aStatus = getPlayerStatus(a);
        const bStatus = getPlayerStatus(b);
        
        if (aStatus !== bStatus) {
          // Available = 0, Injured = 1, Absent = 2 (lower numbers first)
          return aStatus - bStatus;
        }
        
        // If same status, sort by relevance to next position
        const aRelevance = getPlayerPositionRelevance(a, nextUnfilledPosition);
        const bRelevance = getPlayerPositionRelevance(b, nextUnfilledPosition);
        
        if (aRelevance !== bRelevance) {
          return bRelevance - aRelevance;
        }
        
        // If same relevance, sort by name
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
      
      console.log(`🎯 Prioritized players for ${nextUnfilledPosition.name}:`, 
        prioritizedPlayers.map(p => `${p.firstName} ${p.lastName} (status: ${getPlayerStatusText(p)}, relevance: ${getPlayerPositionRelevance(p, nextUnfilledPosition)})`)
      );
      
      return prioritizedPlayers;
    }
    
    console.log(`🔍 Available players: ${availablePlayers.length}/${team.players.length}`);
    console.log(`🔍 Assigned players:`, match.currentXV.map(p => `${p.firstName} ${p.lastName} (${p.positionName})`));
    
    return availablePlayers;
  };

  // Helper function to get player status (0 = available, 1 = injured, 2 = absent)
  const getPlayerStatus = (player) => {
    if (player.status === 'injured') return 1;
    if (player.status === 'absent') return 2;
    return 0; // available
  };

  // Helper function to get player status text
  const getPlayerStatusText = (player) => {
    if (player.status === 'injured') return 'Injured';
    if (player.status === 'absent') return 'Absent';
    return 'Available';
  };

  // Function to toggle player status
  const togglePlayerStatus = async (player, newStatus) => {
    if (!team || !player) return;
    
    try {
      // Update the player's status in the team
      const updatedPlayers = team.players.map(p => 
        p.id === player.id ? { ...p, status: newStatus } : p
      );
      
      // Update the team document
      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        players: updatedPlayers
      });
      
      // Update local state
      setTeam(prev => prev ? { ...prev, players: updatedPlayers } : null);
      
      console.log(`✅ Updated ${player.firstName} ${player.lastName} status to: ${newStatus}`);
    } catch (error) {
      console.error('❌ Failed to update player status:', error);
    }
  };

  // Function to quickly assign player to next unfilled position
  const quickAssignToNextPosition = async (player) => {
    if (!match || !team) return;
    
    try {
      // Find the next unfilled position (1-15 order)
      const nextUnfilledPosition = ALL_POSITIONS.sort((a, b) => a.number - b.number)
        .find(position => !match.currentXV.find(p => p.position === position.id));
      
      if (nextUnfilledPosition) {
        console.log(`⚡ Quick assigning ${player.firstName} ${player.lastName} to ${nextUnfilledPosition.name} (#${nextUnfilledPosition.number})`);
        
        // Use the existing handleAssignPlayer function
        await handleAssignPlayer(nextUnfilledPosition, player);
        
        console.log(`✅ Quick assignment successful!`);
      } else {
        console.log(`ℹ️ All positions are filled!`);
      }
    } catch (error) {
      console.error('❌ Quick assignment failed:', error);
    }
  };

  // Helper function to calculate player relevance to a position
  const getPlayerPositionRelevance = (player, position) => {
    const positionGroups = {
      // Props can play either tighthead or loosehead
      'prop1': ['PROP', 'TIGHTHEAD', 'LOOSEHEAD'],
      'prop2': ['PROP', 'TIGHTHEAD', 'LOOSEHEAD'],
      
      // Flankers can play either blindside or openside
      'flanker1': ['FLANKER', 'BLINDSIDE', 'OPENSIDE'],
      'flanker2': ['FLANKER', 'BLINDSIDE', 'OPENSIDE'],
      
      // Wings can play either left or right wing
      'wing1': ['WING', 'LEFT WING', 'RIGHT WING'],
      'wing2': ['WING', 'LEFT WING', 'RIGHT WING'],
      
      // Specific positions
      'hooker': ['HOOKER'],
      'lock1': ['LOCK', 'SECOND ROW'],
      'lock2': ['LOCK', 'SECOND ROW'],
      'number8': ['NUMBER 8', 'EIGHT'],
      'scrumhalf': ['SCRUM HALF', 'SCRUMHALF', 'HALF BACK', 'HALFBACK', 'HALF BACK', 'HALF-BACK'],
      'flyhalf': ['FLY HALF', 'FLYHALF', 'FIRST FIVE', 'FIRST FIVE-EIGHTH', '1ST FIVE', 'FIRST FIVE', 'FIRST-FIVE'],
      'insidecenter': ['INSIDE CENTER', 'INSIDE CENTRE', 'CENTER', 'CENTRE', '2ND FIVE', 'SECOND FIVE', 'SECOND-FIVE'],
      'outsidecenter': ['OUTSIDE CENTER', 'OUTSIDE CENTRE', 'CENTER', 'CENTRE'],
      'fullback': ['FULLBACK', 'FULL BACK']
    };
    
    const allowedPositions = positionGroups[position.id] || [position.name];
    const preferences = [
      player.position1?.toUpperCase(),
      player.position2?.toUpperCase(),
      player.position3?.toUpperCase()
    ].filter(Boolean);
    
    console.log(`🔍 Checking relevance for ${player.firstName} ${player.lastName} to ${position.name}:`);
    console.log(`   Position ID: ${position.id}`);
    console.log(`   Allowed positions: ${allowedPositions.join(', ')}`);
    console.log(`   Player preferences: ${preferences.join(', ')}`);
    
    // Check relevance score
    let maxRelevance = 0;
    preferences.forEach((pref, index) => {
      allowedPositions.forEach(allowed => {
        // Normalize both strings for comparison
        const normalizedPref = pref.replace(/[-\s]/g, '').toUpperCase();
        const normalizedAllowed = allowed.replace(/[-\s]/g, '').toUpperCase();
        
        if (normalizedPref.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedPref)) {
          // Perfect match in position1 = 3 points, position2 = 2 points, position3 = 1 point
          const relevance = 3 - index; // 3, 2, or 1
          console.log(`   ✅ Match found: "${pref}" matches "${allowed}" (relevance: ${relevance})`);
          maxRelevance = Math.max(maxRelevance, relevance);
        }
      });
    });
    
    console.log(`   Final relevance score: ${maxRelevance}`);
    return maxRelevance;
  };

  // Format match time
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Debug logging
  console.log('🔍 GameDay render state:', {
    authLoading,
    loading,
    error,
    user: user?.uid,
    team: team?.id,
    match: match?.id,
    availableTeams: availableTeams.length,
    matchTime,
    timerState: match?.timerState
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading GameDay...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="text-red-200 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-bold mb-4">GameDay Error</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main GameDay Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              ← Back
            </button>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="text-4xl text-yellow-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">GameDay Management</h1>
                  {team && <p className="text-white/80">{team.name} - Live Match Control</p>}
                </div>
              </div>
            </div>
            {team && (
              <button
                onClick={() => {
                  clearState();
                }}
                className="btn-secondary"
              >
                Change Team
              </button>
            )}
          </div>
        </div>

        {/* Team Selection Interface */}
        {!team && (
          <div className="card mb-6">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🏉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Team</h2>
              <p className="text-gray-600 mb-6">Choose a team to start managing GameDay</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTeams.map((teamOption) => (
                  <button
                    key={teamOption.id}
                    onClick={() => handleTeamSelection(teamOption)}
                    className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all text-left"
                  >
                    <div className="text-2xl mb-2">🏉</div>
                    <h3 className="font-bold text-gray-900 mb-1">{teamOption.name}</h3>
                    <p className="text-sm text-gray-600">{teamOption.players?.length || 0} players</p>
                    {teamOption.ageGroup && (
                      <p className="text-xs text-gray-500 mt-1">{teamOption.ageGroup}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Match Interface */}
        {team && !match && (
          <div className="card mb-6">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start GameDay?</h2>
              <p className="text-gray-600 mb-6">Create a new match to begin player selection and live tracking</p>
              

              
              <button
                onClick={() => setShowCreateMatch(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                + Create New Match
              </button>
            </div>
          </div>
        )}

        {/* GameDay Dashboard - Main Interface */}
        {team && match && (
          <div className="space-y-6">
            {/* Match Header */}
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {team.name} vs {match.opponent}
                    </h2>
                    <p className="text-gray-600">
                      {new Date(match.date).toLocaleDateString()} • {match.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-primary mb-1">
                      {formatTime(matchTime)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{match.timerState || 'stopped'}</div>
                  </div>
                </div>

                {/* Match Control Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {(!match.timerState || match.timerState === 'stopped') && (
                    <button
                      onClick={handleStartMatch}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Play size={16} />
                      Start Match
                    </button>
                  )}
                  
                  {match.timerState === 'running' && (
                    <>
                      <button
                        onClick={handlePauseMatch}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Pause size={16} />
                        Pause
                      </button>
                      <button
                        onClick={handleEndMatch}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Square size={16} />
                        End Match
                      </button>
                    </>
                  )}
                  
                  {match.timerState === 'paused' && (
                    <>
                      <button
                        onClick={handleResumeMatch}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Play size={16} />
                        Resume
                      </button>
                      <button
                        onClick={handleEndMatch}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Square size={16} />
                        End Match
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live Statistics */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Live Statistics</h3>
                
                {/* Possession & Territory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Possession</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleTogglePossession}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          (match?.statistics?.possession?.team || 0) > 0 ? 
                          'bg-green-500 text-white' : 
                          'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {(match?.statistics?.possession?.team || 0) > 0 ? '🟢 Active' : '⚪ Inactive'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Territory</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToggleTerritory}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          (match?.statistics?.territory?.team || 0) > 0 ? 
                          'bg-green-500 text-white' : 
                          'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {(match?.statistics?.territory?.team || 0) > 0 ? '🟢 Active' : '⚪ Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Error & Penalty Counters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Errors</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600">
                        {match?.statistics?.errors?.team || 0} - {match?.statistics?.errors?.opponent || 0}
                      </div>
                      <button
                        onClick={() => handleTeamEvent('ERROR', 'team')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Us +1
                      </button>
                      <button
                        onClick={() => handleTeamEvent('ERROR', 'opponent')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Opp +1
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Penalties</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600">
                        {match?.statistics?.penalties?.team || 0} - {match?.statistics?.penalties?.opponent || 0}
                      </div>
                      <button
                        onClick={() => handleTeamEvent('PENALTY', 'team')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Us +1
                      </button>
                      <button
                        onClick={() => handleTeamEvent('PENALTY', 'opponent')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Opp +1
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Scoring Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Scoring</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleScoringEvent('TRY')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Try (5 pts)
                    </button>
                    <button
                      onClick={() => handleScoringEvent('CONVERSION')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Conversion (2 pts)
                    </button>
                    <button
                      onClick={() => handleScoringEvent('PENALTY_GOAL')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Penalty Goal (3 pts)
                    </button>
                    <button
                      onClick={() => handleScoringEvent('DROP_GOAL')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Drop Goal (3 pts)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Formation */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Formation</h3>
                
                {/* Rugby Field */}
                <div className="relative bg-green-600 rounded-lg p-8 mb-6" style={{ height: '700px' }}>
                  {/* Field markings */}
                  <div className="absolute inset-0 border-4 border-white/30 rounded-lg"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/20 transform -translate-y-1/2"></div>
                  <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white/20 transform -translate-y-1/2"></div>
                  
                  {/* Position cards */}
                  {ALL_POSITIONS.map((position) => {
                    const assignedPlayer = match?.currentXV?.find(p => p.position === position.id);
                    
                    return (
                      <div
                        key={position.id}
                        className="absolute w-20 h-24 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                        style={{
                          left: `${(position.x / 7) * 100}%`,
                          top: `${(position.y / 8.5) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => {
                          setSelectedPosition(position);
                          setShowPlayerSelectionModal(true);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const playerData = JSON.parse(e.dataTransfer.getData('text/plain'));
                          handleAssignPlayer(position, playerData);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => e.preventDefault()}
                      >
                        {assignedPlayer ? (
                          <>
                            {/* Player Image Placeholder */}
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                              {assignedPlayer.profileImage ? (
                                <img 
                                  src={assignedPlayer.profileImage} 
                                  alt={`${assignedPlayer.firstName} ${assignedPlayer.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 text-xs font-bold">
                                  {assignedPlayer.firstName?.[0]}{assignedPlayer.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            {/* Player Name */}
                            <div className="text-xs font-medium text-gray-800 text-center leading-tight mb-1">
                              {assignedPlayer.firstName} {assignedPlayer.lastName}
                            </div>
                            {/* Position Info */}
                            <div className="text-xs text-gray-600 text-center">
                              {position.name}
                            </div>
                            {/* Position Number */}
                            <div className="text-xs font-bold text-blue-600">
                              {position.number}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Empty Position */}
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-gray-400 text-lg">+</span>
                            </div>
                            <div className="text-xs text-gray-500 text-center leading-tight mb-1">
                              {position.name}
                            </div>
                            {/* Position Number */}
                            <div className="text-xs font-bold text-gray-400">
                              {position.number}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Position Details */}
                {selectedPosition && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {selectedPosition.name}
                    </h4>
                    
                    {match?.startingXV?.find(p => p.position === selectedPosition.id) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Assigned Player:</span>
                          <span className="font-medium">
                            {match.startingXV.find(p => p.position === selectedPosition.id).firstName} {match.startingXV.find(p => p.position === selectedPosition.id).lastName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(selectedPosition)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Remove Player
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 mb-2">Suggested Players:</div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {getPlayersForPosition(selectedPosition).map((player) => (
                            <button
                              key={player.id}
                              onClick={() => handleAssignPlayer(selectedPosition, player)}
                              className="w-full p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left text-sm transition-colors"
                            >
                              {player.firstName} {player.lastName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Player Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current XV */}
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Current XV</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {/* Display all 15 positions with drag & drop */}
                    {ALL_POSITIONS.sort((a, b) => a.number - b.number).map((position) => {
                      const assignedPlayer = match?.currentXV?.find(p => p.position === position.id);
                      
                      return (
                        <div
                          key={position.id}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            assignedPlayer 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-gray-50 border-gray-200 border-dashed'
                          }`}
                          onDrop={(e) => {
                            e.preventDefault();
                            const playerData = JSON.parse(e.dataTransfer.getData('text/plain'));
                            handleAssignPlayer(position, playerData);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Position Number Badge */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold ${
                                assignedPlayer 
                                  ? 'bg-blue-200 border-blue-400 text-blue-800' 
                                  : 'bg-gray-200 border-gray-300 text-gray-600'
                              }`}>
                                <span className="text-sm">{position.number}</span>
                              </div>
                              
                              {/* Position Name */}
                              <div className="min-w-[120px]">
                                <div className="font-medium text-sm text-gray-900">
                                  {position.name}
                                </div>
                              </div>
                              
                              {/* Player Info or Empty State */}
                              {assignedPlayer ? (
                                <div className="flex items-center gap-3 flex-1">
                                  {/* Player Avatar */}
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
                                    {assignedPlayer.profileImage ? (
                                      <img 
                                        src={assignedPlayer.profileImage} 
                                        alt={`${assignedPlayer.firstName} ${assignedPlayer.lastName}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-blue-700">
                                        {assignedPlayer.firstName?.[0]}{assignedPlayer.lastName?.[0]}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Player Name */}
                                  <div className="font-medium text-sm text-gray-900">
                                    {assignedPlayer.firstName} {assignedPlayer.lastName}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 text-gray-500 text-sm italic">
                                  Drag player here
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {assignedPlayer ? (
                                <>
                                  {/* Remove Player Button */}
                                  <button
                                    onClick={() => handleRemovePlayer(position)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Remove player from position"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Click to Assign Button */}
                                  <button
                                    onClick={() => {
                                      setSelectedPosition(position);
                                      setShowPlayerSelectionModal(true);
                                    }}
                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="Click to assign player"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Available Players */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Available Players</h3>
                    {(() => {
                      const nextUnfilledPosition = ALL_POSITIONS.sort((a, b) => a.number - b.number)
                        .find(position => !match?.currentXV?.find(p => p.position === position.id));
                      
                      if (nextUnfilledPosition) {
                        return (
                          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            🎯 Next: {nextUnfilledPosition.name} (#{nextUnfilledPosition.number})
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getAvailablePlayers().map((player, index) => {
                      const nextUnfilledPosition = ALL_POSITIONS.sort((a, b) => a.number - b.number)
                        .find(position => !match?.currentXV?.find(p => p.position === position.id));
                      
                      const relevance = nextUnfilledPosition ? getPlayerPositionRelevance(player, nextUnfilledPosition) : 0;
                      const playerStatus = getPlayerStatus(player);
                      
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            playerStatus === 2 // Absent
                              ? 'bg-red-50 border-2 border-red-300 opacity-60'
                              : playerStatus === 1 // Injured
                              ? 'bg-orange-50 border-2 border-orange-300 opacity-75'
                              : relevance === 3 
                              ? 'bg-green-50 border-2 border-green-300 hover:bg-green-100 cursor-move' 
                              : relevance === 2 
                              ? 'bg-yellow-50 border-2 border-yellow-300 hover:bg-yellow-100 cursor-move'
                              : relevance === 1
                              ? 'bg-orange-50 border-2 border-orange-300 hover:bg-orange-100 cursor-move'
                              : 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 cursor-move'
                          }`}
                          draggable={playerStatus === 0} // Only available players are draggable
                          onDragStart={(e) => {
                            if (playerStatus === 0) {
                              e.dataTransfer.setData('text/plain', JSON.stringify(player));
                              console.log('🔄 Started dragging player:', player);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Priority Indicator */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              playerStatus === 2 // Absent
                                ? 'bg-red-500 text-white'
                                : playerStatus === 1 // Injured
                                ? 'bg-orange-500 text-white'
                                : relevance === 3 
                                ? 'bg-green-500 text-white' 
                                : relevance === 2 
                                ? 'bg-yellow-500 text-white'
                                : relevance === 1
                                ? 'bg-orange-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            
                            {/* Player Info */}
                            <div>
                              <div className={`font-medium text-sm ${
                                playerStatus === 2 ? 'text-red-700' : playerStatus === 1 ? 'text-orange-700' : 'text-gray-900'
                              }`}>
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-xs text-gray-600">
                                {player.position1}, {player.position2}, {player.position3}
                              </div>
                              {/* Status Badge */}
                              {playerStatus > 0 && (
                                <div className={`text-xs font-medium px-2 py-1 rounded mt-1 inline-block ${
                                  playerStatus === 1 ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'
                                }`}>
                                  {getPlayerStatusText(player)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Quick Assign Button (only for available players) */}
                            {playerStatus === 0 && nextUnfilledPosition && (
                              <button
                                onClick={() => quickAssignToNextPosition(player)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title={`Quick assign to ${nextUnfilledPosition.name} (#${nextUnfilledPosition.number})`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            
                            {/* Relevance Badge */}
                            {nextUnfilledPosition && playerStatus === 0 && (
                              <div className={`text-xs font-medium px-2 py-1 rounded ${
                                relevance === 3 
                                  ? 'bg-green-200 text-green-800' 
                                  : relevance === 2 
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : relevance === 1
                                  ? 'bg-orange-200 text-orange-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {relevance === 3 ? 'Perfect' : relevance === 2 ? 'Great' : relevance === 1 ? 'Good' : 'Basic'} Match
                              </div>
                            )}
                            
                            {/* Status Toggle Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStatus = playerStatus === 0 ? 'injured' : playerStatus === 1 ? 'absent' : null;
                                  if (newStatus) {
                                    togglePlayerStatus(player, newStatus);
                                  } else {
                                    togglePlayerStatus(player, null); // Reset to available
                                  }
                                }}
                                className={`p-2 rounded transition-colors ${
                                  playerStatus === 0 
                                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                                    : playerStatus === 1 
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'
                                    : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                                }`}
                                title={`Toggle status: ${playerStatus === 0 ? 'Mark as Injured' : playerStatus === 1 ? 'Mark as Absent' : 'Mark as Available'}`}
                              >
                                {playerStatus === 0 ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                ) : playerStatus === 1 ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {getAvailablePlayers().length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No available players</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Match Modal */}
        {showCreateMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Create New Match</h3>
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opponent Team *
                    </label>
                    <input
                      type="text"
                      value={matchForm.opponent}
                      onChange={(e) => setMatchForm({...matchForm, opponent: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter opponent team name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Match Date
                    </label>
                    <input
                      type="date"
                      value={matchForm.date}
                      onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateMatch(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Create Match
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Modal */}
        {showScoringModal && scoringEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {scoringEvent.description}
                </h3>
                <p className="text-gray-600 mb-4">
                  +{scoringEvent.points} points - Select the player who scored
                </p>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {team?.players?.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleScoringSubmit(player.id, `${player.firstName} ${player.lastName}`)}
                      className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {player.firstName?.[0]}{player.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {player.firstName} {player.lastName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {player.position1 || 'Position not set'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )) || (
                    <p className="text-gray-500 text-center">No players available</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowScoringModal(false);
                      setScoringEvent(null);
                    }}
                    className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Selection Modal */}
        {showPlayerSelectionModal && selectedPosition && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
              <div className="p-6 border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Player for {selectedPosition.name}
                </h3>
                <p className="text-gray-700 font-medium">
                  Position #{selectedPosition.number} - Choose a player who prefers this role
                </p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preferred Players (Top 3 positions) */}
                  <div>
                    <h4 className="font-bold text-lg text-green-700 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Preferred Players
                    </h4>
                    <div className="space-y-3">
                      {getPlayersForPosition(selectedPosition).map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            handleAssignPlayer(selectedPosition, player);
                            setShowPlayerSelectionModal(false);
                            setSelectedPosition(null);
                          }}
                          className="w-full p-4 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-lg transition-all duration-200 text-left hover:shadow-md hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center border-2 border-green-400">
                              {player.profileImage ? (
                                <img 
                                  src={player.profileImage} 
                                  alt={`${player.firstName} ${player.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold text-green-700">
                                  {player.firstName?.[0]}{player.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-base text-gray-900 mb-1">
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-sm text-gray-700 font-medium">
                                {player.position1}, {player.position2}, {player.position3}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {getPlayersForPosition(selectedPosition).length === 0 && (
                        <p className="text-gray-600 text-sm italic font-medium bg-gray-100 p-3 rounded-lg text-center">
                          No players prefer this position
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* All Available Players */}
                  <div>
                    <h4 className="font-bold text-lg text-blue-700 mb-4 flex items-center gap-2">
                      <span className="text-2xl">👥</span>
                      All Available Players
                    </h4>
                    <div className="space-y-3">
                      {getAvailablePlayers().map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            handleAssignPlayer(selectedPosition, player);
                            setShowPlayerSelectionModal(false);
                            setSelectedPosition(null);
                          }}
                          className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg transition-all duration-200 text-left hover:shadow-md hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center border-2 border-blue-400">
                              {player.profileImage ? (
                                <img 
                                  src={player.profileImage} 
                                  alt={`${player.firstName} ${player.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold text-blue-700">
                                  {player.firstName?.[0]}{player.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-base text-gray-900 mb-1">
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-sm text-gray-700 font-medium">
                                {player.position1 || 'Position not set'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {getAvailablePlayers().length === 0 && (
                        <p className="text-gray-600 text-sm italic font-medium bg-gray-100 p-3 rounded-lg text-center">
                          No players available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowPlayerSelectionModal(false);
                      setSelectedPosition(null);
                    }}
                    className="flex-1 p-4 bg-white text-gray-800 rounded-lg hover:bg-gray-50 border-2 border-gray-300 font-semibold transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRemovePlayer(selectedPosition);
                      setShowPlayerSelectionModal(false);
                      setSelectedPosition(null);
                    }}
                    className="flex-1 p-4 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 border-2 border-red-400 font-semibold transition-all duration-200 hover:shadow-md"
                    disabled={!match?.currentXV?.find(p => p.position === selectedPosition.id)}
                  >
                    Remove Player
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDay;
