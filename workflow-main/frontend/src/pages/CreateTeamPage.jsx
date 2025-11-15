import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTeamPage = () => {
  const [step, setStep] = useState(1);
  const [teamData, setTeamData] = useState({ name: '', description: '' });
  const [newTeamId, setNewTeamId] = useState(null);
  const [onboardedMembers, setOnboardedMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Developer' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleTeamInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/teams',
        teamData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTeamId(res.data.id);
      setStep(2);
    } catch (err) {
      setError('Failed to create team.');
      console.error(err);
    }
  };

  const handleAddMemberToList = (e) => {
    e.preventDefault();
    setOnboardedMembers((prev) => [...prev, newMember]);
    setNewMember({ name: '', email: '', role: 'Developer' });
  };

  const handleRemoveMember = (index) => {
    setOnboardedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinishSetup = async () => {
    try {
      const token = localStorage.getItem('token');

      for (const member of onboardedMembers) {
        const onboardRes = await axios.post(
          'http://localhost:3000/api/members/onboard',
          { ...member, skills: {}, availability: 1.0, maxHours: 40 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newUser = onboardRes.data;

        await axios.put(
          `http://localhost:3000/api/members/${newUser.id}`,
          { teamId: newTeamId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigate('/teams');
    } catch (err) {
      setError('Failed to finish team setup.');
      console.error(err);
    }
  };

  if (step === 1) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="app-heading mb-2">Create New Team</h1>
          <p className="text-dark-text-secondary">Set up your team details</p>
        </div>
        
        {error && (
          <div className="mb-6 app-card bg-error bg-opacity-10 border-error">
            <p className="text-error font-semibold">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleCreateTeam} className="app-card">
          <div className="space-y-6">
            <div>
              <label className="app-label">Team Name</label>
              <input
                type="text"
                name="name"
                value={teamData.name}
                onChange={handleTeamInputChange}
                className="app-input"
                placeholder="Engineering Team"
                required
              />
            </div>
            
            <div>
              <label className="app-label">Description</label>
              <textarea
                name="description"
                value={teamData.description}
                onChange={handleTeamInputChange}
                className="app-textarea h-32"
                placeholder="A brief description of the team's purpose and responsibilities..."
                rows="4"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Team →
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="app-heading mb-2">Onboard Team Members</h1>
        <p className="text-dark-text-secondary">Add members to your new team</p>
      </div>
      
      {error && (
        <div className="mb-6 app-card bg-error bg-opacity-10 border-error">
          <p className="text-error font-semibold">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleAddMemberToList} className="app-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="app-label">Name</label>
            <input
              type="text"
              name="name"
              value={newMember.name}
              onChange={handleMemberInputChange}
              className="app-input"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="app-label">Email</label>
            <input
              type="email"
              name="email"
              value={newMember.email}
              onChange={handleMemberInputChange}
              className="app-input"
              placeholder="john@company.com"
              required
            />
          </div>
          
          <div>
            <label className="app-label">Role</label>
            <input
              type="text"
              name="role"
              value={newMember.role}
              onChange={handleMemberInputChange}
              className="app-input"
              placeholder="Developer"
              required
            />
          </div>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          + Add Member to List
        </button>
      </form>

      <div className="app-card">
        <h2 className="app-subheading mb-4">
          Onboarded Members ({onboardedMembers.length})
        </h2>
        
        {onboardedMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-muted">No members added yet. Add your first member above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onboardedMembers.map((member, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-dark-surface-light p-4 rounded-xl"
              >
                <div>
                  <p className="text-dark-text font-semibold">{member.name}</p>
                  <p className="text-dark-text-secondary text-sm">{member.email} • {member.role}</p>
                </div>
                <button
                  onClick={() => handleRemoveMember(index)}
                  className="btn-danger px-3 py-2 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-dark-border">
          <button
            onClick={() => navigate('/teams')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleFinishSetup}
            className="btn-primary"
            disabled={onboardedMembers.length === 0}
          >
            Finish Team Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;