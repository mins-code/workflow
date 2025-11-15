// frontend/src/pages/ProjectDetailView.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

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

  const isManager = () => {
    return currentUser && (currentUser.role === 'Manager' || currentUser.role === 'Senior Dev');
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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

  const handleAssignClick = (task) => {
    if (!isManager()) {
      alert('Only managers can assign tasks');
      return;
    }
    setSelectedTask(task);
    setSelectedAssigneeId(task.assigneeId || '');
    setIsAssignModalOpen(true);
  };

  const handleManualAssign = async () => {
    if (!selectedTask) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://localhost:3000/api/projects/tasks/${selectedTask.id}/assign`,
        { assigneeId: selectedAssigneeId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? response.data : task
        )
      );

      setIsAssignModalOpen(false);
      setSelectedTask(null);
      setSelectedAssigneeId('');
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

  const tasksByStatus = (status) => tasks.filter((task) => task.status === status);

  const statusConfig = {
    TODO: { label: 'To Do', color: 'border-primary', bgColor: 'bg-primary bg-opacity-10' },
    IN_PROGRESS: { label: 'In Progress', color: 'border-warning', bgColor: 'bg-warning bg-opacity-10' },
    DONE: { label: 'Done', color: 'border-success', bgColor: 'bg-success bg-opacity-10' },
  };

  if (error) {
    return (
      <div className="p-10">
        <div className="app-card bg-error bg-opacity-10 border-error">
          <p className="text-error font-bold">❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-10">
        <div className="app-card">
          <p className="text-dark-muted">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Project Header */}
      <div className="app-card mb-6">
        <h1 className="app-heading mb-4">{project.title}</h1>
        <p className="text-dark-text-secondary mb-4">{project.goal}</p>
        <div className="flex gap-6 text-sm text-dark-muted">
          <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          <span>👥 Team: {project.team?.name || 'None'}</span>
        </div>
      </div>

      {/* User Role Indicator */}
      {currentUser && (
        <div className="app-card mb-6 bg-primary bg-opacity-10 border-primary">
          <p className="text-dark-text">
            Logged in as: <strong>{currentUser.email}</strong> ({currentUser.role})
            {isManager() && <span className="ml-2 text-success font-semibold">✓ Can assign tasks</span>}
          </p>
        </div>
      )}

      {/* Team Members */}
      <div className="app-card mb-6">
        <h2 className="app-subheading mb-4">Team Members</h2>
        {project.team && project.team.members.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.team.members.map((member) => (
              <span key={member.id} className="px-3 py-1 bg-dark-surface-light rounded-full text-dark-text text-sm">
                {member.name} - {member.role}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-dark-muted">No team members assigned to this project.</p>
        )}
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => {
          const config = statusConfig[status];
          return (
            <div
              key={status}
              className={`app-card ${config.bgColor} border-2 ${config.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <h2 className="app-subheading mb-4">{config.label}</h2>
              <div className="space-y-3">
                {tasksByStatus(status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-dark-surface p-4 rounded-xl shadow-card cursor-move hover:shadow-card-hover transition-all relative"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <h3 className="text-lg font-semibold text-dark-text mb-2">{task.title}</h3>
                    <p className="text-sm text-dark-text-secondary mb-3">{task.description}</p>
                    
                    {task.assignee ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-success bg-opacity-20 text-success rounded-full font-semibold">
                          👤 {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm px-2 py-1 bg-error bg-opacity-20 text-error rounded-full font-semibold">
                        Unassigned
                      </span>
                    )}
                    
                    {isManager() && (
                      <button
                        onClick={() => handleAssignClick(task)}
                        className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedTask && (
        <div className="app-modal">
          <div className="app-modal-content">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-4 right-4 text-dark-muted hover:text-dark-text transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            
            <h2 className="app-subheading mb-6">Assign Task</h2>
            <p className="text-dark-text-secondary mb-4">
              Task: <strong className="text-dark-text">{selectedTask.title}</strong>
            </p>
            
            <div className="mb-6">
              <label className="app-label">Select Team Member</label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="app-select"
              >
                <option value="">-- Unassign Task --</option>
                {allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled>No users available</option>
                )}
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAssign}
                className="btn-primary"
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