import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateProjectForm from './components/CreateProjectForm';

const Dashboard = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const handleProjectCreated = () => {
    fetchProjects(); // Refresh the project list after creating a new project
  };

  const tasksByStatus = (status) => tasks.filter((task) => task.status === status);

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🚀 Work Management Dashboard</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Projects</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">To Do</h2>
          {tasksByStatus('TODO').map((task) => (
            <div
              key={task.id}
              className="bg-gray-100 p-4 rounded-md shadow-sm mb-4"
            >
              <h3 className="text-lg font-semibold text-blue-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-sm text-gray-500">
                Assigned to: {task.assignee ? task.assignee.name : 'None'}
              </p>
              {task.assignee && (
                <p className="text-xs text-gray-500">
                  Capacity: {task.assignee.assignedHours}/{task.assignee.maxHours} hrs
                </p>
              )}
            </div>
          ))}
        </div>

        {/* In Progress Column */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">In Progress</h2>
          {tasksByStatus('IN_PROGRESS').map((task) => (
            <div
              key={task.id}
              className="bg-yellow-100 p-4 rounded-md shadow-sm mb-4"
            >
              <h3 className="text-lg font-semibold text-yellow-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-sm text-gray-500">
                Assigned to: {task.assignee ? task.assignee.name : 'None'}
              </p>
              {task.assignee && (
                <p className="text-xs text-gray-500">
                  Capacity: {task.assignee.assignedHours}/{task.assignee.maxHours} hrs
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Done Column */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Done</h2>
          {tasksByStatus('DONE').map((task) => (
            <div
              key={task.id}
              className="bg-green-100 p-4 rounded-md shadow-sm mb-4"
            >
              <h3 className="text-lg font-semibold text-green-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-sm text-gray-500">
                Assigned to: {task.assignee ? task.assignee.name : 'None'}
              </p>
              {task.assignee && (
                <p className="text-xs text-gray-500">
                  Capacity: {task.assignee.assignedHours}/{task.assignee.maxHours} hrs
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <CreateProjectForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Dashboard;