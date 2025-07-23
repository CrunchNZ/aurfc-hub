import React, { useState } from 'react';
import { createRoster, trackPerformance, createDrill } from '../services/team';
import { auth } from '../firebase';

function TeamManagement() {
  const [teamData, setTeamData] = useState('');
  const [perfData, setPerfData] = useState('');
  const [drillData, setDrillData] = useState('');
  const user = auth.currentUser;

  // Simple check for coach role (in real app, fetch from Firestore)
  if (user.role !== 'coach') return <p>Access denied</p>;

  const handleCreateRoster = async () => {
    await createRoster('team1', JSON.parse(teamData));
  };

  const handleTrackPerf = async () => {
    await trackPerformance('player1', JSON.parse(perfData));
  };

  const handleCreateDrill = async () => {
    await createDrill('drill1', JSON.parse(drillData));
  };

  return (
    <div>
      <h2>Team Management</h2>
      <textarea value={teamData} onChange={(e) => setTeamData(e.target.value)} placeholder="Team data JSON" />
      <button onClick={handleCreateRoster}>Create Roster</button>
      <textarea value={perfData} onChange={(e) => setPerfData(e.target.value)} placeholder="Performance JSON" />
      <button onClick={handleTrackPerf}>Track Performance</button>
      <textarea value={drillData} onChange={(e) => setDrillData(e.target.value)} placeholder="Drill JSON" />
      <button onClick={handleCreateDrill}>Create Drill</button>
    </div>
  );
}

export default TeamManagement; 