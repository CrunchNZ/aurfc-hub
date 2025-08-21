import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Phone, 
  Calendar,
  Trophy,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

const TeamManagement = () => {
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'player',
    position: '',
    teamPreference: '',
    dateOfBirth: '',
    emergencyContact: '',
    medicalConditions: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadTeamMembers();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm, filterRole]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      
      const membersQuery = query(
        collection(db, 'users'),
        orderBy('lastName')
      );
      
      const snapshot = await getDocs(membersQuery);
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member => 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    setFilteredMembers(filtered);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...newMember,
        dateOfBirth: new Date(newMember.dateOfBirth),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        profileComplete: true
      });
      
      setShowAddModal(false);
      setNewMember({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'player',
        position: '',
        teamPreference: '',
        dateOfBirth: '',
        emergencyContact: '',
        medicalConditions: ''
      });
      
      await loadTeamMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Please try again.');
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    try {
      const memberRef = doc(db, 'users', selectedMember.id);
      await updateDoc(memberRef, {
        ...selectedMember,
        dateOfBirth: new Date(selectedMember.dateOfBirth),
        updatedAt: new Date()
      });
      
      setShowEditModal(false);
      setSelectedMember(null);
      await loadTeamMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member. Please try again.');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'users', memberId));
        await loadTeamMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member. Please try again.');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Position', 'Team Preference'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        member.firstName,
        member.lastName,
        member.email,
        member.phone || '',
        member.role,
        member.position || '',
        member.teamPreference || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team_members.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="team-management">
      <div className="page-header">
        <h1>Team Management</h1>
        <p>Manage team members, roles, and information</p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filter-row">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="player">Players</option>
            <option value="coach">Coaches</option>
            <option value="manager">Managers</option>
            <option value="parent">Parents</option>
            <option value="junior">Juniors</option>
          </select>
        </div>

        <div className="action-buttons">
          <button onClick={exportToCSV} className="btn btn-outline">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <UserPlus size={16} />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{filteredMembers.length}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h3>{filteredMembers.filter(m => m.role === 'player').length}</h3>
            <p>Players</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{filteredMembers.filter(m => m.role === 'coach').length}</h3>
            <p>Coaches</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{filteredMembers.filter(m => m.role === 'junior').length}</h3>
            <p>Juniors</p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Position</th>
              <th>Team</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <div className="member-name">
                    <strong>{member.firstName} {member.lastName}</strong>
                    {member.role === 'junior' && (
                      <span className="junior-badge">Junior</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="member-email">
                    <Mail size={14} />
                    {member.email}
                  </div>
                </td>
                <td>
                  <span className={`role-badge role-${member.role}`}>
                    {member.role}
                  </span>
                </td>
                <td>{member.position || 'N/A'}</td>
                <td>{member.teamPreference || 'N/A'}</td>
                <td>
                  {member.phone && (
                    <div className="member-phone">
                      <Phone size={14} />
                      {member.phone}
                    </div>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowEditModal(true);
                      }}
                      className="btn-icon btn-edit"
                      title="Edit Member"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="btn-icon btn-delete"
                      title="Delete Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No members found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleAddMember} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    required
                    value={newMember.firstName}
                    onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newMember.lastName}
                    onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    required
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="player">Player</option>
                    <option value="coach">Coach</option>
                    <option value="manager">Manager</option>
                    <option value="parent">Parent</option>
                    <option value="junior">Junior</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={newMember.position}
                    onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Team Preference</label>
                  <select
                    value={newMember.teamPreference}
                    onChange={(e) => setNewMember({...newMember, teamPreference: e.target.value})}
                  >
                    <option value="">Select Team</option>
                    <option value="premier">Premier</option>
                    <option value="development">Development</option>
                    <option value="colts">Colts</option>
                    <option value="women">Women's</option>
                    <option value="juniors">Juniors</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={newMember.dateOfBirth}
                    onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Member</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleEditMember} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    required
                    value={selectedMember.firstName}
                    onChange={(e) => setSelectedMember({...selectedMember, firstName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={selectedMember.lastName}
                    onChange={(e) => setSelectedMember({...selectedMember, lastName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={selectedMember.email}
                    onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={selectedMember.phone || ''}
                    onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    required
                    value={selectedMember.role}
                    onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
                  >
                    <option value="player">Player</option>
                    <option value="coach">Coach</option>
                    <option value="manager">Manager</option>
                    <option value="parent">Parent</option>
                    <option value="junior">Junior</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={selectedMember.position || ''}
                    onChange={(e) => setSelectedMember({...selectedMember, position: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Team Preference</label>
                  <select
                    value={selectedMember.teamPreference || ''}
                    onChange={(e) => setSelectedMember({...selectedMember, teamPreference: e.target.value})}
                  >
                    <option value="">Select Team</option>
                    <option value="premier">Premier</option>
                    <option value="development">Development</option>
                    <option value="colts">Colts</option>
                    <option value="women">Women's</option>
                    <option value="juniors">Juniors</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={selectedMember.dateOfBirth ? 
                      (selectedMember.dateOfBirth.toDate ? 
                        selectedMember.dateOfBirth.toDate().toISOString().split('T')[0] : 
                        selectedMember.dateOfBirth) : ''}
                    onChange={(e) => setSelectedMember({...selectedMember, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;