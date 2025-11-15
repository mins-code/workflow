import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Teams from './pages/Teams';
import ProjectListView from './pages/ProjectListView';
import NewProject from './pages/NewProject';
import ProjectDetailView from './pages/ProjectDetailView';
import Analytics from './pages/Analytics';
import AuthForm from './components/AuthForm';
import CreateTeamPage from './pages/CreateTeamPage';
import GeminiChatView from './pages/GeminiChatView'; // Import the new Chatbot component

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        {/* CHANGE: Use bg-transparent so the body background shows through */}
        <div className="flex-1 ml-64 p-6 bg-transparent min-h-screen">
          <Routes>
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/new" element={<CreateTeamPage />} />
            <Route path="/projects" element={<ProjectListView />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:projectId" element={<ProjectDetailView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/chatbot" element={<GeminiChatView />} /> {/* Correctly mapped Chatbot route */}
            <Route path="*" element={<Navigate to="/projects" />} /> {/* Default route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;