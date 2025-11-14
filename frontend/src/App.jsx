import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Teams from './pages/Teams';
import ProjectListView from './pages/ProjectListView'; // Import the renamed component
import NewProject from './pages/NewProject';
import ProjectDetailView from './pages/ProjectDetailView'; // Import the new Project Detail View
import Analytics from './pages/Analytics';
import AuthForm from './components/AuthForm';
import CreateTeamPage from './pages/CreateTeamPage';

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

        <div className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/new" element={<CreateTeamPage />} />
            <Route path="/projects" element={<ProjectListView />} /> {/* Project List */}
            <Route path="/projects/new" element={<NewProject />} /> {/* Project Creation */}
            <Route path="/projects/:projectId" element={<ProjectDetailView />} /> {/* Project Detail */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/projects" />} /> {/* Default to Project List */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;