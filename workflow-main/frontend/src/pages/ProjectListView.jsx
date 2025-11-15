// frontend/src/pages/ProjectListView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ProjectListView = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await apiClient.get('/teams');
      setTeams(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. Skipping data fetching.');
      return;
    }
    fetchProjects();
    fetchTeams();
  }, []);

  const handleAssignTeamClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleAssignTeamSubmit = async () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }

    try {
      await apiClient.put(`/projects/${selectedProject.id}`, {
        teamId: selectedTeamId,
      });
      await fetchProjects();
      setIsModalOpen(false);
      setSelectedProject(null);
      setSelectedTeamId('');
    } catch (err) {
      console.error('Failed to assign team:', err);
      alert('Error assigning team. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiClient.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Error deleting project. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="p-10">
        <div className="app-card bg-error bg-opacity-10 border-error">
          <p className="text-error font-bold">❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="app-heading">📂 Project Management</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary"
        >
          + New Project
        </button>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 && (
          <div className="app-card text-center py-12">
            <p className="text-dark-muted text-lg">No projects found. Create your first project!</p>
          </div>
        )}

        {projects.map((project) => (
          <div key={project.id} className="app-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-dark-text mb-2">{project.title}</h2>
                <p className="text-dark-text-secondary mb-3">{project.goal}</p>
                <div className="flex gap-4 text-sm text-dark-muted">
                  <span className="flex items-center gap-1">
                    📅 Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    👥 Team: {project.team ? project.team.name : 'None'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="btn-primary flex-1"
              >
                📋 View Tasks
              </button>
              <button
                onClick={() => handleAssignTeamClick(project)}
                className="btn-secondary"
              >
                👥 Assign Team
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="btn-danger"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Team Modal */}
      {isModalOpen && (
        <div className="app-modal">
          <div className="app-modal-content">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-dark-muted hover:text-dark-text transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            
            <h2 className="app-subheading mb-6">Assign Team to Project</h2>
            <p className="text-dark-text-secondary mb-4">
              Assigning team to: <strong className="text-dark-text">{selectedProject?.title}</strong>
            </p>
            
            <div className="mb-6">
              <label className="app-label">Select Team</label>
              <select
                value={selectedTeamId}
                onChange={handleTeamChange}
                className="app-select"
              >
                <option value="">-- Select a Team --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeamSubmit}
                className="btn-primary"
              >
                Assign Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListView;