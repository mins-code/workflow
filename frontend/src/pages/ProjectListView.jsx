import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProjectListView = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📂 Project Management</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + New Project
        </button>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 && <p>Loading projects or no data found...</p>}

        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate(`/projects/${project.id}`)} // Navigate to project detail view
          >
            <h2 className="text-2xl font-bold text-blue-600">{project.title}</h2>
            <p className="text-gray-500">{project.goal}</p>
            <p className="text-sm text-gray-400">
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectListView;