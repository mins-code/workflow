import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import CreateProjectForm from '../components/CreateProjectForm';

const NewProject = () => {
  const navigate = useNavigate();

  const handleCreateProject = async ({ title, goal, deadline }) => {
    try {
      await apiClient.post('/projects', { title, goal, deadline });
      navigate('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="app-heading mb-2">Create New Project</h1>
          <p className="text-dark-text-secondary">Set up a new project with goals and timeline</p>
        </div>
        <CreateProjectForm onCreate={handleCreateProject} />
      </div>
    </div>
  );
};

export default NewProject;