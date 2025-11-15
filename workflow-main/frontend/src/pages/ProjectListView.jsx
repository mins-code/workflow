import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient'; // Import the centralized API client

const ProjectListView = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]); // State to store the list of teams
  const [selectedProject, setSelectedProject] = useState(null); // Project selected for team assignment
  const [selectedTeamId, setSelectedTeamId] = useState(''); // Team selected in the dropdown
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch projects and teams
  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/projects'); // Use apiClient to fetch projects
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await apiClient.get('/teams'); // Use apiClient to fetch teams
      setTeams(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    // If no token is found, halt data fetching
    if (!token) {
      console.warn('No token found. Skipping data fetching.');
      return;
    }

    // Fetch data only if the token exists
    fetchProjects();
    fetchTeams();
  }, []);

  // Open the modal for team assignment
  const handleAssignTeamClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Handle team selection in the dropdown
  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  // Submit the team assignment
  const handleAssignTeamSubmit = async () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }

    try {
      await apiClient.put(`/projects/${selectedProject.id}`, {
        teamId: selectedTeamId, // Use apiClient to update the project
      });

      // Refresh the project list to reflect the updated team assignment
      await fetchProjects();

      // Close the modal and reset the state
      setIsModalOpen(false);
      setSelectedProject(null);
      setSelectedTeamId('');
    } catch (err) {
      console.error('Failed to assign team:', err);
      alert('Error assigning team. Please try again.');
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiClient.delete(`/projects/${projectId}`); // Use apiClient to delete the project
      await fetchProjects(); // Refresh the project list after deletion
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Error deleting project. Please try again.');
    }
  };

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-page-bg-light p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        {/* CHANGE: Update text color class to Rich Black (text-rich-black) */}
        <h1 className="text-dark-bg text-4xl font-bold">📂 Project Management</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + New Project
        </button>
      </div>

      <div className="grid gap-6">
        {/* Ensure loading text is dark */}
        {projects.length === 0 && <p className="text-gray-800">Loading projects or no data found...</p>}

        {projects.map((project) => (
          <div
            key={project.id}
            // CHANGE 2: Set card background to the lighter color (Periwinkle 2)
            className="bg-card-bg-light p-6 rounded-xl shadow-lg border border-gray-300"
          >
            <h2 className="text-2xl font-bold text-blue-600">{project.title}</h2>
            <p className="text-gray-700">{project.goal}</p>
            {/* Using a neutral gray for muted text against the light card */}
            <p className="text-sm text-gray-600">
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Assigned Team: {project.team ? project.team.name : 'None'}
            </p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Decompose Project
              </button>
              <button
                onClick={() => handleAssignTeamClick(project)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Assign Team
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Assign Team to Project</h2>
            <p className="text-gray-600 mb-4">
              Assigning team to: <strong>{selectedProject?.title}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select Team</label>
              <select
                value={selectedTeamId}
                onChange={handleTeamChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" className="text-black">-- Select a Team --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAssignTeamSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
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