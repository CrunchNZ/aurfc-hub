import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getParentAccount, 
  getFamilyOverview, 
  addChildToParent, 
  removeChildFromParent,
  updateChildPermissions,
  addEmergencyContact,
  removeEmergencyContact,
  updateFamilyNotifications,
  updateParentAccount
} from '../services/parent';
import { getTeamsForDropdown } from '../services/team';
import { getAllPositionNames, getPositionInfo, validatePositionCombination } from '../services/rugby-positions';
import { getFamilyCalendarEvents } from '../services/parent';
import { downloadICalFile } from '../services/calendar-export';

function ParentDashboard() {
  const { currentUser: user } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Form states
  const [addChildForm, setAddChildForm] = useState({
    childFirstName: '',
    childLastName: '',
    childDateOfBirth: '',
    registeredTeam: '',
    childEmail: '',
    preferredPositions: ['', ''], // Array for 2 positions
    relationship: 'child',
    permissions: {
      viewSchedule: true,
      viewPerformance: true,
      
      manageRSVP: true,
      receiveNotifications: true
    }
  });
  
  const [addContactForm, setAddContactForm] = useState({
    name: '',
    phone: '',
    relationship: '',
    isEmergency: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false
  });

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      const [parentData, teamsData] = await Promise.all([
        getFamilyOverview(user.uid),
        getTeamsForDropdown()
      ]);
      
      setFamilyData({
        ...parentData,
        teams: teamsData
      });
    } catch (error) {
      setError('Failed to load family data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      // Create a local child record since we're collecting the information directly
      const childData = {
        childId: `child-${Date.now()}`, // Generate a temporary ID
        firstName: addChildForm.childFirstName,
        lastName: addChildForm.childLastName,
        dateOfBirth: new Date(addChildForm.childDateOfBirth),
        registeredTeam: addChildForm.registeredTeam,
        email: addChildForm.childEmail || null,
        preferredPositions: addChildForm.preferredPositions.filter(pos => pos.trim() !== ''),
        relationship: addChildForm.relationship,
        addedAt: new Date(),
        permissions: addChildForm.permissions
      };

      // Add child to parent's children array
      const updatedChildren = [...(familyData.children || []), childData];
      
      // Update parent account with new child
      await updateParentAccount(user.uid, {
        children: updatedChildren
      });
      
      // Reset form
      setAddChildForm({
        childFirstName: '',
        childLastName: '',
        childDateOfBirth: '',
        registeredTeam: '',
        childEmail: '',
        preferredPositions: ['', ''],
        relationship: 'child',
        permissions: {
          viewSchedule: true,
          viewPerformance: true,
  
          manageRSVP: true,
          receiveNotifications: true
        }
      });
      
      setShowAddChild(false);
      loadFamilyData(); // Reload data
    } catch (error) {
      setError('Failed to add child: ' + error.message);
    }
  };

  const handleRemoveChild = async (childId) => {
    if (window.confirm('Are you sure you want to remove this child from your account?')) {
      try {
        await removeChildFromParent(user.uid, childId);
        loadFamilyData(); // Reload data
      } catch (error) {
        setError('Failed to remove child: ' + error.message);
      }
    }
  };

  const handleAddEmergencyContact = async (e) => {
    e.preventDefault();
    try {
      await addEmergencyContact(user.uid, addContactForm);
      setAddContactForm({
        name: '',
        phone: '',
        relationship: '',
        isEmergency: true
      });
      setShowAddContact(false);
      loadFamilyData(); // Reload data
    } catch (error) {
      setError('Failed to add emergency contact: ' + error.message);
    }
  };

  const handleRemoveEmergencyContact = async (contactId) => {
    if (window.confirm('Are you sure you want to remove this emergency contact?')) {
      try {
        await removeEmergencyContact(user.uid, contactId);
        loadFamilyData(); // Reload data
      } catch (error) {
        setError('Failed to remove emergency contact: ' + error.message);
      }
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      await updateFamilyNotifications(user.uid, notificationSettings);
      setShowSettings(false);
      // Show success message
    } catch (error) {
      setError('Failed to update notification settings: ' + error.message);
    }
  };

  const handleExportFamilyCalendar = () => {
    if (familyData && familyData.children.length > 0) {
      // Get events for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      getFamilyCalendarEvents(user.uid, startDate, endDate)
        .then(events => {
          downloadICalFile(events, 'family-calendar.ics');
        })
        .catch(error => {
          setError('Failed to export calendar: ' + error.message);
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Family Dashboard</h1>
          <p className="text-white mb-6">No family data found. Please contact support.</p>
          <button
            onClick={loadFamilyData}
            className="bg-white text-primary px-6 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-card shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Family Dashboard</h1>
              <p className="text-text-secondary">Manage your family's rugby activities and coordination</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportFamilyCalendar}
                className="bg-accent-gold text-text-primary px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-200 flex items-center gap-2"
              >
                📅 Export Family Calendar
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors duration-200 flex items-center gap-2"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-card shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 border-b border-secondary">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              👨‍👩‍👧‍👦 Family Overview
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'children'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              🏃 Children
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              📅 Family Calendar
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              📞 Emergency Contacts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Family Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Family Summary */}
              <div className="lg:col-span-2 bg-white rounded-card shadow-lg p-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Family Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-secondary-light rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {familyData.children.length}
                    </div>
                    <div className="text-text-secondary">Children Registered</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-light rounded-lg">
                    <div className="text-3xl font-bold text-accent-gold mb-2">
                      {familyData.children.filter(child => child.registeredTeam).length}
                    </div>
                    <div className="text-text-secondary">Active Teams</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {familyData.children.slice(0, 3).map(child => (
                      <div key={child.childId} className="flex items-center gap-3 p-3 bg-secondary-light rounded">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {child.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">{child.firstName} {child.lastName}</div>
                          <div className="text-sm text-text-secondary">
                            {child.registeredTeam ? `Team: ${child.registeredTeam}` : 'No team assigned'}
                          </div>
                           {child.preferredPositions && child.preferredPositions.length > 0 && (
                             <div className="text-xs text-text-secondary">
                               <span className="font-medium">Positions: </span>
                               <div className="flex gap-1 mt-1">
                                 {child.preferredPositions.map((pos, index) => {
                                   if (!pos) return null;
                                   const posInfo = getPositionInfo(pos);
                                   return (
                                     <span
                                       key={index}
                                       className={`px-1 py-0.5 rounded text-xs font-medium ${
                                         posInfo?.category === 'Forward' 
                                           ? 'bg-blue-100 text-blue-800' 
                                           : 'bg-purple-100 text-purple-800'
                                       }`}
                                     >
                                       {pos}
                                     </span>
                                   );
                                 })}
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-card shadow-lg p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                  >
                    ➕ Add Child
                  </button>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="w-full bg-accent-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    📞 Add Emergency Contact
                  </button>
                  <button
                    onClick={handleExportFamilyCalendar}
                    className="w-full bg-accent-gold text-text-primary px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
                  >
                    📅 Export Calendar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Children Tab */}
          {activeTab === 'children' && (
            <div className="bg-white rounded-card shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">Children Management</h2>
                <button
                  onClick={() => setShowAddChild(true)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  ➕ Add Child
                </button>
              </div>

              {familyData.children.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👶</div>
                  <h3 className="text-xl font-semibold text-text-secondary mb-2">No Children Added</h3>
                  <p className="text-text-secondary mb-4">Add your children to start managing their rugby activities</p>
                  <button
                    onClick={() => setShowAddChild(true)}
                    className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                  >
                    Add Your First Child
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {familyData.children.map(child => (
                    <div key={child.childId} className="bg-secondary-light rounded-lg p-6 border border-secondary">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {child.firstName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">
                            {child.firstName} {child.lastName}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {child.relationship} • Age: {new Date().getFullYear() - new Date(child.dateOfBirth?.toDate()).getFullYear()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Team:</span>
                          <span className="text-sm font-medium text-text-primary">
                            {child.registeredTeam || 'Not assigned'}
                          </span>
                        </div>
                        {child.preferredPositions && child.preferredPositions.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Positions:</span>
                            <div className="flex gap-1">
                              {child.preferredPositions.map((pos, index) => {
                                if (!pos) return null;
                                const posInfo = getPositionInfo(pos);
                                return (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      posInfo?.category === 'Forward' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                    title={`${pos} - ${posInfo?.description || ''}`}
                                  >
                                    {pos}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {child.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Email:</span>
                            <span className="text-sm font-medium text-text-primary">
                              {child.email}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Added:</span>
                          <span className="text-sm text-text-secondary">
                            {child.addedAt?.toDate?.()?.toLocaleDateString() || 
                             (child.addedAt instanceof Date ? child.addedAt.toLocaleDateString() : 'Recently')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveChild(child.childId)}
                          className="flex-1 bg-accent-red text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => {/* Navigate to child detail view */}}
                          className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm hover:bg-primary-dark transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Family Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-card shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Family Calendar</h2>
              <p className="text-text-secondary mb-6">
                View and manage all your children's upcoming events and activities
              </p>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-text-secondary mb-2">Calendar Integration</h3>
                <p className="text-text-secondary mb-4">
                  Family calendar view will be integrated with the main calendar component
                </p>
                <button
                  onClick={handleExportFamilyCalendar}
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  Export Family Calendar
                </button>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-card shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">Emergency Contacts</h2>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  📞 Add Contact
                </button>
              </div>

              {familyData.emergencyContacts?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📞</div>
                  <h3 className="text-xl font-semibold text-text-secondary mb-2">No Emergency Contacts</h3>
                  <p className="text-text-secondary mb-4">Add emergency contacts for your family's safety</p>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
                  >
                    Add First Contact
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {familyData.emergencyContacts.map(contact => (
                    <div key={contact.id} className="bg-secondary-light rounded-lg p-6 border border-secondary">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center text-white text-2xl">
                          🚨
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">{contact.name}</h3>
                          <p className="text-sm text-text-secondary">{contact.relationship}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-secondary">📱</span>
                          <span className="text-sm text-text-primary">{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-secondary">Added:</span>
                          <span className="text-sm text-text-secondary">
                            {contact.addedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveEmergencyContact(contact.id)}
                        className="w-full bg-accent-red text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Remove Contact
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Add Child to Family</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={addChildForm.childFirstName}
                  onChange={(e) => setAddChildForm({...addChildForm, childFirstName: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="First Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Child's Last Name
                </label>
                <input
                  type="text"
                  value={addChildForm.childLastName}
                  onChange={(e) => setAddChildForm({...addChildForm, childLastName: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Last Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={addChildForm.childDateOfBirth}
                  onChange={(e) => setAddChildForm({...addChildForm, childDateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Registered Team
                </label>
                <select
                  value={addChildForm.registeredTeam}
                  onChange={(e) => setAddChildForm({...addChildForm, registeredTeam: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a Team</option>
                  {familyData.teams?.map(team => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Select the team your child is registered for.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={addChildForm.childEmail}
                  onChange={(e) => setAddChildForm({...addChildForm, childEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="child@example.com"
                />
              </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-2">
                   Preferred Positions (2) - Optional
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                   <select
                     value={addChildForm.preferredPositions[0]}
                     onChange={(e) => setAddChildForm({...addChildForm, preferredPositions: [e.target.value, addChildForm.preferredPositions[1]]})}
                     className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                   >
                     <option value="">Select Position 1</option>
                     <optgroup label="Forward Positions">
                       <option value="Prop">Prop</option>
                       <option value="Hooker">Hooker</option>
                       <option value="Lock">Lock</option>
                       <option value="Flanker">Flanker</option>
                       <option value="Number 8">Number 8</option>
                     </optgroup>
                     <optgroup label="Back Positions">
                       <option value="Half-Back">Half-Back</option>
                       <option value="1st-Five">1st-Five</option>
                       <option value="2nd-Five">2nd-Five</option>
                       <option value="Centre">Centre</option>
                       <option value="Wing">Wing</option>
                       <option value="Fullback">Fullback</option>
                     </optgroup>
                   </select>
                   <select
                     value={addChildForm.preferredPositions[1]}
                     onChange={(e) => setAddChildForm({...addChildForm, preferredPositions: [addChildForm.preferredPositions[0], e.target.value]})}
                     className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                     disabled={!addChildForm.preferredPositions[0]}
                   >
                     <option value="">Select Position 2</option>
                     {addChildForm.preferredPositions[0] && (
                       <>
                         <optgroup label="Forward Positions">
                           <option value="Prop" disabled={addChildForm.preferredPositions[0] === "Prop"}>Prop</option>
                           <option value="Hooker" disabled={addChildForm.preferredPositions[0] === "Hooker"}>Hooker</option>
                           <option value="Lock" disabled={addChildForm.preferredPositions[0] === "Lock"}>Lock</option>
                           <option value="Flanker" disabled={addChildForm.preferredPositions[0] === "Flanker"}>Flanker</option>
                           <option value="Number 8" disabled={addChildForm.preferredPositions[0] === "Number 8"}>Number 8</option>
                         </optgroup>
                         <optgroup label="Back Positions">
                           <option value="Half-Back" disabled={addChildForm.preferredPositions[0] === "Half-Back"}>Half-Back</option>
                           <option value="1st-Five" disabled={addChildForm.preferredPositions[0] === "1st-Five"}>1st-Five</option>
                           <option value="2nd-Five" disabled={addChildForm.preferredPositions[0] === "2nd-Five"}>2nd-Five</option>
                           <option value="Centre" disabled={addChildForm.preferredPositions[0] === "Centre"}>Centre</option>
                           <option value="Wing" disabled={addChildForm.preferredPositions[0] === "Wing"}>Wing</option>
                           <option value="Fullback" disabled={addChildForm.preferredPositions[0] === "Fullback"}>Fullback</option>
                         </optgroup>
                       </>
                     )}
                   </select>
                 </div>
                 <p className="text-xs text-text-secondary mt-1">
                   Select up to 2 preferred rugby positions for your child
                 </p>
                 {addChildForm.preferredPositions[0] && addChildForm.preferredPositions[1] && (
                   <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm font-medium text-green-800">
                           ✓ Positions Selected
                         </p>
                         <div className="flex gap-2 mt-1">
                           {addChildForm.preferredPositions.map((pos, index) => {
                             if (!pos) return null;
                             const posInfo = getPositionInfo(pos);
                             return (
                               <span
                                 key={index}
                                 className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   posInfo?.category === 'Forward' 
                                     ? 'bg-blue-100 text-blue-800' 
                                     : 'bg-purple-100 text-purple-800'
                                 }`}
                               >
                                 {pos} ({posInfo?.number})
                               </span>
                             );
                           })}
                         </div>
                         {(() => {
                           const validation = validatePositionCombination(addChildForm.preferredPositions);
                           return (
                             <p className="text-xs text-green-600 mt-1">
                               {validation.message}
                             </p>
                           );
                         })()}
                       </div>
                       <button
                         type="button"
                         onClick={() => setAddChildForm({...addChildForm, preferredPositions: ['', '']})}
                         className="text-sm text-red-500 hover:text-red-700 underline"
                       >
                         Clear
                       </button>
                     </div>
                   </div>
                 )}
               </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Relationship
                </label>
                <select
                  value={addChildForm.relationship}
                  onChange={(e) => setAddChildForm({...addChildForm, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="child">Child</option>
                  <option value="stepchild">Stepchild</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="ward">Ward</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  Add Child
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="flex-1 bg-secondary text-text-primary px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Emergency Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Add Emergency Contact</h3>
            <form onSubmit={handleAddEmergencyContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={addContactForm.name}
                  onChange={(e) => setAddContactForm({...addContactForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={addContactForm.phone}
                  onChange={(e) => setAddContactForm({...addContactForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={addContactForm.relationship}
                  onChange={(e) => setAddContactForm({...addContactForm, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Parent, Guardian, Relative"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 bg-secondary text-text-primary px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Family Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-text-primary mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email}
                      onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})}
                      className="mr-2"
                    />
                    Email Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push}
                      onChange={(e) => setNotificationSettings({...notificationSettings, push: e.target.checked})}
                      className="mr-2"
                    />
                    Push Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sms}
                      onChange={(e) => setNotificationSettings({...notificationSettings, sms: e.target.checked})}
                      className="mr-2"
                    />
                    SMS Notifications
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateNotifications}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-secondary text-text-primary px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard; 