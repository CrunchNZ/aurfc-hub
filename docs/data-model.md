# AURFC Hub - Firestore Data Model

## Overview
This document defines the Firestore database structure for the AURFC Hub application, including collections, documents, and field definitions.

## Collections

### 1. Users Collection (`users/{userId}`)
**Purpose**: Store user profiles, authentication data, and role-based access control information.

**Fields**:
```typescript
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User's email address
  firstName: string,              // First name
  lastName: string,               // Last name
  role: 'admin' | 'coach' | 'player' | 'parent' | 'junior', // User role
  dateOfBirth: timestamp,         // Date of birth
  phone: string,                  // Phone number
  address: {                      // Address object
    street: string,
    city: string,
    postalCode: string,
    country: string
  },
  teamPreference: string | null,  // Preferred team ID
  parentEmail: string | null,     // Parent email (for juniors)
  consent: boolean,               // Parental consent (for juniors)
  medicalConditions: string[],    // Medical conditions
  emergencyContact: {             // Emergency contact info
    name: string,
    phone: string,
    relationship: string
  },
  profileComplete: boolean,       // Profile completion status
  isActive: boolean,              // Account active status
  emailVerified: boolean,         // Email verification status
  createdAt: timestamp,           // Account creation date
  updatedAt: timestamp,           // Last update date
  lastLoginAt: timestamp,         // Last login date
  profilePicture: string | null,  // Profile picture URL
  preferences: {                  // User preferences
    notifications: {
      email: boolean,
      push: boolean,
      sms: boolean
    },
    privacy: {
      showProfile: boolean,
      showStats: boolean
    }
  }
}
```

### 2. Teams Collection (`teams/{teamId}`)
**Purpose**: Store team information, rosters, and team-specific data.

**Fields**:
```typescript
{
  id: string,                     // Team ID
  name: string,                   // Team name
  category: 'senior' | 'junior' | 'women', // Team category
  ageGroup: string,               // Age group (e.g., "Under 16")
  division: string,               // Competition division
  season: string,                 // Current season
  coachIds: string[],             // Array of coach user IDs
  playerIds: string[],            // Array of player user IDs
  captainId: string | null,       // Team captain user ID
  homeGround: string,             // Home ground location
  colors: {                       // Team colors
    primary: string,
    secondary: string
  },
  logo: string | null,            // Team logo URL
  description: string,             // Team description
  isActive: boolean,               // Team active status
  createdAt: timestamp,           // Team creation date
  updatedAt: timestamp,           // Last update date
  stats: {                        // Team statistics
    matchesPlayed: number,
    matchesWon: number,
    matchesLost: number,
    matchesDrawn: number,
    pointsFor: number,
    pointsAgainst: number
  }
}
```

### 3. Events Collection (`events/{eventId}`)
**Purpose**: Store training sessions, matches, tournaments, and other club events.

**Fields**:
```typescript
{
  id: string,                     // Event ID
  title: string,                  // Event title
  description: string,             // Event description
  type: 'training' | 'match' | 'tournament' | 'meeting' | 'social', // Event type
  startTime: timestamp,           // Event start time
  endTime: timestamp,             // Event end time
  location: {                     // Event location
    name: string,
    address: string,
    coordinates: {                 // GPS coordinates
      latitude: number,
      longitude: number
    }
  },
  teamIds: string[],              // Teams involved
  organizerId: string,            // Event organizer user ID
  maxParticipants: number | null, // Maximum participants
  rsvps: {                        // RSVP responses
    confirmed: string[],           // User IDs who confirmed
    declined: string[],            // User IDs who declined
    pending: string[]              // User IDs who haven't responded
  },
  attendance: {                    // Attendance tracking
    present: string[],             // User IDs present
    absent: string[],              // User IDs absent
    late: string[]                 // User IDs who arrived late
  },
  requirements: string[],          // Required equipment/attire
  cost: number | null,            // Event cost
  isPublic: boolean,               // Public visibility
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
  createdAt: timestamp,           // Event creation date
  updatedAt: timestamp,           // Last update date
  reminders: {                     // Reminder settings
    enabled: boolean,
    times: number[]                // Minutes before event
  }
}
```

### 4. Chats Collection (`chats/{chatId}/messages/{messageId}`)
**Purpose**: Store real-time messaging between users and teams.

**Fields**:
```typescript
{
  id: string,                     // Message ID
  chatId: string,                 // Chat room ID
  userId: string,                 // Sender user ID
  content: string,                // Message content
  type: 'text' | 'image' | 'file' | 'system', // Message type
  attachments: {                   // File attachments
    url: string,
    filename: string,
    size: number,
    type: string
  }[],
  timestamp: timestamp,            // Message timestamp
  edited: boolean,                 // Message edited flag
  editedAt: timestamp | null,     // Last edit timestamp
  reactions: {                     // Message reactions
    [emoji: string]: string[]      // Emoji -> User IDs
  },
  replyTo: string | null,          // Reply to message ID
  isDeleted: boolean               // Message deleted flag
}
```

### 5. Performances Collection (`performances/{performanceId}`)
**Purpose**: Store player performance data, statistics, and tracking information.

**Fields**:
```typescript
{
  id: string,                     // Performance record ID
  playerId: string,               // Player user ID
  teamId: string,                 // Team ID
  eventId: string,                // Event ID (match/training)
  date: timestamp,                // Performance date
  stats: {                        // Performance statistics
    tries: number,
    conversions: number,
    penalties: number,
    dropGoals: number,
    tackles: number,
    tacklesMissed: number,
    passes: number,
    passesCompleted: number,
    metersRun: number,
    lineBreaks: number,
    turnovers: number
  },
  fitness: {                       // Fitness metrics
    weight: number,                // Weight in kg
    bodyFat: number,               // Body fat percentage
    vo2Max: number,                // VO2 max
    strength: {                     // Strength measurements
      benchPress: number,
      squat: number,
      deadlift: number
    }
  },
  notes: string,                   // Coach notes
  rating: number,                  // Performance rating (1-10)
  coachId: string,                 // Coach user ID
  createdAt: timestamp,            // Record creation date
  updatedAt: timestamp             // Last update date
}
```

### 6. Drills Collection (`drills/{drillId}`)
**Purpose**: Store training drills, exercises, and playbook information.

**Fields**:
```typescript
{
  id: string,                     // Drill ID
  name: string,                   // Drill name
  description: string,             // Drill description
  category: 'passing' | 'tackling' | 'rucking' | 'scrummaging' | 'lineout' | 'fitness',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  duration: number,                // Duration in minutes
  playersRequired: {               // Player requirements
    min: number,
    max: number
  },
  equipment: string[],             // Required equipment
  instructions: string[],          // Step-by-step instructions
  videoUrl: string | null,         // Instructional video URL
  diagramUrl: string | null,       // Drill diagram URL
  variations: string[],             // Drill variations
  coachNotes: string,              // Coach-specific notes
  tags: string[],                  // Search tags
  createdBy: string,               // Creator user ID
  isPublic: boolean,               // Public visibility
  createdAt: timestamp,            // Creation date
  updatedAt: timestamp,            // Last update date
  usageCount: number               // Times used in training
}
```

### 7. Badges Collection (`badges/{badgeId}`)
**Purpose**: Store gamification badges and achievements for junior players.

**Fields**:
```typescript
{
  id: string,                     // Badge ID
  name: string,                    // Badge name
  description: string,             // Badge description
  category: 'skill' | 'attendance' | 'sportsmanship' | 'leadership' | 'fitness',
  icon: string,                    // Badge icon URL
  criteria: {                      // Badge criteria
    type: 'count' | 'streak' | 'achievement' | 'manual',
    target: number,                // Target value
    metric: string,                // What to count
    timeframe: string | null       // Time limit
  },
  points: number,                  // Points awarded
  isActive: boolean,               // Badge active status
  createdAt: timestamp,            // Creation date
  updatedAt: timestamp             // Last update date
}
```

### 8. Juniors Collection (`juniors/{juniorId}`)
**Purpose**: Store junior-specific data and parent access information.

**Fields**:
```typescript
{
  id: string,                     // Junior user ID
  parentId: string,                // Parent user ID
  emergencyContacts: {             // Emergency contact info
    primary: {
      name: string,
      phone: string,
      relationship: string
    },
    secondary: {
      name: string,
      phone: string,
      relationship: string
    }
  },
  medicalInfo: {                   // Medical information
    conditions: string[],
    allergies: string[],
    medications: string[],
    dietaryRestrictions: string[]
  },
  consentForms: {                  // Consent form tracking
    medical: boolean,
    photo: boolean,
    travel: boolean,
    lastUpdated: timestamp
  },
  progress: {                       // Development progress
    skills: {                       // Skill assessments
      [skill: string]: number      // Skill name -> Rating (1-5)
    },
    goals: string[],                // Development goals
    achievements: string[]          // Achievement IDs
  },
  notes: {                          // Coach and parent notes
    [noteId: string]: {
      content: string,
      authorId: string,
      timestamp: timestamp,
      isPrivate: boolean
    }
  },
  createdAt: timestamp,             // Creation date
  updatedAt: timestamp              // Last update date
}
```

## Indexes

### Required Composite Indexes
The following composite indexes are required for efficient queries:

1. **Users by Role and Team**:
   - Collection: `users`
   - Fields: `role` (Ascending), `teamPreference` (Ascending)

2. **Events by Team and Date**:
   - Collection: `events`
   - Fields: `teamIds` (Array), `startTime` (Ascending)

3. **Performances by Player and Date**:
   - Collection: `performances`
   - Fields: `playerId` (Ascending), `date` (Descending)

4. **Chat Messages by Chat and Time**:
   - Collection: `chats/{chatId}/messages`
   - Fields: `timestamp` (Ascending)

5. **Drills by Category and Difficulty**:
   - Collection: `drills`
   - Fields: `category` (Ascending), `difficulty` (Ascending)

## Security Rules
Security rules have been implemented in `firestore.rules` with role-based access control:
- Users can read/write their own data
- Coaches can access team and player data
- Admins have full access
- Parents can access their children's data
- All other access is denied by default

## Data Validation
- All required fields are enforced at the application level
- Timestamps are automatically generated
- User IDs are validated against Firebase Auth
- Role-based permissions are enforced
- Data consistency is maintained through transactions where needed
