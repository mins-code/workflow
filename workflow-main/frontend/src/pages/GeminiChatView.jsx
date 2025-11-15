import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const GeminiChatView = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Chat history state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch the list of projects
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

  // Utility function to format the task plan JSON into readable text
  const formatTaskPlan = (tasks) => {
    return tasks
      .map(
        (task) =>
          `✅ **${task.title}**\n📄 ${task.description}\n⏳ Estimated Hours: ${task.estimatedHours}\n👤 Assigned to: **${task.idealAssigneeName || 'Unassigned'}**`
      )
      .join('\n\n');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !userInput) {
      alert('Please select a project and enter your input.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user input to chat history
    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', message: userInput },
    ]);

    try {
      const res = await apiClient.post('/gemini/plan', {
        projectId: selectedProjectId,
        userInput,
      });

      // Add AI response to chat history
      const formattedResponse = formatTaskPlan(res.data);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', message: formattedResponse, rawTasks: res.data }, // Store raw tasks for saving
      ]);
      setUserInput(''); // Clear the input field
    } catch (err) {
      setError('Failed to generate task plan.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save tasks to the project
  const handleSaveTasks = async () => {
    try {
      // Helper function to look up a user's ID by their name
      const lookupUserId = async (name) => {
        if (!name) return null; // If no name is provided, return null
        try {
          const response = await apiClient.get(
            `/members/find-by-name?name=${encodeURIComponent(name)}`
          );
          return response.data?.id || null; // Return the user's ID or null if not found
        } catch (err) {
          console.error(`Failed to look up user ID for name "${name}":`, err);
          return null; // Return null if the lookup fails
        }
      };

      // Get the latest AI response from the chat history
      const latestAIResponse = chatHistory
        .slice()
        .reverse()
        .find((chat) => chat.sender === 'ai' && chat.rawTasks);

      if (!latestAIResponse) {
        alert('No tasks available to save.');
        return;
      }

      const rawTasks = latestAIResponse.rawTasks;

      // Map tasks to include assigneeId and remove idealAssigneeName
      const tasksToSave = await Promise.all(
        rawTasks.map(async (task) => {
          const assigneeId = await lookupUserId(task.idealAssigneeName); // Look up the user ID
          return {
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            projectId: selectedProjectId, // Add the current project ID
            assigneeId, // Set the assigneeId
          };
        })
      );

      // Send the tasks to the backend
      await apiClient.post('/projects/tasks/bulk', { tasks: tasksToSave });

      // Show success message and navigate to the projects page
      alert('Tasks saved successfully!');
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save tasks:', err);
      alert('Error saving tasks. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">🤖 Gemini Chatbot</h1>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-4 rounded-lg shadow-md max-w-lg ${
                chat.sender === 'user'
                  ? 'bg-green-500 text-white text-right'
                  : 'bg-gray-200 text-gray-800 text-left'
              }`}
            >
              {chat.sender === 'ai' ? (
                <pre className="whitespace-pre-wrap">{chat.message}</pre>
              ) : (
                <p>{chat.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 shadow-md flex items-center space-x-4"
      >
        <div className="flex items-center gap-4 w-full">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-black border rounded px-2 py-1 w-1/6"
          >
            <option value="" className="text-black">
              -- Select a Project --
            </option>
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
            className="text-black border rounded px-2 py-1 w-4/6"
            placeholder="Enter your request or guidance for task planning..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-1/6 hover:bg-blue-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Save Tasks Button */}
      {chatHistory.some((chat) => chat.sender === 'ai') && (
        <div className="p-4 bg-gray-100 shadow-md">
          <button
            onClick={handleSaveTasks}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Save Tasks to Project
          </button>
        </div>
      )}
    </div>
  );
};

export default GeminiChatView;