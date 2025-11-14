import React, { useState } from 'react';
import CreateProjectForm from '../components/CreateProjectForm';

const NewProject = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleProjectCreated = () => {
    alert('Project created successfully!');
    setIsFormOpen(false); // Close the form after successful submission
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Create a New Project</h1>
      {isFormOpen ? (
        <CreateProjectForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      ) : (
        <p className="text-gray-600">Project creation form is closed.</p>
      )}
    </div>
  );
};

export default NewProject;