import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTeamPage = () => {
  const [step, setStep] = useState(1); // Step 1: Team Details, Step 2: Member Onboarding
  const [teamData, setTeamData] = useState({ name: '', description: '' });
  const [newTeamId, setNewTeamId] = useState(null);
  const [onboardedMembers, setOnboardedMembers] = useState([]); // Local state for onboarded members
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Developer' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle form input changes for team details
  const handleTeamInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for new member
  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  // Handle team creation
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/teams',
        teamData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTeamId(res.data.id); // Save the new team ID
      setStep(2); // Move to Step 2
    } catch (err) {
      setError('Failed to create team.');
      console.error(err);
    }
  };

  // Add a new member to the onboardedMembers list
  const handleAddMemberToList = (e) => {
    e.preventDefault();
    setOnboardedMembers((prev) => [...prev, newMember]);
    setNewMember({ name: '', email: '', role: 'Developer' }); // Reset the form
  };

  // Remove a member from the onboardedMembers list
  const handleRemoveMember = (index) => {
    setOnboardedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Final submission logic
  const handleFinishSetup = async () => {
    try {
      const token = localStorage.getItem('token');

      // Loop through onboardedMembers and onboard each member
      for (const member of onboardedMembers) {
        // Step 1: Onboard the member
        const onboardRes = await axios.post(
          'http://localhost:3000/api/members/onboard',
          { ...member, skills: {}, availability: 1.0, maxHours: 40 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newUser = onboardRes.data;

        // Step 2: Assign the member to the team
        await axios.put(
          `http://localhost:3000/api/members/${newUser.id}`,
          { teamId: newTeamId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Navigate back to the teams page
      navigate('/teams');
    } catch (err) {
      setError('Failed to finish team setup.');
      console.error(err);
    }
  };

  // Render Step 1: Team Details
 if (step === 1) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-dark-text mb-4">Create New Team</h1>
        {error && <p className="text-red-400">{error}</p>}
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text">Team Name</label>
            <input
              type="text"
              name="name"
              value={teamData.name}
              onChange={handleTeamInputChange}
              className="text-black border rounded px-2 py-1 w-full"
              placeholder="Team Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text">Description</label>
            <textarea
              name="description"
              value={teamData.description}
              onChange={handleTeamInputChange}
              className="text-black border rounded px-2 py-1 w-full"
              placeholder="Description"
              rows="3"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Create Team
          </button>
        </form>
      </div>
    );
  }

  // Render Step 2: Member Onboarding
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark-text mb-4">Onboard Members to Team</h1>
      {error && <p className="text-red-400">{error}</p>}
      <form onSubmit={handleAddMemberToList} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text">Name</label>
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleMemberInputChange}
            className="text-black border rounded px-2 py-1 w-full"
            placeholder="Member Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-text">Email</label>
          <input
            type="email"
            name="email"
            value={newMember.email}
            onChange={handleMemberInputChange}
            className="text-black border rounded px-2 py-1 w-full"
            placeholder="Member Email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-text">Role</label>
          <input
            type="text"
            name="role"
            value={newMember.role}
            onChange={handleMemberInputChange}
            className="border-2 border-gray-400 rounded px-3 py-2 w-full text-gray-900 font-medium bg-white"
            style={{ color: '#1f2937' }}
            placeholder="Member Role"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Add Member to List
        </button>
      </form>

      {/* Display onboarded members */}
      <h2 className="text-xl font-bold text-dark-text mt-6">Onboarded Members</h2>
      <ul className="space-y-4 mt-4">
        {onboardedMembers.map((member, index) => (
          <li
            key={index}
            // Retain dark mode list item background but ensure Platinum text
            className="flex justify-between items-center bg-dark-bg p-4 rounded-md text-dark-text"
          >
            <span>
              {member.name} - {member.email}
            </span>
            <button
              onClick={() => handleRemoveMember(index)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={handleFinishSetup}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Finish Team Setup
      </button>
    </div>
  );
};

export default CreateTeamPage;