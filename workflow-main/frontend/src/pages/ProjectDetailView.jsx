import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProjectDetailView = () => {
  const { projectId } = useParams(); // Extract projectId from the URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch project details and tasks securely
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      // Fetch project details
      const projectRes = await axios.get(`http://localhost:3000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(projectRes.data);

      // Fetch tasks for the project
      const tasksRes = await axios.get(`http://localhost:3000/api/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch project details.');
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Handle drag start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const token = localStorage.getItem('token');

    try {
      // Update task status in the backend
      await axios.put(
        `http://localhost:3000/api/projects/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // Filter tasks by status
  const tasksByStatus = (status) => tasks.filter((task) => task.status === status);

  if (error) {
    return <div className="p-10 text-red-500 font-bold">❌ Error: {error}</div>;
  }

  if (!project) {
    return <div className="p-10 text-gray-500">Loading project details...</div>;
  }

  return (
    // CHANGE: Set the main background to Platinum (#e0e1dd)
    <div className="min-h-screen bg-[#e0e1dd] p-8 font-sans">
      <h1 className="text-dark-bg">📂 Project Management</h1>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{project.title}</h1>
      <p className="text-gray-600 mb-4">{project.goal}</p>
      <p className="text-sm text-gray-400 mb-6">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>

      {/* Assigned Team Members Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Team Members</h2>
        {project.team && project.team.members.length > 0 ? (
          <ul className="list-disc pl-6">
            {project.team.members.map((member) => (
              <li key={member.id} className="text-gray-700">
                {member.name} - {member.role}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No team members assigned to this project.</p>
        )}
      </div>

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
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                  task.assignee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {task.assignee?.name || 'Unassigned'}
              </span>
              {task.assignee && (
                <p className="text-xs text-gray-500 mt-1">
                  Capacity: {task.assignee.maxHours} hrs
                </p>
              )}
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
              <h3 className="text-lg font-semibold text-yellow-600">
                {task.title}
                {task.assignee && (
                  <span className="text-sm text-gray-500"> (Assigned to: {task.assignee.name})</span>
                )}
              </h3>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
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
              <h3 className="text-lg font-semibold text-green-600">
                {task.title}
                {task.assignee && (
                  <span className="text-sm text-gray-500"> (Assigned to: {task.assignee.name})</span>
                )}
              </h3>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;