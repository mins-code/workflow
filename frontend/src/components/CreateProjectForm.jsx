import React, { useState } from 'react';
import apiClient from '../api/apiClient'; // Replace axios with the centralized API client

const CreateProjectForm = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    deadline: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update formData state when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use apiClient to send the POST request
      await apiClient.post('/projects', {
        title: formData.title,
        goal: formData.goal,
        deadline: formData.deadline,
        teamId: '1', // Replace with the actual team ID if needed
      });

      setFormData({ title: '', goal: '', deadline: '' }); // Reset form
      onProjectCreated(); // Refresh the project list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Goal</label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;