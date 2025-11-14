import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GeminiChatView = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the list of projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !userInput) {
      alert('Please select a project and enter your input.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/gemini/plan',
        { projectId: selectedProjectId, userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Append the response to the chat history
      setChatHistory((prev) => [
        ...prev,
        { user: userInput, response: res.data },
      ]);
      setUserInput(''); // Clear the input field
    } catch (err) {
      setError('Failed to generate task plan.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">🤖 Gemini Chatbot</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Project Selection and Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Input</label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter your request or guidance for task planning..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </form>

      {/* Chat History */}
      <div className="space-y-4">
        {chatHistory.map((chat, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
            <p className="text-sm text-gray-600">
              <strong>You:</strong> {chat.user}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Gemini:</strong>
            </p>
            <pre className="bg-gray-200 p-2 rounded-md text-sm mt-1">
              {JSON.stringify(chat.response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeminiChatView;