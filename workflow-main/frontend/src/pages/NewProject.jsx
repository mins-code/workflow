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

  return <CreateProjectForm onCreate={handleCreateProject} />;
};

export default NewProject;