import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const GeminiChatView = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiClient.get('/projects');
        setProjects(res.data);
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  const formatTaskPlan = (tasks) => {
    return tasks
      .map(
        (task) =>
          `✅ **${task.title}**\n📄 ${task.description}\n⏳ Estimated Hours: ${task.estimatedHours}\n👤 Assigned to: **${task.idealAssigneeName || 'Unassigned'}**`
      )
      .join('\n\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !userInput) {
      alert('Please select a project and enter your input.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', message: userInput },
    ]);

    try {
      const res = await apiClient.post('/gemini/plan', {
        projectId: selectedProjectId,
        userInput,
      });

      const formattedResponse = formatTaskPlan(res.data);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', message: formattedResponse, rawTasks: res.data },
      ]);
      setUserInput('');
    } catch (err) {
      setError('Failed to generate task plan.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      const lookupUserId = async (name) => {
        if (!name) return null;
        try {
          const response = await apiClient.get(
            `/members/find-by-name?name=${encodeURIComponent(name)}`
          );
          return response.data?.id || null;
        } catch (err) {
          console.error(`Failed to look up user ID for name "${name}":`, err);
          return null;
        }
      };

      const latestAIResponse = chatHistory
        .slice()
        .reverse()
        .find((chat) => chat.sender === 'ai' && chat.rawTasks);

      if (!latestAIResponse) {
        alert('No tasks available to save.');
        return;
      }

      const rawTasks = latestAIResponse.rawTasks;

      const tasksToSave = await Promise.all(
        rawTasks.map(async (task) => {
          const assigneeId = await lookupUserId(task.idealAssigneeName);
          return {
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            projectId: selectedProjectId,
            assigneeId,
          };
        })
      );

      await apiClient.post('/projects/tasks/bulk', { tasks: tasksToSave });

      alert('Tasks saved successfully!');
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save tasks:', err);
      alert('Error saving tasks. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-primary p-6 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Task Planner</h1>
            <p className="text-white text-opacity-80 text-sm">Generate intelligent task breakdowns for your projects</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-bg">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <span className="text-6xl mb-4 block">💬</span>
              <h2 className="app-subheading mb-2">Start a Conversation</h2>
              <p className="text-dark-text-secondary">
                Select a project and describe your requirements. I'll help you break it down into actionable tasks.
              </p>
            </div>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 shadow-card ${
                  chat.sender === 'user'
                    ? 'bg-gradient-primary text-white'
                    : 'app-card'
                }`}
              >
                {chat.sender === 'ai' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🤖</span>
                      <span className="text-primary font-semibold">AI Assistant</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-dark-text font-sans leading-relaxed">
                      {chat.message}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">👤</span>
                      <span className="font-semibold">You</span>
                    </div>
                    <p className="leading-relaxed">{chat.message}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="app-card max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <span className="text-primary font-semibold">AI Assistant is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-dark-surface border-t border-dark-border p-4 shadow-card"
      >
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="app-select w-64"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="app-input flex-1"
            placeholder="Describe your task requirements..."
          />
          
          <button
            type="submit"
            className="btn-primary px-8"
            disabled={isLoading || !selectedProjectId || !userInput}
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Save Tasks Button */}
      {chatHistory.some((chat) => chat.sender === 'ai') && (
        <div className="p-4 bg-dark-surface border-t border-dark-border">
          <div className="max-w-6xl mx-auto flex justify-end">
            <button
              onClick={handleSaveTasks}
              className="btn-primary flex items-center gap-2"
            >
              <span>💾</span>
              Save Tasks to Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChatView;