import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper function to fetch data and set state
const fetchDataAndSetState = async (setTeams, setMembers, setUnassignedMembers, setError) => {
  try {
    const token = localStorage.getItem('token');
    const [teamsRes, membersRes] = await Promise.all([
      axios.get('http://localhost:3000/api/teams', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:3000/api/members', { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const teams = teamsRes.data || [];
    const members = membersRes.data || [];
    const unassignedMembers = members.filter((member) => !member.teamId);

    setTeams(teams);
    setMembers(members);
    setUnassignedMembers(unassignedMembers);
    setError(null);
  } catch (err) {
    setError('Failed to fetch teams or members.');
    console.error(err);
  }
};

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const refreshData = () => {
    fetchDataAndSetState(setTeams, setMembers, setUnassignedMembers, setError);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleTeamClick = (team) => {
    setSelectedTeamId(team.id);
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const closeTeamModal = () => {
    setSelectedTeamId(null);
    setSelectedTeam(null);
    setIsTeamModalOpen(false);
  };

  const handleMemberClick = (member) => {
    setMemberToEdit(member);
    setIsEditMemberModalOpen(true);
  };

  const closeEditMemberModal = () => {
    setMemberToEdit(null);
    setIsEditMemberModalOpen(false);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshData();
    } catch (err) {
      setError('Failed to delete team.');
      console.error(err);
    }
  };

  const handleUpdateMemberDetails = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/members/${memberToEdit.id}`,
        {
          name: memberToEdit.name,
          role: memberToEdit.role,
          maxHours: memberToEdit.maxHours,
          skills: memberToEdit.skills,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      refreshData();
      closeEditMemberModal();
    } catch (err) {
      setError('Failed to update member details.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="app-heading mb-2">Team Management</h1>
        <p className="text-dark-text-secondary">Manage your teams and members</p>
      </div>
      
      {error && (
        <div className="mb-6 app-card bg-error bg-opacity-10 border-error">
          <p className="text-error font-semibold">{error}</p>
        </div>
      )}

      <button
        onClick={() => navigate('/teams/new')}
        className="mb-6 btn-primary"
      >
        + Create New Team
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(teams) && teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="app-card cursor-pointer relative group"
              onClick={() => handleTeamClick(team)}
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity btn-danger px-3 py-1 text-sm"
                >
                  Delete
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-dark-text mb-2">{team.name}</h2>
              <p className="text-dark-text-secondary mb-4">{team.description || 'No description'}</p>
              <div className="flex items-center gap-2 text-sm text-dark-muted">
                <span className="flex items-center gap-1">
                  👥 {members.filter((member) => member.teamId === team.id).length} members
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full app-card text-center py-12">
            <p className="text-dark-muted text-lg">No teams available. Create a new team to get started.</p>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {isTeamModalOpen && selectedTeam && (
        <div className="app-modal">
          <div className="app-modal-content">
            <button
              onClick={closeTeamModal}
              className="absolute top-4 right-4 text-dark-text hover:text-primary transition-colors text-2xl"
            >
              ✕
            </button>
            
            <h2 className="app-subheading mb-2">{selectedTeam.name}</h2>
            <p className="text-dark-text-secondary mb-6">{selectedTeam.description || 'No description'}</p>

            <h3 className="text-lg font-semibold text-dark-text mb-4">Team Members</h3>
            <div className="space-y-2">
              {members
                .filter((member) => member.teamId === selectedTeamId)
                .map((member) => (
                  <div
                    key={member.id}
                    className="bg-dark-surface-light p-4 rounded-xl cursor-pointer hover:bg-dark-border transition-colors"
                    onClick={() => handleMemberClick(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-dark-text font-semibold">{member.name}</p>
                        <p className="text-dark-text-secondary text-sm">{member.role}</p>
                      </div>
                      <span className="text-primary text-sm">Edit →</span>
                    </div>
                  </div>
                ))}
              {members.filter((member) => member.teamId === selectedTeamId).length === 0 && (
                <p className="text-dark-muted text-center py-8">No members in this team yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Member Modal */}
      {isEditMemberModalOpen && memberToEdit && (
        <div className="app-modal">
          <div className="app-modal-content">
            <button
              onClick={closeEditMemberModal}
              className="absolute top-4 right-4 text-dark-text hover:text-primary transition-colors text-2xl"
            >
              ✕
            </button>
            
            <h2 className="app-subheading mb-6">Edit Member</h2>
            <form onSubmit={handleUpdateMemberDetails} className="space-y-4">
              <div>
                <label className="app-label">Name</label>
                <input
                  type="text"
                  value={memberToEdit.name}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, name: e.target.value })}
                  className="app-input"
                  required
                />
              </div>
              
              <div>
                <label className="app-label">Email</label>
                <input
                  type="email"
                  value={memberToEdit.email}
                  disabled
                  className="app-input opacity-50 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="app-label">Role</label>
                <input
                  type="text"
                  value={memberToEdit.role}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, role: e.target.value })}
                  className="app-input"
                  required
                />
              </div>
              
              <div>
                <label className="app-label">Max Hours</label>
                <input
                  type="number"
                  value={memberToEdit.maxHours}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, maxHours: e.target.value })}
                  className="app-input"
                  required
                />
              </div>
              
              <div>
                <label className="app-label">Skills (JSON)</label>
                <textarea
                  value={memberToEdit.skills}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, skills: e.target.value })}
                  className="app-textarea h-24"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditMemberModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;