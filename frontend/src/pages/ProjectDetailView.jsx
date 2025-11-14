import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProjectDetailView = () => {
  const { projectId } = useParams(); // Extract projectId from the URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch project details and tasks
  const fetchProjectDetails = async () => {
    try {
      const projectRes = await axios.get(`http://localhost:3000/api/projects/${projectId}`);
      setProject(projectRes.data);

      const tasksRes = await axios.get(`http://localhost:3000/api/projects/${projectId}/tasks`);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Handle drag-and-drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    try {
      // Update task status in the backend
      await axios.put(`http://localhost:3000/api/projects/tasks/${taskId}`, { status: newStatus });

      // Update task status in local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Error updating task status. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-10 text-gray-500">Loading project details...</div>;
  }

  // Filter tasks by status
  const tasksByStatus = (status) => tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{project.title}</h1>
      <p className="text-gray-600 mb-4">{project.goal}</p>
      <p className="text-sm text-gray-400 mb-6">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>

      <div className="grid grid-cols-3 gap-6">
        {/* To Do Column */}
        <div
          className="bg-white p-4 rounded-lg shadow-md"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'TODO')}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">To Do</h2>
          {tasksByStatus('TODO').map((task) => (
            <div
              key={task.id}
              className="bg-gray-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-blue-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-xs text-gray-400">Estimated Hours: {task.estimatedHours}</p>
            </div>
          ))}
        </div>

        {/* In Progress Column */}
        <div
          className="bg-white p-4 rounded-lg shadow-md"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">In Progress</h2>
          {tasksByStatus('IN_PROGRESS').map((task) => (
            <div
              key={task.id}
              className="bg-yellow-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-yellow-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-xs text-gray-400">Estimated Hours: {task.estimatedHours}</p>
            </div>
          ))}
        </div>

        {/* Done Column */}
        <div
          className="bg-white p-4 rounded-lg shadow-md"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'DONE')}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Done</h2>
          {tasksByStatus('DONE').map((task) => (
            <div
              key={task.id}
              className="bg-green-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-green-600">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-xs text-gray-400">Estimated Hours: {task.estimatedHours}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;