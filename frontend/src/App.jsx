import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateProjectForm from './components/CreateProjectForm';

function App() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null); // Track loading state for buttons
  const [decomposedTasks, setDecomposedTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = () => {
    fetchProjects(); // Refresh the project list after creating a new project
  };

  const handleDecompose = async (projectId) => {
    setLoadingProjectId(projectId); // Set loading state for the specific project
    try {
      const res = await axios.post(`http://localhost:3000/api/projects/${projectId}/decompose`);
      setDecomposedTasks(res.data.createdTasks); // Store decomposed tasks
      fetchProjects(); // Refresh the project list after decomposition
    } catch (error) {
      console.error('Failed to decompose project:', error);
      alert('Error decomposing project. Please try again.');
    } finally {
      setLoadingProjectId(null); // Clear loading state
    }
  };

  // Add handleAutoAssign function
  const handleAutoAssign = async (projectId) => {
    setLoadingProjectId(projectId); // Set loading state for the specific project
    try {
      const res = await axios.post(`http://localhost:3000/api/projects/${projectId}/auto-assign`);
      setAssignments(res.data); // Store assignments
      fetchProjects(); // Refresh the project list after auto-assignment
    } catch (error) {
      console.error('Failed to auto-assign tasks:', error);
      alert('Error auto-assigning tasks. Please try again.');
    } finally {
      setLoadingProjectId(null); // Clear loading state
    }
  };

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">🚀 Work Management Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Projects</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + New Project
        </button>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 && <p>Loading projects or no data found...</p>}

        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600">{project.title}</h2>
            <p className="text-gray-500">{project.goal}</p>
            <p className="text-sm text-gray-400">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDecompose(project.id)}
                className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition ${
                  loadingProjectId === project.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loadingProjectId === project.id}
              >
                {loadingProjectId === project.id ? 'Decomposing...' : '✨ Decompose Project'}
              </button>
              <button
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
                  loadingProjectId === project.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleAutoAssign(project.id)}
                disabled={loadingProjectId === project.id}
              >
                {loadingProjectId === project.id ? 'Auto Assigning...' : '🤖 Auto Assign'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateProjectForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Modals for Decomposed Tasks and Assignments */}
      {decomposedTasks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setDecomposedTasks([])}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Decomposed Tasks</h2>
            <ul className="space-y-2">
              {decomposedTasks.map((task, index) => (
                <li key={index} className="border p-2 rounded">
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                  <p>Estimated Hours: {task.estimatedHours}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {assignments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setAssignments([])}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Task Assignments</h2>
            <ul className="space-y-2">
              {assignments.map((assignment, index) => (
                <li key={index} className="border p-2 rounded">
                  <strong>Task: {assignment.taskTitle}</strong>
                  <p>Assigned to: {assignment.assigneeName}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;