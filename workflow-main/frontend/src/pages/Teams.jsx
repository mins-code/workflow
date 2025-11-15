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
    setError(null); // Clear any previous errors
  } catch (err) {
    setError('Failed to fetch teams or members.');
    console.error(err);
  }
};

const Teams = () => {
  const [teams, setTeams] = useState([]); // List of teams
  const [members, setMembers] = useState([]); // List of all members
  const [unassignedMembers, setUnassignedMembers] = useState([]); // Members without a team
  const [selectedTeamId, setSelectedTeamId] = useState(null); // Currently selected team ID
  const [selectedTeam, setSelectedTeam] = useState(null); // Currently selected team details
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false); // Team detail modal state
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false); // Edit member modal state
  const [memberToEdit, setMemberToEdit] = useState(null); // Member being edited
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch teams and members on load and refresh
  const refreshData = () => {
    fetchDataAndSetState(setTeams, setMembers, setUnassignedMembers, setError);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Open the Team Detail Modal
  const handleTeamClick = (team) => {
    setSelectedTeamId(team.id);
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  // Close the Team Detail Modal
  const closeTeamModal = () => {
    setSelectedTeamId(null);
    setSelectedTeam(null);
    setIsTeamModalOpen(false);
  };

  // Open the Edit Member Modal
  const handleMemberClick = (member) => {
    setMemberToEdit(member);
    setIsEditMemberModalOpen(true);
  };

  // Close the Edit Member Modal
  const closeEditMemberModal = () => {
    setMemberToEdit(null);
    setIsEditMemberModalOpen(false);
  };

  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the data after deletion
      refreshData();
    } catch (err) {
      setError('Failed to delete team.');
      console.error(err);
    }
  };

  // Handle updating member details
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
          skills: memberToEdit.skills, // Assuming skills is a JSON string
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data and close the modal
      refreshData();
      closeEditMemberModal();
    } catch (err) {
      setError('Failed to update member details.');
      console.error(err);
    }
  };

  return (
    // Assuming the background is dark (bg-dark-bg/bg-dark-surface)
    <div className="p-6">
      {/* CHANGE: Update text color class to Platinum (#e0e1dd) */}
      <h1 className="text-2xl font-bold text-dark-text mb-4">Team Management</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Create New Team Button */}

      {/* Create New Team Button */}
      <button
        onClick={() => navigate('/teams/new')}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        + Create New Team
      </button>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(teams) && teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition relative"
              onClick={() => handleTeamClick(team)}
            >
              <h2 className="text-xl font-bold text-black">{team.name}</h2>
              <p className="text-black">{team.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Members: {members.filter((member) => member.teamId === team.id).length}
              </p>

              {/* Delete Team Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the team click event
                  handleDeleteTeam(team.id);
                }}
                className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No teams available. Create a new team to get started.</p>
        )}
      </div>

      {/* Team Detail Modal */}
      {/* Team Detail Modal */}
      {isTeamModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* CHANGE: Modal background to dark surface */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              onClick={closeTeamModal}
              // CHANGE: Set close button color to Platinum (text-dark-text)
              className="absolute top-3 right-3 text-dark-text hover:text-dark-accent"
            >
              ✕
            </button>
            {/* CHANGE: Set text colors to Platinum (text-dark-text) */}
            <h2 className="text-2xl font-bold mb-4 text-dark-text">{selectedTeam.name}</h2>
            <p className="text-dark-text mb-4">{selectedTeam.description}</p>

            <h3 className="text-xl font-semibold mb-2 text-dark-text">Team Members</h3>
            <ul className="space-y-2">
              {members
                .filter((member) => member.teamId === selectedTeamId)
                .map((member) => (
                  <li
                    key={member.id}
                    // CHANGE: List item background to darkest color (rich-black) and use dark-text
                    className="bg-dark-bg p-2 rounded-md cursor-pointer hover:bg-dark-surface-light text-dark-text"
                    onClick={() => handleMemberClick(member)}
                  >
                    {member.name} - {member.role}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Edit Member Modal */}
      {isEditMemberModalOpen && memberToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* CHANGE: Modal background to dark surface */}
          <div className="bg-dark-surface p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={closeEditMemberModal}
              // CHANGE: Set close button color to Platinum (text-dark-text)
              className="absolute top-3 right-3 text-dark-text hover:text-dark-accent"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-dark-text">Edit Member</h2>
            <form onSubmit={handleUpdateMemberDetails} className="space-y-4">
              <div>
                {/* CHANGE: Label text color */}
                <label className="block text-sm font-medium text-dark-text">Name</label>
                <input
                  type="text"
                  value={memberToEdit.name}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, name: e.target.value })}
                  // CHANGE: Input styles to dark background/light text/accent borders
                  className="w-full border border-dark-accent rounded-md p-2 focus:ring-dark-accent focus:border-dark-accent bg-dark-bg text-dark-text"
                  required
                />
              </div>
              <div>
                {/* CHANGE: Label text color */}
                <label className="block text-sm font-medium text-dark-text">Email</label>
                <input
                  type="email"
                  value={memberToEdit.email}
                  disabled
                  // CHANGE: Disabled input styles to dark background/muted text
                  className="w-full border border-dark-accent rounded-md p-2 bg-dark-bg text-dark-muted"
                />
              </div>
              <div>
                {/* CHANGE: Label text color */}
                <label className="block text-sm font-medium text-dark-text">Role</label>
                <input
                  type="text"
                  value={memberToEdit.role}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, role: e.target.value })}
                  // CHANGE: Input styles
                  className="w-full border border-dark-accent rounded-md p-2 focus:ring-dark-accent focus:border-dark-accent bg-dark-bg text-dark-text"
                  required
                />
              </div>
              <div>
                {/* CHANGE: Label text color */}
                <label className="block text-sm font-medium text-dark-text">Max Hours</label>
                <input
                  type="number"
                  value={memberToEdit.maxHours}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, maxHours: e.target.value })}
                  // CHANGE: Input styles
                  className="w-full border border-dark-accent rounded-md p-2 focus:ring-dark-accent focus:border-dark-accent bg-dark-bg text-dark-text"
                  required
                />
              </div>
              <div>
                {/* CHANGE: Label text color */}
                <label className="block text-sm font-medium text-dark-text">Skills (JSON)</label>
                <textarea
                  value={memberToEdit.skills}
                  onChange={(e) => setMemberToEdit({ ...memberToEdit, skills: e.target.value })}
                  // CHANGE: Textarea styles
                  className="w-full border border-dark-accent rounded-md p-2 focus:ring-dark-accent focus:border-dark-accent bg-dark-bg text-dark-text"
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  // Buttons are kept blue/white but should be checked against dark theme constraints
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
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