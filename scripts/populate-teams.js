// Script to populate initial teams for AURFC Hub
// Run this script to create the initial team structure

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Preset teams configuration
const initialTeams = [
  {
    name: "Under 6 Rippa",
    ageGroup: "Under 6",
    type: "Rippa",
    description: "Rippa rugby for players under 6 years old",
    maxPlayers: 12,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 7 Rippa",
    ageGroup: "Under 7",
    type: "Rippa",
    description: "Rippa rugby for players under 7 years old",
    maxPlayers: 12,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 8 Open",
    ageGroup: "Under 8",
    type: "Open",
    description: "Open rugby for players under 8 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 8 Restricted",
    ageGroup: "Under 8",
    type: "Restricted",
    description: "Restricted rugby for players under 8 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 9 Open",
    ageGroup: "Under 9",
    type: "Open",
    description: "Open rugby for players under 9 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 9 Restricted",
    ageGroup: "Under 9",
    type: "Restricted",
    description: "Restricted rugby for players under 9 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 10 Open",
    ageGroup: "Under 10",
    type: "Open",
    description: "Open rugby for players under 10 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 10 Restricted",
    ageGroup: "Under 10",
    type: "Restricted",
    description: "Restricted rugby for players under 10 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 11 Open",
    ageGroup: "Under 11",
    type: "Open",
    description: "Open rugby for players under 11 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 11 Restricted",
    ageGroup: "Under 11",
    type: "Restricted",
    description: "Restricted rugby for players under 11 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 12 Open",
    ageGroup: "Under 12",
    type: "Open",
    description: "Open rugby for players under 12 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 12 Restricted",
    ageGroup: "Under 12",
    type: "Restricted",
    description: "Restricted rugby for players under 12 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 13 Open",
    ageGroup: "Under 13",
    type: "Open",
    description: "Open rugby for players under 13 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Under 13 Restricted",
    ageGroup: "Under 13",
    type: "Restricted",
    description: "Restricted rugby for players under 13 years old",
    maxPlayers: 15,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Function to populate teams
async function populateTeams() {
  try {
    console.log('Starting to populate teams...');
    
    const teamsCollection = collection(db, 'teams');
    
    for (const team of initialTeams) {
      try {
        const docRef = await addDoc(teamsCollection, team);
        console.log(`✅ Created team: ${team.name} with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to create team ${team.name}:`, error);
      }
    }
    
    console.log('🎉 Team population completed!');
    console.log(`Created ${initialTeams.length} teams`);
    
  } catch (error) {
    console.error('❌ Error populating teams:', error);
  }
}

// Function to check if teams already exist
async function checkExistingTeams() {
  try {
    const teamsCollection = collection(db, 'teams');
    const querySnapshot = await getDocs(teamsCollection);
    
    if (querySnapshot.empty) {
      console.log('No existing teams found. Proceeding with population...');
      return true;
    } else {
      console.log(`Found ${querySnapshot.size} existing teams.`);
      console.log('Teams already exist. Skipping population.');
      return false;
    }
  } catch (error) {
    console.error('Error checking existing teams:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 AURFC Teams Population Script');
  console.log('================================');
  
  const shouldPopulate = await checkExistingTeams();
  
  if (shouldPopulate) {
    await populateTeams();
  }
  
  console.log('Script completed.');
}

// Run the script
main().catch(console.error);
