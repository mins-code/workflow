import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All available users
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  // Fetch current user info from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  // Fetch all users for assignment dropdown
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch project details and tasks
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      const projectRes = await axios.get(`http://localhost:3000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(projectRes.data);

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
    fetchAllUsers();
  }, [projectId]);

  // Check if current user is a manager
  const isManager = () => {
    return currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Senior Dev');
  };

  // Handle drag start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop (status change)
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `http://localhost:3000/api/projects/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // Open assign modal
  const handleAssignClick = (task) => {
    if (!isManager()) {
      alert('Only managers can assign tasks');
      return;
    }
    setSelectedTask(task);
    setSelectedAssigneeId(task.assigneeId || '');
    setIsAssignModalOpen(true);
  };

  // Handle manual assignment
  const handleManualAssign = async () => {
    if (!selectedTask) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://localhost:3000/api/projects/tasks/${selectedTask.id}/assign`,
        { assigneeId: selectedAssigneeId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the task in local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? response.data : task
        )
      );

      setIsAssignModalOpen(false);
      setSelectedTask(null);
      setSelectedAssigneeId('');
      
      // Show success message
      alert('Task assigned successfully!');
    } catch (err) {
      console.error('Failed to assign task:', err);
      if (err.response?.status === 403) {
        alert('You do not have permission to assign tasks');
      } else {
        alert('Error assigning task. Please try again.');
      }
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
    <div className="min-h-screen bg-[#e0e1dd] p-8 font-sans">
      <h1 className="text-dark-bg">📂 Project Management</h1>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{project.title}</h1>
      <p className="text-gray-600 mb-4">{project.goal}</p>
      <p className="text-sm text-gray-400 mb-6">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>

      {/* User Role Indicator */}
      {currentUser && (
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-gray-800 font-medium">
            Logged in as: <strong>{currentUser.email}</strong> ({currentUser.role})
            {isManager() && <span className="ml-2 text-green-700 font-semibold">✓ Can assign tasks</span>}
          </p>
        </div>
      )}

      {/* Assigned Team Members Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Team Members</h2>
        {project.team && project.team.members.length > 0 ? (
          <ul className="list-disc pl-6">
            {project.team.members.map((member) => (
              <li key={member.id} className="text-gray-800 font-medium">
                {member.name} - {member.role}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 font-medium">No team members assigned to this project.</p>
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
              className="bg-gray-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer relative"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-blue-600">{task.title}</h3>
              <p className="text-sm text-gray-700 font-medium">Status: {task.status}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-bold rounded-full ${
                  task.assignee ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                }`}
              >
                {task.assignee?.name || 'Unassigned'}
              </span>
              {task.assignee && (
                <p className="text-xs text-gray-700 font-medium mt-1">
                  Capacity: {task.assignee.maxHours} hrs
                </p>
              )}
              {isManager() && (
                <button
                  onClick={() => handleAssignClick(task)}
                  className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 font-semibold"
                >
                  Assign
                </button>
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
              className="bg-yellow-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer relative"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-yellow-700">
                {task.title}
                {task.assignee && (
                  <span className="text-sm text-gray-700 font-medium"> (Assigned to: {task.assignee.name})</span>
                )}
              </h3>
              <p className="text-sm text-gray-700 font-medium">Status: {task.status}</p>
              {isManager() && (
                <button
                  onClick={() => handleAssignClick(task)}
                  className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 font-semibold"
                >
                  Reassign
                </button>
              )}
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
              className="bg-green-100 p-4 rounded-md shadow-sm mb-4 cursor-pointer relative"
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
            >
              <h3 className="text-lg font-semibold text-green-700">
                {task.title}
                {task.assignee && (
                  <span className="text-sm text-gray-700 font-medium"> (Assigned to: {task.assignee.name})</span>
                )}
              </h3>
              <p className="text-sm text-gray-700 font-medium">Status: {task.status}</p>
              {isManager() && (
                <button
                  onClick={() => handleAssignClick(task)}
                  className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 font-semibold"
                >
                  Reassign
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 font-bold text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Assign Task</h2>
            <p className="text-gray-700 mb-4 font-medium">
              Task: <strong className="text-gray-900">{selectedTask.title}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-2">Select Team Member</label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full border-2 border-gray-400 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
                style={{ color: '#1f2937' }}
              >
                <option value="" className="text-gray-900 font-medium">-- Unassign Task --</option>
                {allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <option key={user.id} value={user.id} className="text-gray-900 font-medium">
                      {user.name} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled className="text-gray-600">No users available</option>
                )}
              </select>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {allUsers.length} user(s) available for assignment
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="bg-gray-400 text-gray-900 px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAssign}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-semibold"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;